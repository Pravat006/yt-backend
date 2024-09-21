import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

export const verifyJWT= asyncHandler(async(req, _ , next)=>{
    try {

        // take access tokem from user
        const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        // throw error if the access token does not exist
        if(!token){
            throw new ApiError(401, "UnAuthorized token")
        }
        //verify the client side token with the database saved token 
        const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user= await User.findById(decodedToken?._id).select("-passord -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})



