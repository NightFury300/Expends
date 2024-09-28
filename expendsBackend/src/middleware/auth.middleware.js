import { APIError } from "../utils/APIError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWTToken =  asyncHandler(async (req,_,next) => {
    try{
        const incomingAccessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        if(!incomingAccessToken)
            throw new APIError(401,"Invalid Authorization")

        const decodedToken = jwt.verify(incomingAccessToken,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)

        if(!user)
            throw new APIError(401,"Invalid Access Token")

        req.user = user
        next()
    }
    catch(error){
        throw new APIError(401,error?.message || "Invalid Access Token")
    }

})