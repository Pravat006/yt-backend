import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
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

  const { fullname, email, username, password } = req.body;

  // check if the required fields are not empty
  if (
    [email, fullname, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all field are required");
  }

  //check for existed user in database before creating a new user account
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }
  console.log(req.files);

  //check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  //find created user
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "User account already exist in our database");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User register successful"));
});

// generate access token and refresh token for a perticular user by jwt
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const loginUser = asyncHandler(async (req, rex) => {
  //req body-> data
  //username or email
  //find the user
  //password check
  //access and refresh token
  //send cookie

  //take the login data from user to login
  const { email, username, password } = req.body;
  //if (!username && !email) {
  //  throw new ApiError(400, "username or email is required");
  //}
  if(!(username || email)){
    throw new ApiError(400, "username or email is required");
  
}




  //find the existed user in the database
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  //throw error if the user does not exist
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // ckeck for password validation
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect passord entered");
  }

  //generate access and refresh token for user by id
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //send access token and refrea=sh token to cookies
  const loggedInuser = await User.findById(user._id).select(
    "-passord -refreshToken"
  );

  //this options object allow us to modify the cookie only at the server side
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInuser,
          refreshToken,
          accessToken,
        },
        "User logged in successfully"
      )
    );
});

//logout user
const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },{
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
      };
      return res
                .status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json(new ApiError(200, {}, "User logged out successful"))
});

export { registerUser, loginUser, logOutUser };
