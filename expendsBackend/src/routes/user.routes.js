import { Router } from "express";
import { loginUser,registerUser,logoutUser
    ,refreshAccessToken,createStatement,deleteStatement } 
    from "../controllers/user.controller.js";
import { verifyJWTToken } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)

//secured routes
router.route("/logout").post(verifyJWTToken,logoutUser)
router.route("/create-statement").post(verifyJWTToken,createStatement)
router.route("/delete-statement").post(verifyJWTToken,deleteStatement)

export default router;