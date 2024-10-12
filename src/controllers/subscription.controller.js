import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }
  console.log("channelId: ", channelId)

  //const { userId } =  req.user._id;
  //console.log("userId : ", userId);
//   check if channel exists
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  //const user = await User.findById(userId);
 
  //if (!user) {
  //  throw new ApiError(404, "User not found");
  //}
  // check if user is already subscribed to channel
  const subscription = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });
  // unsubscribe
  if (subscription) {
    await Subscription.findByIdAndDelete(subscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed successfully"));
  }
  //subscribe
  else {
    const newSubscription = new Subscription({
      subscriber: req.user?._id,
      channel: channelId,
    });
    await newSubscription.save();
    return res
      .status(200)
      .json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  //if (!isValidObjectId(channelId)) {
  //  throw new ApiError(400, "Invalid channel id provided");
  //}
  const channel = await Subscription.findById(channelId);
  console.log("channel data ", channel);

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber"
  );
  if (!subscribers.length) {
    throw new ApiError(404, "No subscribers found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers found"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber id provided");
  }
  const subscriber = await User.findById(subscriberId);
  if (!subscriber.length) {
    throw new ApiError(404, "Subscriber not found");
  }
  const channels = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel");
  if (!channels.length) {
    throw new ApiError(404, "No subscribed channels found");
  }

  return res.status(200).json(new ApiResponse(200, channels, "Channels found"));
});

export { toggleSubscription, 
         getUserChannelSubscribers, 
         getSubscribedChannels };
