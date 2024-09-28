import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { APIResponse } from "../utils/APIResponse.js";
import jwt from "jsonwebtoken"

const generateAccessTokenAndRefreshToken = async (userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    }
    catch(error){
        throw new APIError(500,"Something went wrong while generating access and refresh token.")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    const {username,email,password} = req.body;
    if([username,email,password].some((field) => field?.trim() == ""))
        throw new APIError(400,"All fields are required.")

    const existedUser = await User.findOne({$or: [{username},{email}]})

    if(existedUser)
        throw new APIError(408,"User with that username or email already exists.")
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser)
        throw new APIError(500,"Something went wrong while registering the user.")

    res.
    status(201).
    json(new APIResponse(200,createdUser,"User registered successfully."))
})

const loginUser = asyncHandler(async (req,res) => {
    const {username,email,password} = req.body;

    if(!(username||email))
        throw new APIError(400,"Please enter username or email")
    if(!password)
        throw new APIError(400,"Please enter password")

    const user = await User.findOne({$or: [{username},{email}]})

    if(!user)
        throw new APIError(404,"User with that username or email does not exists")

    const isValidPassword = await user.isPasswordCorrect(password);

    if(!isValidPassword)
        throw new APIError(401,"Invalid Password")

    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }

    res.
    status(201).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options).
    json(new APIResponse(200,
        {
            user: loggedInUser,
            accessToken,
            refreshToken
        },"User logged in successfully."));
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken)
        throw new APIError(401,"Invalid Authorization")

    try{
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        
        if(!user)
            throw new APIError(401,"Invalid Refresh Token")

        if(incomingRefreshToken !== user.refreshToken)
            throw new APIError(401,"Refresh Token is expired or used")

        const {accessToken,refreshToken: newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)

        const options = {
            httpOnly:true,
            secure:true
        }

        res.
        status(201).
        cookie("accessToken",accessToken,options).
        cookie("refreshToken",newRefreshToken,options).
        json(new APIResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token Refreshed Successfully"))
    }catch(error){
        throw new APIError(401,error?.message || "Invalid Refresh Token")
    }
})
export {loginUser,registerUser,refreshAccessToken};