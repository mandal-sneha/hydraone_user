import { User } from "../models/user.model.js";
import { WaterRegistration } from "../models/waterregistration.model.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getRegistrationDetails = async (req, res) => {
    try {
        const { waterid } = req.params;

        const currentIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const currentHour = currentIST.getHours();

        let slot;
        if (currentHour < 8) {
            slot = 8;
        } else if (currentHour < 12) {
            slot = 12;
        } else if (currentHour < 15) {
            slot = 15;
        } else {
            return res.status(200).json({
                success: true,
                data: {
                    primaryMembers: [],
                    invitedGuests: []
                }
            });
        }

        const registration = await WaterRegistration.findOne({ waterId: waterid, slot });

        if (!registration) {
            return res.status(200).json({
                success: true,
                data: {
                    primaryMembers: [],
                    invitedGuests: []
                }
            });
        }

        const { primaryMembers = [], specialMembers = [], invitedGuests = [] } = registration;

        const fetchUsers = async (userIds = []) => {
            const users = await User.find(
                { userId: { $in: userIds } },
                "userId userName userProfilePhoto"
            );
            return users.map(user => ({
                userId: user.userId,
                userName: user.userName,
                userProfilePhoto: user.userProfilePhoto,
                isSpecial: specialMembers.includes(user.userId)
            }));
        };

        const primaryMemberDetails = await fetchUsers(primaryMembers);
        const invitedGuestDetails = await fetchUsers(invitedGuests);

        res.status(200).json({
            success: true,
            data: {
                primaryMembers: primaryMemberDetails,
                invitedGuests: invitedGuestDetails
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

export const registerForWater = async (req, res) => {
    try {
        const { waterid } = req.params;
        const { primaryMembers, specialMembers, extraWaterRequested } = req.body;

        if (!primaryMembers || !Array.isArray(primaryMembers) || primaryMembers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Primary members are required"
            });
        }

        const currentIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const currentHour = currentIST.getHours();

        let slot;
        if (currentHour < 8) {
            slot = 8;
        } else if (currentHour < 12) {
            slot = 12;
        } else if (currentHour < 15) {
            slot = 15;
        } else {
            return res.status(400).json({
                success: false,
                message: "No slots available for today"
            });
        }

        const existing = await WaterRegistration.findOne({ waterId: waterid, slot });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "This waterId is already registered for the selected slot"
            });
        }

        const registration = new WaterRegistration({
            waterId: waterid,
            primaryMembers,
            specialMembers,
            invitedGuests: [],
            slot,
            extraWaterRequested: !!extraWaterRequested
        });

        await registration.save();

        res.status(201).json({
            success: true,
            message: "Water registration successful",
            data: registration
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};