import { Router } from "express";
import { userSignup, userLogin, generateEmailVerificationOtp, addFamilyMember, verifyOtp, getCurrentDayGuests, viewInvitedGuests, viewMonthwiseDetails, getUser, getProfileDetails, getFamilyMembers, fetchDashboardDetails, updateUserProfile, getInsights } from "../controllers/user.controller.js";

const router = Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/:useremail/generate-email-verification-otp", generateEmailVerificationOtp);
router.post("/:userid/:memberid/add-family-member", addFamilyMember);
router.post("/verify-otp", verifyOtp);
router.put("/:userid/update-profile", updateUserProfile);
router.get("/:waterid/get-currentday-guests", getCurrentDayGuests);
router.get("/:waterid/view-guests", viewInvitedGuests);
router.get("/:waterid/view-monthwise-details", viewMonthwiseDetails)
router.get("/:userid/get-user", getUser);
router.get("/:userid/get-profile-details", getProfileDetails);
router.get("/:userid/get-family-members", getFamilyMembers);
router.get("/:userid/dashboard", fetchDashboardDetails);
router.get("/:waterid/get-insights", getInsights);

export default router;