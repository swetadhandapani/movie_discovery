import { Router } from "express";
import {
  listWatchlist,
  addWatchlist,
  removeWatchlist
} from "../controllers/watchlist.controller.js";

const router = Router();

router.get("/", listWatchlist);
router.post("/", addWatchlist);
router.delete("/:id", removeWatchlist);

export default router;
