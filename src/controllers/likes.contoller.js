import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/likes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    //TODO: toggle like on video

    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video id provided");
    }

    //check if the current user liked the video
    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: req.user?._id,
    });

    if (existingLike) {
      // unlike the video
      const unlike = await Like.findByIdAndDelete(existingLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, unlike, "Video unliked successfully"));
    } else {
      const newLike = await Like.create({
        video: videoId,
        likedBy: req.user?._id,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Video liked successfully"));
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    //TODO: toggle like on comment

    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment id provided");
    }

    //check if the current user liked the comment
    const existingLike = await Like.findOne({
      comment: videoId,
      likedBy: req.user?._id,
    });

    if (existingLike) {
      // unlike the comment
      const unlike = await Like.findByIdAndDelete(existingLike._id);
      return res
        .status(200)
        .json(new ApiResponse(200, unlike, "comment unliked successfully"));
    } else {
      const newLike = await Like.create({
        comment: videoId,
        likedBy: req.user?._id,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, newLike, "comment liked successfully"));
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likedVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "owner",
              as: "ownerDetails",
            },
          },
          {
            $unwind: "ownerDetails",
          },
        ],
      },
    },
    {
      $unwind: "likedVideos",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 0,
        likedVideos: {
          _id: 1,
          "videoFile.url": 1,
          "thumbnail.url": 1,
          title: 1,
          description: 1,
          createdAt: 1,
          isPublished: 1,
          likes: 1,
          views: 1,
          duration: 1,
          owner: 1,

          ownerDetails: {
            username: 1,
            avatar: 1,
            fullname: 1,
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetchinng successful")
    );
});

export { toggleCommentLike, toggleVideoLike, getLikedVideos };
