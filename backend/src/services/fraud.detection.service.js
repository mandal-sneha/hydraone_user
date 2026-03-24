import moment from "moment-timezone";
import { EntryExitLog } from "../models/entryexitlog.model.js";
import { Invitation } from "../models/invitation.model.js";

const calculateScheduledExitTime = (entryTime, stayDuration) => {
    if (!entryTime || !stayDuration) return null;
    const entry = moment.tz(entryTime, "h:mm A", "Asia/Kolkata");
    const exit = entry.add(parseInt(stayDuration), 'hours');
    return exit.format("h:mm A");
};

const detectEarlyExits = async () => {
    try {
        const logs = await EntryExitLog.find({});
        
        for (const log of logs) {
            const guestExitTimings = log.guestExitTimings || new Map();
            if (guestExitTimings.size === 0) continue;
            
            const invitation = await Invitation.findOne({ hostwaterId: log.waterId });
            if (!invitation) continue;
            
            const arrivalTimeMap = invitation.arrivalTime || new Map();
            const stayDurationMap = invitation.stayDuration || new Map();
            
            const fraudMap = log.fraudEntries || new Map();
            let fraudDetected = false;
            
            for (const [guestId, actualExitTime] of guestExitTimings.entries()) {
                const scheduledArrival = arrivalTimeMap.get(guestId);
                const stayDuration = stayDurationMap.get(guestId);
                
                if (!scheduledArrival || !stayDuration) continue;
                
                const scheduledExit = calculateScheduledExitTime(scheduledArrival, stayDuration);
                if (!scheduledExit) continue;
                
                const scheduledMoment = moment.tz(scheduledExit, "h:mm A", "Asia/Kolkata");
                const actualMoment = moment.tz(actualExitTime, "h:mm A", "Asia/Kolkata");
                
                const isBeforeScheduled = actualMoment.isBefore(scheduledMoment);
                if (!isBeforeScheduled) continue;
                
                const minutesEarly = scheduledMoment.diff(actualMoment, 'minutes');
                
                if (minutesEarly >= 30) {
                    const fraudKey = `${guestId}_${moment().format("YYYY-MM-DD")}`;
                    fraudMap.set(fraudKey, {
                        guestId: guestId,
                        scheduledExit: scheduledExit,
                        actualExit: actualExitTime,
                        detectedAt: new Date(),
                        type: "early_exit"
                    });
                    fraudDetected = true;
                }
            }
            
            if (fraudDetected) {
                log.fraudEntries = fraudMap;
                await log.save();
            }
        }
        
        console.log(`Fraud detection completed at ${moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")}`);
    } catch (error) {
        console.error("Error in fraud detection:", error);
    }
};

export const runFraudDetection = async () => {
    await detectEarlyExits();
};