import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    //injecting multer middleware
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1

        }
    ]),
    registerUser,
);

router.route("/login").post(loginUser)

//securedd routes
router.route("/logout").post(verifyJWT,loginUser)



export default router



