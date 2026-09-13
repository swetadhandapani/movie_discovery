import { WatchlistItem } from "../models/WatchlistItem.js";

export async function listWatchlist(req, res, next) {
  try {
    const items = await WatchlistItem.find().sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function addWatchlist(req, res, next) {
  try {
    const { movieId, title, year, posterUrl } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({ message: "movieId and title are required" });
    }

    const item = await WatchlistItem.findOneAndUpdate(
      { movieId: Number(movieId) },
      {
        movieId: Number(movieId),
        title,
        year: year || null,
        posterUrl: posterUrl || null
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
}

export async function removeWatchlist(req, res, next) {
  try {
    await WatchlistItem.deleteOne({ movieId: Number(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
