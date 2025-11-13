import { User } from "../models/user.model.js";
import { Family } from "../models/family.model.js";
import { Property } from "../models/property.model.js";
import { Invitation } from "../models/invitation.model.js";
import { Verification } from "../models/verification.model.js";
import { generateToken } from "../utils/generate.token.js";
import { flaskEmbeddingService } from "../lib/axios.js";
import { v2 as cloudinary } from "cloudinary";
import FormData from "form-data";
import dotenv from "dotenv";
import streamifier from "streamifier";
import moment from "moment-timezone";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const convertMapToObject = (mapData) => {
  if (!mapData) return {};

  if (mapData.constructor === Object) return mapData;
  if (mapData instanceof Map) return Object.fromEntries(mapData);
  if (typeof mapData.toObject === "function") return mapData.toObject();
  if (typeof mapData.entries === "function")
    return Object.fromEntries(mapData.entries());

  return {};
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;

  const formats = [
    "YYYY-MM-DD",
    "MM-DD-YYYY",
    "DD-MM-YYYY",
    "YYYY/MM/DD",
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    moment.ISO_8601,
  ];

  for (const format of formats) {
    const date = moment(dateStr, format, true);
    if (date.isValid()) return date;
  }

  const date = moment(dateStr);
  return date.isValid() ? date : null;
};

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "user_profiles" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(file.data).pipe(uploadStream);
  });
};

export const userSignup = async (req, res) => {
  try {
    const { username, userId, password, email, adhaarNumber } = req.body;
    const imageFile = req.files?.image;

    if (!imageFile) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const imageUrl = await uploadToCloudinary(imageFile);

    const form = new FormData();
    form.append("image", imageFile.data, {
      filename: imageFile.name,
      contentType: imageFile.mimetype,
    });

    const flaskRes = await flaskEmbeddingService.post("/extract-embedding", form, {
      headers: {
        ...form.getHeaders(),
        "Content-Type": `multipart/form-data; boundary=${form.getBoundary()}`,
      },
      timeout: 30000,
    });

    const embedding = flaskRes.data.embedding;

    const newUser = new User({
      userName: username,
      userId: userId,
      email: email,
      password: hashedPassword,
      userProfilePhoto: imageUrl,
      verificationPhoto: "",
      adhaarNumber: Number(adhaarNumber),
      embeddingVector: embedding,
    });

    await newUser.save();

    const savedUser = await User.findById(newUser._id);

    const token = generateToken(savedUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        email: savedUser.email,
        userName: savedUser.userName,
        userId: savedUser.userId,
        waterId: savedUser.waterId || "",
      },
      token,
    });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message: "Face recognition service unavailable",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.response?.data?.message || error.message,
    });
  }
};

