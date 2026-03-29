import { Router } from "express";
import { userSignup, userLogin, generateEmailVerificationOtp, addFamilyMember, verifySignupOtp, getPaymentSummary, getCurrentDayGuests, viewInvitedGuests, getUser, getProfileDetails, getFamilyMembers, getDashboardDetails, updateUserProfile, getInsightsPageGraphData, getMonthlyUsageDetails } from "../controllers/user.controller.js";

const router = Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/:useremail/generate-email-verification-otp", generateEmailVerificationOtp);
router.post("/:userid/:memberid/add-family-member", addFamilyMember);
router.post("/verify-signup-otp", verifySignupOtp);
router.put("/:userid/update-profile", updateUserProfile);
router.get("/:userid/payment-summary", getPaymentSummary);
router.get("/:waterid/get-currentday-guests", getCurrentDayGuests);
router.get("/:waterid/view-guests", viewInvitedGuests);
router.get("/:userid/get-user", getUser);
router.get("/:userid/get-profile-details", getProfileDetails);
router.get("/:userid/get-family-members", getFamilyMembers);
router.get("/:userid/dashboard", getDashboardDetails);
router.get("/:waterid/get-insights-page-graph-data", getInsightsPageGraphData);
router.get("/:waterid/get-monthly-usage-details", getMonthlyUsageDetails);

export default router;