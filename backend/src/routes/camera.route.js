import { Router } from "express";
import { verifyGuestArrival, markUserExit, verifyArrivalOtp } from "../controllers/camera.controller.js";

const router = Router();

router.post("/:waterid/verify-arrival", verifyGuestArrival);
router.post("/:waterid/mark-exit", markUserExit);
router.post("/verify-arrival-otp", verifyArrivalOtp);

export default router;