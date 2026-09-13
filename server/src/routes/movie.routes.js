import { Router } from "express";

import {
  discover,
  genres,
  search,
  details,
  sources
} from "../controllers/movie.controller.js";

const router = Router();

router.get("/discover", discover);

router.get("/genres", genres);

router.get("/search", search);

router.get("/:id/sources", sources);

router.get("/:id", details);

export default router;