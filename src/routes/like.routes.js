import { Router } from "express";

import {
  toggleCommentLike,
  toggleVideoLike,
  getLikedVideos,
} from "../controllers/likes.contoller.js";
import  { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()
router.use(verifyJWT)


router.route("/likedVideos").get(getLikedVideos)
router.route("/l/:videoId").patch(toggleVideoLike)
router.route("/l/:commentId").patch(toggleCommentLike)


export default router

