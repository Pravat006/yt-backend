import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "password must required"],
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },

  { timestamps: true }
);
userSchema.pre("save", async function (next){
  if(!this.isModified("password")) return next();
    
  this.password= await bcrypt.hash(this.password, 10);
    next()   
});
userSchema.methods.isPasswordCorrect= async function(password){
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.useername,
    fullname: this.fullname
     },
     process.env.ACCESS_TOKEN_SECRET,
     {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
     },
     process.env.REFRESH_TOKEN_SECRE,
     {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
     }
  )
}
userSchema.methods.generateRefreshToken = function(){}

export const User = mongoose.model("User", userSchema);
