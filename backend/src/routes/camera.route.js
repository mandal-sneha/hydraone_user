import { Router } from "express";
import { verifyGuestArrival, verifyArrivalOtp } from "../controllers/camera.controller.js";

const router = Router();

router.post("/:waterid/verify-arrival", verifyGuestArrival);
router.post("/verify-arrival-otp", verifyArrivalOtp);

export default router;