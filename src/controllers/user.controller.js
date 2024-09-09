import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from '../models/user.model.js'
import { uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser= asyncHandler( async (req, res)=>{
    // get user details from frontend
    // verify the user data details as per db model required
    // validation -not empty
    // check if user already exists: usename , email
    //check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object -create entry in database
    //remove password and refresh token field from response
    //check for user creation
    //return response
    
    const {fullname,email,username,password}= req.body
  
    
    // check if the required fields are not empty
    if(
        [email,fullname,username,password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400, "all field are required")
    }
    
    //check for existed user in database before creating a new user account
    const existedUser= await User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exist")
    }
    console.log(req.files)


    //check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath= req.files.coverImage[0].path

    }

    const   avatar= await uploadOnCloudinary(avatarLocalPath)
    const   coverImage= await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user= await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    });
    //find created user
     const  createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
     )
     if(!createdUser){
        throw new ApiError(500,"User account already exist in our database")
     }

     return res.status(201).json(
        new ApiResponse(200, createdUser, "User register successful")
     )
});
    

export {
    registerUser,
    }
