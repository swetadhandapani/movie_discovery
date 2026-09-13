import express from "express";
import cors from "cors";
import { env } from "./config.js";
import { connectDatabase } from "./db.js";
import movieRoutes from "./routes/movie.routes.js";
import watchlistRoutes from "./routes/watchlist.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

app.use(
  cors({
    origin: env.clientUrl
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "movie-discovery-api" });
});

app.use("/api/movies", movieRoutes);
app.use("/api/watchlist", watchlistRoutes);

app.use(notFound);
app.use(errorHandler);

connectDatabase()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`Server running at http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
