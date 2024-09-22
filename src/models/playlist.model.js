import { Schema, Model } from "mongoose";

const playListSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "playlist name must required"],
    },
    videos: [{
      type: Schema.Types.ObjectId,
      ref: "Video",
    }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);      

export const PlayList = Model("PlayList", playListSchema);
