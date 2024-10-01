import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { Statement } from "../models/statement.model.js";
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
const logoutUser = asyncHandler(async (req,res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        }
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res.
    status(201).
    clearCookie("accessToken",options).
    clearCookie("refreshToken",options).
    json(new APIResponse(200,{},"User logged out successfully"))
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
//create statement,delete statement,get all statements,get one statement,update statement,get summary,filter sort

const createStatement = asyncHandler(async (req,res) => {
    const {name,amount,type} = req.body;

    const allowedTypes = Statement.schema.path('type').enumValues;

    if(!name || !amount || !type)
        throw new APIError(404,"Both an amount and type is required")

    if(!allowedTypes.includes(type))
        throw new APIError(400,"Please enter a valid type")

    const statement = await Statement.create({
        name,
        amount,
        type,
        userId: req.user._id
    })

    await User.findByIdAndUpdate(req.user._id,
        {$push: {statements: statement._id}}
    )

    if(!statement)
        throw new APIError(400,"Something went wrong while creating the statement")

    return res.
    status(201).
    json(new APIResponse(200,statement,"Statement created successfully"))
})
const deleteStatement = asyncHandler(async (req,res) => {
    const {statementId} = req.params;

    if(!statementId)
        throw new APIError(404,"Invalid Statement Id")

    const deletedStatement = await Statement.findByIdAndDelete(statementId)

    if(!deletedStatement)
        throw new APIError(400,"Statement does not exists")

    await User.findByIdAndUpdate(req.user._id,
        {$pull: {statements: statementId}}
    )
    return res.
    status(201).
    json(new APIResponse(200,deletedStatement,"Statement deleted successfully"))
})

const getStatement = asyncHandler(async (req,res) => {
    const {statementId} = req.params;    

    if(!statementId)
        throw new APIError(404,"Please enter a valid statement Id")

    const statement = await Statement.findById(statementId).select("-userId");

    if(!statement)
        throw new APIError(400,"Something went wrong while fetching the statement")

    const statementData = {
        _id: statement._id,
        Name: statement.name,
        Amount: statement.amount,
        Type: statement.type,
        Date: statement.createdAt.toLocaleDateString(),
        Time: statement.createdAt.toLocaleTimeString()
    }

    return res.
    status(201).
    json(new APIResponse(200,statementData,"Statement fetched successfully."))
})

const getAllStatements = asyncHandler(async (req,res) => {
    const userId = req.user._id;
    const statements = await Statement.find({userId}).select("-userId")

    const formattedStatements = statements.map((statement) => 
    {return {
        _id: statement._id,
        Name: statement.name,
        Amount: statement.amount,
        Type: statement.type,
        Date: statement.createdAt.toLocaleDateString(),
        Time: statement.createdAt.toLocaleTimeString()
    }})
    return res.
    status(201).
    json(new APIResponse(200,formattedStatements,"Statements fetched successfully."))
})

const updateStatement = asyncHandler(async (req,res) => {
    const {statementId,name,amount,type} = req.body;

    const allowedTypes = Statement.schema.path('type').enumValues;
    if(!allowedTypes.includes(type))
        throw new APIError(400,"Please enter a valid type")
    
    const updatedStatement = await Statement.findByIdAndUpdate(
        statementId,{name,amount,type},{new: true,runValidators:true})
    
    if(!updateStatement)
        throw new APIError(404,"Something went wrong while updating the statement")

    return res.status(201).json(new APIResponse(200,updatedStatement,"Statement updated successfully"))
})

export {loginUser,registerUser,logoutUser,refreshAccessToken,
    createStatement,deleteStatement,getStatement,getAllStatements,updateStatement};