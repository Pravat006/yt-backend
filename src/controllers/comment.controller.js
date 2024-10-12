import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id provided");
  }
 
  const getVideo = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "content",
        as: "comments",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields:{
              owner:{
                $first: "$owner"
              }
            }
          },
          {
            $lookup:{
              from: "likes",
              localField: "_id",
              foreignField: "comment",
              as: "likes"
            }
          },
          {
            $addFields:{
              likesCount:{
                $size: "likes"
              }
            }
          },
          {
            $project:{
              createdAt:1,
              likesCount:1,
              owner:1,
              content:1              
            }
          }
        ],
      },
    }

  ]);
  return res.status(200).json(
    new ApiResponse(200, getVideo[0].allComments, 
      "all comments fetched successfully"
    )
  )



});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const videoId = req.params;
  const userComment = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id provided");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found to comment");
  }

  if (userComment.toString() === " " || !userComment) {
    throw new ApiError(400, " content must required to post comment");
  }

  const postedComment = await Comment.create({
    content: userComment,
    video: videoId,
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, postedComment, "Comment successfully posted"));
});

const updateComment = asyncHandler(async (req, res) => {
  const commentId = req.params;
  const newComment = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id provided");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: newComment,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment successfully updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const commentId = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(404, "Invalid comment id provided");
  }
  const deleteComment = await Comment.findByIdAndDelete(commentId);
  if (!deleteComment) {
    throw new ApiError(404, "Internal server Error");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
