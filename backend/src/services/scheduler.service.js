import schedule from "node-schedule";
import moment from "moment-timezone";
import { Invitation } from "../models/invitation.model.js";
import { User } from "../models/user.model.js";
import { getIo, getSocketMap } from "./socket.service.js";
import { runFraudDetection } from "./fraud.detection.service.js";

const findDueGuests = async () => {
  const io = getIo();
  const socketMap = getSocketMap();
  if (!io || !socketMap) return;

  const now = moment().tz("Asia/Kolkata");
  
  const invitations = await Invitation.find({
    "arrivalTime": { $exists: true }
  });

  for (const invitation of invitations) {
    const hostwaterId = invitation.hostwaterId;
    
    const cameraSocketId = socketMap.get(hostwaterId);
    if (!cameraSocketId) {
      continue;
    }

    const guestMap = invitation.invitedGuests;
    const arrivalMap = invitation.arrivalTime;

    for (const [userId, status] of guestMap.entries()) {
      if (status === "accepted") {
        const arrivalTimeStr = arrivalMap.get(userId);
        if (!arrivalTimeStr) continue;

        const arrivalTime = moment.tz(arrivalTimeStr, "h:mm A", "Asia/Kolkata");
        if (!arrivalTime.isValid()) {
          continue;
        }
        
        arrivalTime.set({
          year: now.year(),
          month: now.month(),
          date: now.date()
        });
        
        const tenMinutesBefore = arrivalTime.clone().subtract(10, 'minutes');
        const tenMinutesAfter = arrivalTime.clone().add(10, 'minutes');

        if (now.isBetween(tenMinutesBefore, tenMinutesAfter)) {
          const guestUser = await User.findOne({ userId: userId });
          if (guestUser) {
            io.to(cameraSocketId).emit("activate-camera", { 
              userId: guestUser.userId 
            });
          }
        }
      }
    }
  }
};

export const initializeScheduler = () => {
  schedule.scheduleJob('*/5 * * * * *', () => {
    findDueGuests();
  });
  
  schedule.scheduleJob('0 */4 * * *', () => {
    runFraudDetection();
  });
};