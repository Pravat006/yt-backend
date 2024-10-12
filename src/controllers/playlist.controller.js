import mongoose, { isValidObjectId } from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name } = req.body;

  //TODO: create playlist
  if (!name) {
    throw new ApiError(400, "PlayList Name is must required");
  }
  const playList = await PlayList.create({
    name,
    owner: req.user?._id,
  });

  if (!playList) {
    throw new Error("Faild to create Playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "PlayList successfully created"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playList)) {
      throw new ApiError(400, "invalid playList id provided");
    }
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "invalid video id provided");
    }

    //check for playlist exist or not
    const playList = await PlayList.findById(playlistId);
    if (!playList) {
      throw new ApiError(404, "Playlist not found");
    }
    //check for video  exist or not
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "video not found");
    }

    const updatedPlaylist = await PlayList.findByIdAndUpdate(
      playList?._id,
      {
        $addToSet: {
          videos: videoId,
        },
      },
      {
        new: true,
      }
    );
    if (!updatePlaylist) {
      throw new ApiError(404, "Playlist not found !");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist"));
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "User not permitted for the action"
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playList)) {
    throw new ApiError(400, "invalid playList id provided");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id provided");
  }

  const playList = await PlayList.findById(playlistId);
  if (!playList) {
    throw new ApiError(404, "Playlist not found");
  }
  //check for video  exist or not
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playList?._id,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );
  if (!updatePlaylist) {
    throw new ApiError(404, "Playlist not found !");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playList id provided ");
  }

  const deletedPlaylist = await PlayList.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedPlaylist, "PlayList deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name } = req.body;

  //TODO: update playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(
      400,
      "invalid playList id provided to update the playList name"
    );
  }
  const playList = await PlayList.findById(playlistId);
  if (!playList) {
    throw new ApiError(404, "PlayList not found");
  }

  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playList,
    {
      $set: {
        name,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "PlayList updation successful")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
    


});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User ID Provided");
  }
  const userPlaylists = await PlayList.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
