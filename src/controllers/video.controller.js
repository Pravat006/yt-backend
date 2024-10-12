import  { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {

  // yeh wala samajh nahi aaya to aise hi bana dala 
  try {
    const videos = await Video.find({ isPublished: true });
    return res
      .status(200)
      .json(new ApiResponse(200, videos, "All videos fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while fetching the videos from the server "
    );
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "title and description required ");
  }

  const videolocalpath = req.files?.videoFile[0]?.path;

  if (!videolocalpath) {
    throw new ApiError(400, "Video file is required");
  }

  let thumbnailLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalpath = req.files.thumbnail[0].path;
  }

  const videoFile = await uploadOnCloudinary(videolocalpath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalpath);

  const video = await Video.create({
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url || "",
    title,
    description,
    duration: videoFile.duration
  });

  const uploadedVideo = await Video.findById(video._id);

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedVideo, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
      throw new ApiError(404, "video not found");
    }
    const video = await Video.aggregate([
      {
        $match:{
          _id: new  mongoose.Types.ObjectId(videoId)
        }
      },{
          $lookup:{
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "likes"
          }
      },
      {
        $lookup:{
          from: "comments",
          localField: "_id",
          foreignField: "content",
          as: "comments"
        }
      },
      {
        $lookup:{
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline:[
            {
              $project:{
                username: 1,
                "avatar.url": 1,
              }
            }
          ]
        }
      },
      {
        $unwind: "$uploadedBy"
      },
      {
        $addFields:{
          commentCount:{
            $size: "comments"
          },
          likesCount:{
            $size: "likes"
          }

        }
      },
      {
        $project:{
          title: 1,
          description: 1,
          videoFile: 1,
          thumbnail: 1,
          duration: 1,
          commentCount: 1,
          likesCount: 1,
          owner: 1,
          createdAt: 1,

        }
      }
      
    ])
   

//// add this video to user watch history
if(!isValidObjectId(videoId)){  
  throw new ApiError(404, "Invalid object id provided");
}

if(!video){
  throw new ApiError(404, "Video not found");
}
// increment views if video fetched successfully
await Video.findByIdAndUpdate(videoId, {
  $inc: {
    views: 1
  }
});
await User.findByIdAndUpdate(req.user?._id, {
    $addToSet: {
        watchHistory: videoId
    }
});




    return res
      .status(200)
      .json(new ApiResponse(200, video, "video content fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while fetching the video from server "
    );
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Invalid object id provided");
  }
  
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "title and description required ");
  }
const newThumbnailLocalpath = req.files?.thumbnail[0]?.path;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  let newThumbnail;
  if (newThumbnailLocalpath) {
    newThumbnail = await uploadOnCloudinary(newThumbnailLocalpath);
    if (!newThumbnail.url) {
      throw new ApiError(400, "Error while uplaoding the tumbnail on cloud");
    }
  }



  //if (!newThumbnailLocalpath) {
  //  throw new ApiError(400, "thumbnail file is missing");
  //}
  //const newThumbnail = await uploadOnCloudinary(newThumbnailLocalpath);
  //if (!newThumbnail.url) {
  //  throw new ApiError(400, "Error while uplaoding the tumbnail on cloud");
  //}

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: newThumbnail?.url.toString() || "",
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Video details  updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Invalid object id provided");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const response = await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Video deleted successfully from server"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    if (!isValidObjectId(videoId)) {
      throw new ApiError(404, "Invalid object id provided");
    }

    video.isPublished = !video.isPublished;
    const save = await video.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, save, "Video publish status updated successful")
      );
  } catch (error) {
    throw new ApiError(500, "error while update publish status in server");
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
