import { Router } from "express";
import { loginUser,registerUser,refreshAccessToken } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)


export default router;