export const userLogin = async (req, res) => {
  try {    
    const { identifier, password } = req.body;
    let user;
    if (identifier.includes("@")) {
      user = await User.findOne({ email: identifier });
    } else {
      user = await User.findOne({ userId: identifier });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        email: user.email,
        userName: user.userName,
        userId: user.userId,
        waterId: user.waterId,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

export const generateEmailVerificationOtp = async (req, res) => {
  try {
    const { useremail } = req.params;

    if (!useremail) {
      return res.status(400).json({ 
        success: false,
        message: "Email parameter is missing." 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await Verification.findOneAndUpdate(
      { email: useremail },
      { otp, expiry },
      { new: true, upsert: true }
    );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"HydraOne" <${process.env.EMAIL_USER}>`,
      to: useremail,
      subject: "Email Verification - One-Time Password",
      html: `
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background: #1a1a1a; font-family: 'Inter', Arial, sans-serif; min-height: 100vh;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="width: 100%; background: #1a1a1a; position: relative; overflow: hidden; border-radius: 20px;">
            <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 60px; background: linear-gradient(180deg, #8B5CF6, #A855F7, #C084FC); border-radius: 20px 0 0 20px;"></div>
            <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 60px; background: linear-gradient(180deg, #8B5CF6, #A855F7, #C084FC); border-radius: 0 20px 20px 0;"></div>
            
            <div style="margin: 0 60px; padding: 40px 30px; position: relative;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 15px 40px; border-radius: 50px; display: inline-block; margin-bottom: 30px;">
                        <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: 1px;">HydraOne</h1>
                    </div>
                </div>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 60px; margin-bottom: 20px;">🚀</div>
                </div>
                
                <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="color: #8B5CF6; font-size: 48px; margin: 0 0 15px 0; font-weight: 700; letter-spacing: -1px;">Almost There!</h2>
                    <p style="color: #9CA3AF; font-size: 18px; margin: 0; font-weight: 400;">Just one more step to secure</p>
                    <p style="color: #9CA3AF; font-size: 18px; margin: 5px 0 0 0; font-weight: 400;">your account ✨</p>
                </div>
                
                <div style="text-align: center; margin: 60px 0;">
                    <p style="color: #9CA3AF; font-size: 14px; margin: 0 0 20px 0; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;">Your Verification Code</p>
                    
                    <div style="position: relative; display: inline-block; margin: 20px 0;">
                        <div style="background: linear-gradient(45deg, #F59E0B, #EF4444, #EC4899, #8B5CF6); padding: 3px; border-radius: 20px;">
                            <div style="background: #1a1a1a; border-radius: 17px; padding: 30px 40px;">
                                <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #8B5CF6; font-family: 'Courier New', monospace;">${otp.toString().split('').join(' ')}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1)); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 15px; padding: 25px; margin: 40px 0; position: relative;">
                    <div style="margin-bottom: 15px;">
                        <span style="font-size: 24px; margin-right: 10px;">⏰</span>
                        <span style="color: #10B981; font-size: 18px; font-weight: 600;">Quick Reminder</span>
                    </div>
                    <p style="color: #D1D5DB; font-size: 16px; margin: 0 0 10px 0; line-height: 1.5;">This code is like a digital key</p>
                    <p style="color: #D1D5DB; font-size: 16px; margin: 0 0 10px 0; line-height: 1.5;">that expires in 10 minutes.</p>
                    <p style="color: #D1D5DB; font-size: 16px; margin: 0; line-height: 1.5;">Use it quickly to unlock your</p>
                    <p style="color: #D1D5DB; font-size: 16px; margin: 0; line-height: 1.5;">account! 🔑</p>
                </div>
                
                <div style="text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #374151;">
                    <p style="color: #6B7280; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} HydraOne. All rights reserved.
                    </p>
                    <p style="color: #6B7280; font-size: 12px; margin: 10px 0 0 0;">
                        Didn't request this? You can safely ignore this email.
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: `Verification OTP has been sent to ${useremail}.`,
    });
  } catch (error) {
    console.error("Error during email verification:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while sending the verification email.",
      error: error.message,
    });
  }
};

export const addFamilyMember = async (req, res) => {
  try {
    const { userid, memberid } = req.params;

    const user = await User.findOne({ userId: userid });
    if (!user) {
      return res.status(404).json({ message: "Adding user not found" });
    }

    const { tenantCode, waterId } = user;

    const member = await User.findOne({ userId: memberid });
    if (!member) {
      return res.status(404).json({ message: "Member user not found" });
    }

    const rootId = waterId.split("_")[0];

    member.tenantCode = tenantCode;
    member.waterId = waterId;

    if (!member.properties.includes(rootId)) {
      member.properties.push(rootId);
    }

    await member.save();

    res
      .status(200)
      .json({ message: "Family member added successfully", member });
  } catch (error) {
    console.error("Error adding family member:", error);
    res
      .status(500)
      .json({ message: "Server error while adding family member" });
  }
};

export const getCurrentDayGuests = async (req, res) => {
  try {
    const { waterid } = req.params;

    const invitation = await Invitation.findOne({ hostwaterId: waterid }).lean();

    if (!invitation) {
      return res.status(200).json([]);
    }

    const invitedGuests = invitation.invitedGuests || {};
    const arrivalTime = invitation.arrivalTime || {};
    const stayDuration = invitation.stayDuration || {};

    const guestIds = Object.keys(invitedGuests);

    if (!guestIds.length) {
      return res.status(200).json([]);
    }

    const users = await User.find({ userId: { $in: guestIds } })
      .lean()
      .select("userId userName userProfilePhoto");

    const payload = users.map((u) => ({
      userId: u.userId,
      userName: u.userName,
      userProfilePhoto: u.userProfilePhoto,
      arrivalTime: arrivalTime[u.userId] || "",
      stayDuration: (stayDuration[u.userId] || "").replace(/\s*day$/i, ""),
      status: invitedGuests[u.userId] || ""
    }));

    return res.status(200).json(payload);

  } catch (e) {
    console.error("Error in getCurrentDayGuests:", e);
    return res.status(500).json({ message: e.message });
  }
};

export const viewInvitedGuests = async (req, res) => {
  try {
    const { waterid } = req.params;

    const invitations = await Invitation.find({ hostwaterId: waterid });

    const invitedGuests = [];

    for (const invitation of invitations) {
      if (!Array.isArray(invitation.invitedGuests)) continue;

      for (const userId of invitation.invitedGuests) {
        const user = await User.findOne(
          { userId },
          { userId: 1, userName: 1, userProfilePhoto: 1 }
        );

        if (user) {
          invitedGuests.push({
            userId: user.userId,
            userName: user.userName,
            userProfilePhoto: user.userProfilePhoto,
            arrivalTime: invitation.arrivalTime?.get(userId) || null,
            stayDuration: invitation.stayDuration?.get(userId) || null,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      invitedGuests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const viewMonthwiseDetails = async (req, res) => {
  try {
    const { waterid } = req.params;
    const [rootId, tenantCode] = waterid.split("_");

    const family = await Family.findOne({
      rootId: rootId,
      tenantCode: tenantCode,
    });

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    const currentYear = new Date().getFullYear();
    const monthlyAggregated = {};
    const monthlyDailyDetails = {};

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    for (let month = 0; month < 12; month++) {
      const monthName = monthNames[month];
      monthlyAggregated[monthName] = {
        totalWaterUsed: 0,
        totalFines: 0,
      };
      monthlyDailyDetails[monthName] = {};
    }

    if (family.waterUsage && family.waterUsage.size > 0) {
      for (const [dateStr, usage] of family.waterUsage) {
        const date = new Date(dateStr);
        if (date.getFullYear() === currentYear) {
          const monthName = monthNames[date.getMonth()];
          const day = date.getDate();

          monthlyAggregated[monthName].totalWaterUsed += usage;

          if (!monthlyDailyDetails[monthName][day]) {
            monthlyDailyDetails[monthName][day] = {
              waterUsed: 0,
              guests: [],
            };
          }

          monthlyDailyDetails[monthName][day].waterUsed += usage;
        }
      }
    }

    if (family.guests && family.guests.size > 0) {
      for (const [dateStr, guestIds] of family.guests) {
        const date = new Date(dateStr);
        if (date.getFullYear() === currentYear) {
          const monthName = monthNames[date.getMonth()];
          const day = date.getDate();

          if (!monthlyDailyDetails[monthName][day]) {
            monthlyDailyDetails[monthName][day] = {
              waterUsed: 0,
              guests: [],
            };
          }

          if (Array.isArray(guestIds) && guestIds.length > 0) {
            const guestDetails = await User.find(
              { userId: { $in: guestIds } },
              { userId: 1, userName: 1, userProfilePhoto: 1 }
            );

            monthlyDailyDetails[monthName][day].guests = guestDetails.map(
              (guest) => ({
                userId: guest.userId,
                userName: guest.userName,
                userProfilePhoto: guest.userProfilePhoto,
              })
            );
          }
        }
      }
    }

    if (family.fineDates && Array.isArray(family.fineDates)) {
      family.fineDates.forEach((dateStr) => {
        const date = new Date(dateStr);
        if (date.getFullYear() === currentYear) {
          const monthName = monthNames[date.getMonth()];
          monthlyAggregated[monthName].totalFines += 1;
        }
      });
    }

    const aggregatedData = Object.entries(monthlyAggregated).map(
      ([monthName, data]) => ({
        month: monthName,
        totalWaterUsed: `${data.totalWaterUsed}L`,
        totalFines: data.totalFines,
      })
    );

    const dailyDetailsData = {};
    Object.entries(monthlyDailyDetails).forEach(([monthName, monthData]) => {
      dailyDetailsData[monthName] = Object.entries(monthData)
        .map(([day, dayData]) => ({
          day: parseInt(day),
          waterUsed: `${dayData.waterUsed}L`,
          guestCount: dayData.guests.length,
          guests: dayData.guests,
        }))
        .sort((a, b) => a.day - b.day);
    });

    return res.status(200).json({
      success: true,
      data: {
        aggregatedMonthlyData: aggregatedData,
        dailyDetailsData: dailyDetailsData,
      },
    });
  } catch (error) {
    console.error("Error in viewMonthwiseDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { userid } = req.params;

    const user = await User.findOne({ userId: userid }).select(
      "userProfilePhoto userId userName waterId properties"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userProfilePhoto: user.userProfilePhoto,
        userId: user.userId,
        userName: user.userName,
        waterId: user.waterId,
        properties: user.properties,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProfileDetails = async (req, res) => {
  try {
    const { userid } = req.params;

    const user = await User.findOne({ userId: userid }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const userDetails = {
      userName: user.userName,
      userId: user.userId,
      userProfilePhoto: user.userProfilePhoto,
      adhaarNumber: user.adhaarNumber,
      waterId: user.waterId,
    };

    const propertyRootIds = user.properties || [];

    const ownerPropertiesDocs = await Property.find({
      rootId: { $in: propertyRootIds },
    }).lean();

    const ownerProperties = ownerPropertiesDocs.map((p) => ({
      propertyName: p.propertyName,
      municipality: p.municipality,
      wardNumber: p.wardNumber,
      district: p.district,
      numberOfTenants: p.numberOfTenants,
      typeOfProperty: p.typeOfProperty,
      label: "owner",
    }));

    const waterIdParts = user.waterId?.split("_") || [];
    let tenantProperty = null;

    if (waterIdParts[1] && waterIdParts[1] !== "000") {
      const tenantRootId = waterIdParts[0];
      const tenantPropertyDoc = await Property.findOne({ rootId: tenantRootId }).lean();
      if (tenantPropertyDoc) {
        tenantProperty = {
          propertyName: tenantPropertyDoc.propertyName,
          municipality: tenantPropertyDoc.municipality,
          wardNumber: tenantPropertyDoc.wardNumber,
          district: tenantPropertyDoc.district,
          numberOfTenants: tenantPropertyDoc.numberOfTenants,
          typeOfProperty: tenantPropertyDoc.typeOfProperty,
          label: "tenant",
        };
      }
    }

    const properties = tenantProperty ? [...ownerProperties, tenantProperty] : ownerProperties;

    return res.status(200).json({
      user: userDetails,
      properties,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFamilyMembers = async (req, res) => {
  try {
    const { userid } = req.params;

    const currentUser = await User.findOne({ userId: userid });

    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { waterId } = currentUser;

    if (!waterId || waterId === "") {
      return res.status(200).json({
        success: true,
        members: [],
      });
    }

    const familyMembers = await User.find(
      { waterId },
      { userId: 1, userName: 1, userProfilePhoto: 1, adhaarNumber: 1, email: 1 }
    );

    const allFieldsMembers = await User.find({ waterId });

    return res.status(200).json({
      success: true,
      members: familyMembers,
    });
  } catch (error) {
    console.error("Error in getFamilyMembers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const fetchDashboardDetails = async (req, res) => {
  try {
    const { userid } = req.params;
    const family = await Family.findOne({ members: userid });

    if (!family) {
      const user = await User.findOne({ userId: userid });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.status(200).json({ success: true, hasWaterId: false });
    }

    let latestDateStr = null;
    if (family.waterUsage && family.waterUsage.size > 0) {
      latestDateStr = Array.from(family.waterUsage.keys()).sort().pop();
    }

    const now = latestDateStr ? moment(latestDateStr).tz("Asia/Kolkata") : moment().tz("Asia/Kolkata");
    
    const startOfMonth = now.clone().startOf('month');
    const startOfWeek = now.clone().startOf('week');
    const startOfLastMonth = now.clone().subtract(1, 'month').startOf('month');
    const endOfLastMonth = startOfLastMonth.clone().endOf('month');

    let waterUsedThisMonth = 0;
    let waterUsedThisWeek = 0;
    let lastMonthWaterUsage = 0;
    let guestsThisMonth = 0;

    if (family.waterUsage && family.waterUsage.size > 0) {
      for (const [dateStr, usageValue] of family.waterUsage) {
        const date = moment(dateStr, "YYYY-MM-DD", true);
        if (date.isValid()) {
          const usage = Number(usageValue) || 0;
          if (date.isSameOrAfter(startOfMonth)) waterUsedThisMonth += usage;
          if (date.isSameOrAfter(startOfWeek)) waterUsedThisWeek += usage;
          if (date.isBetween(startOfLastMonth, endOfLastMonth, null, '[]')) lastMonthWaterUsage += usage;
        }
      }
    }
    
    if (family.guests && family.guests.size > 0) {
      for (const [dateStr, guests] of family.guests) {
        const date = moment(dateStr, "YYYY-MM-DD", true);
        if (date.isValid() && date.isSameOrAfter(startOfMonth) && Array.isArray(guests)) {
          guestsThisMonth += guests.length;
        }
      }
    }

    const realNow = moment().tz("Asia/Kolkata");
    const supplyTimes = [{ h: 8, t: "8 AM" }, { h: 12, t: "12 PM" }, { h: 15, t: "3 PM" }];
    let nextSupply = { t: "8 AM (Tomorrow)", m: realNow.clone().add(1, 'day').startOf('day').hour(8) };

    for (const supply of supplyTimes) {
      const supplyMoment = realNow.clone().hour(supply.h).startOf('hour');
      if (realNow.isBefore(supplyMoment)) {
        nextSupply = { t: supply.t, m: supplyMoment };
        break;
      }
    }
    
    return res.status(200).json({
      success: true,
      hasWaterId: true,
      waterUsedThisMonth: Math.round(waterUsedThisMonth),
      waterUsedThisWeek: Math.round(waterUsedThisWeek),
      guestsThisMonth,
      billThisMonth: Math.round(waterUsedThisMonth * 10),
      lastMonthBill: Math.round(lastMonthWaterUsage * 10),
      billStatus: "paid",
      dueDate: now.clone().date(5).format("YYYY-MM-DD"),
      nextSupplyTime: nextSupply.t,
      hoursUntilNext: Math.max(0, Math.ceil(nextSupply.m.diff(realNow, 'minutes') / 60)),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching dashboard data",
      error: error.message,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userid } = req.params;
    const { userName, userProfilePhoto, email, userId: newUserId } = req.body;

    const updateFields = {};
    if (userName !== undefined && userName !== null)
      updateFields.userName = userName;
    if (userProfilePhoto !== undefined && userProfilePhoto !== null)
      updateFields.userProfilePhoto = userProfilePhoto;

    if (email !== undefined && email !== null) {
      const existingEmailUser = await User.findOne({
        email,
        userId: { $ne: userid },
      });
      if (existingEmailUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      updateFields.email = email;
    }

    if (newUserId !== undefined && newUserId !== null && newUserId !== userid) {
      const existingUserIdUser = await User.findOne({ userId: newUserId });
      if (existingUserIdUser) {
        return res.status(400).json({
          success: false,
          message: "User ID already exists",
        });
      }
      updateFields.userId = newUserId;
    }

    const existingUser = await User.findOne({ userId: userid });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.updateOne({ userId: userid }, { $set: updateFields });

    const updatedUser = await User.findOne({ userId: newUserId || userid });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getInsights = async (req, res) => {
  try {
    const { waterid } = req.params;
    const [rootId, tenantCode] = waterid.split("_");

    const family = await Family.findOne({ rootId, tenantCode });

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family data not found for the given water ID.",
      });
    }

    const today = moment().tz("Asia/Kolkata");
    const todayStr = today.format("YYYY-MM-DD");

    const totalUsageToday = family.waterUsage?.get(todayStr) || 0;
    const extraWaterToday = family.extraWaterDates?.get(todayStr) || 0;
    const guestIdsToday = family.guests?.get(todayStr) || [];
    const numGuests = guestIdsToday.length;
    
    const primaryMembers = await User.find({ waterId: waterid });
    const numPrimaryMembers = primaryMembers.length;

    const baseUsageToday = totalUsageToday - extraWaterToday;
    const totalPeople = numPrimaryMembers + numGuests;
    const perPersonUsage = totalPeople > 0 ? baseUsageToday / totalPeople : 0;
    
    const dailyData = [
      { name: "Primary Members", value: Math.round(perPersonUsage * numPrimaryMembers) },
      { name: "Water by Guests", value: Math.round(perPersonUsage * numGuests) },
      { name: "Extra Water", value: Math.round(extraWaterToday) },
    ];

    const thirtyDayTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = moment().tz("Asia/Kolkata").subtract(i, 'days');
      const dateStr = date.format("YYYY-MM-DD");
      thirtyDayTrend.push({
        day: date.format("D MMM"),
        usage: family.waterUsage?.get(dateStr) || 0,
      });
    }

    const yearlyUsage = Array(12).fill(0);
    const currentYear = today.year();
    if (family.waterUsage) {
        for (const [dateStr, usage] of family.waterUsage.entries()) {
            const entryDate = moment(dateStr, "YYYY-MM-DD");
            if (entryDate.year() === currentYear) {
                const monthIndex = entryDate.month();
                yearlyUsage[monthIndex] += usage;
            }
        }
    }
    
    const monthNames = moment.monthsShort();
    const yearlyData = monthNames.map((month, index) => ({
      month,
      usage: Math.round(yearlyUsage[index]),
    }));

    return res.status(200).json({
      success: true,
      data: {
        dailyUsage: dailyData,
        thirtyDayTrend: thirtyDayTrend,
        yearlyOverview: yearlyData,
      },
    });

  } catch (error) {
    console.error("Error in getInsights:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching insights data.",
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const verification = await Verification.findOne({ email });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "No OTP found for this email"
      });
    }

    if (verification.otp !== Number(otp)) {
      return res.status(200).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    const currentTime = new Date();
    const expiryTime = new Date(verification.expiry);
    const timeDifference = (currentTime - expiryTime) / (1000 * 60);

    if (timeDifference > 10) {
      await Verification.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }

    await Verification.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};