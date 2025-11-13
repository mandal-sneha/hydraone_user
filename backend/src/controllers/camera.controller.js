import { Invitation } from "../models/invitation.model.js";
import { User } from "../models/user.model.js";
import { Property } from "../models/property.model.js";
import { flaskEmbeddingService } from "../lib/axios.js";
import FormData from "form-data";
import moment from "moment-timezone";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const SIMILARITY_THRESHOLD = 0.7;
const LOCATION_RADIUS_METERS = 200;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const sendArrivalOtp = async (invitation, guestUserId, guestEmail) => {
  if (!invitation.arrivalOtp || typeof invitation.arrivalOtp.set !== "function")
    invitation.arrivalOtp = new Map();
  const otp = Math.floor(100000 + Math.random() * 900000);
  invitation.arrivalOtp.set(guestUserId, otp.toString());
  await invitation.save();
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT == 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `"HydraOne" <${process.env.EMAIL_USER}>`,
    to: guestEmail,
    subject: "Your Guest Arrival Verification Code",
    html: `<div style="background:#111;color:#fff;padding:40px;text-align:center;font-family:Inter,Arial,sans-serif"><h2 style="color:#8B5CF6">Welcome!</h2><p>Your arrival has been verified. Enter this code:</p><h1 style="letter-spacing:8px;color:#8B5CF6">${otp
      .toString()
      .split("")
      .join(" ")}</h1><p>Use within 10 minutes near the property.</p></div>`,
  });
  return otp;
};

const findDueGuest = async (waterId, userIdToFind) => {
  const invitation = await Invitation.findOne({ hostwaterId: waterId });
  if (!invitation) return { dueGuest: null, invitation: null };
  const now = moment().tz("Asia/Kolkata");
  const status = invitation.invitedGuests.get(userIdToFind);
  const arrivalStr = invitation.arrivalTime.get(userIdToFind);
  if ((status === "accepted" || status === "arrived") && arrivalStr) {
    const arrivalTime = moment.tz(arrivalStr, "h:mm A", "Asia/Kolkata");
    if (!arrivalTime.isValid()) return { dueGuest: null, invitation: null };
    arrivalTime.set({ year: now.year(), month: now.month(), date: now.date() });
    if (
      now.isBetween(
        arrivalTime.clone().subtract(10, "minutes"),
        arrivalTime.clone().add(10, "minutes")
      )
    ) {
      const guestUser = await User.findOne({ userId: userIdToFind });
      return { dueGuest: guestUser, invitation };
    }
  }
  return { dueGuest: null, invitation: null };
};

export const verifyGuestArrival = async (req, res) => {
  try {
    const { waterid } = req.params;
    const { userId } = req.body;
    if (!req.files?.image)
      return res
        .status(400)
        .json({ success: false, message: "No image frame provided." });
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "No userId provided." });
    const { dueGuest, invitation } = await findDueGuest(waterid, userId);
    if (!dueGuest)
      return res.status(200).json({
        success: true,
        match: false,
        message: "This guest is not scheduled for arrival at this time.",
      });
    const form = new FormData();
    form.append("image", req.files.image.data, {
      filename: req.files.image.name,
      contentType: req.files.image.mimetype,
    });
    form.append("stored_embedding", JSON.stringify(dueGuest.embeddingVector));
    let comparisonRes;
    try {
      comparisonRes = await flaskEmbeddingService.post("/compare-faces", form, {
        headers: {
          ...form.getHeaders(),
          "Content-Type": `multipart/form-data; boundary=${form.getBoundary()}`,
        },
        timeout: 10000,
      });
    } catch {
      return res
        .status(503)
        .json({ success: false, message: "Comparison service failed." });
    }
    const score = comparisonRes.data.similarity_score;
    const match = score > SIMILARITY_THRESHOLD;
    if (match && invitation.invitedGuests.get(dueGuest.userId) !== "arrived") {
      invitation.invitedGuests.set(dueGuest.userId, "arrived");
      await invitation.save();
      try {
        await sendArrivalOtp(invitation, dueGuest.userId, dueGuest.email);
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: "Face verified but failed to send OTP email.",
          error: e.message,
        });
      }
    }
    return res.status(200).json({
      success: true,
      match,
      score,
      userId: dueGuest.userId,
      guestEmail: dueGuest.email,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during face verification.",
      error: error.message,
    });
  }
};

export const verifyArrivalOtp = async (req, res) => {
  try {
    const { hostwaterId, userId, otp, currentCoordinates } = req.body;
    if (!hostwaterId || !userId || !otp || !currentCoordinates)
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    const invitation = await Invitation.findOne({ hostwaterId });
    if (!invitation)
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found." });
    const storedOtp = invitation.arrivalOtp.get(userId);
    if (!storedOtp)
      return res
        .status(400)
        .json({ success: false, message: "No arrival OTP found for this user." });
    if (storedOtp !== otp)
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP." });
    const rootId = hostwaterId.split("_")[0];
    const property = await Property.findOne({ rootId });
    if (!property?.exactLocation)
      return res
        .status(404)
        .json({ success: false, message: "Property location not found." });
    const raw = property.exactLocation.split(",").map((v) => parseFloat(v.trim()));
    if (raw.length !== 2 || raw.some(isNaN))
      return res
        .status(500)
        .json({ success: false, message: "Invalid property location data." });
    const [a, b] = raw;
    const propLatLng = [
      { lat: a, lng: b },
      { lat: b, lng: a },
    ];
    const guestLat = parseFloat(currentCoordinates.lat);
    const guestLng = parseFloat(currentCoordinates.lng);
    const distances = propLatLng.map((p) =>
      getDistance(p.lat, p.lng, guestLat, guestLng)
    );
    const distance = Math.min(...distances);
    if (distance > LOCATION_RADIUS_METERS)
      return res.status(400).json({
        success: false,
        message: `You must be within ${LOCATION_RADIUS_METERS} meters of the property to verify. Detected ≈${Math.round(
          distance
        )} m away.`,
      });
    invitation.arrivalOtp.delete(userId);
    await invitation.save();
    return res
      .status(200)
      .json({ success: true, message: "OTP verified. Welcome!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification.",
      error: error.message,
    });
  }
};