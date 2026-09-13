import mongoose from "mongoose";

const watchlistItemSchema = new mongoose.Schema(
  {
    movieId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    year: Number,
    posterUrl: String
  },
  { timestamps: true }
);

export const WatchlistItem = mongoose.model("WatchlistItem", watchlistItemSchema);
