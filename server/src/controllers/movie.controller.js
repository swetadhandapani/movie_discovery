import {
  discoverMovies,
  searchMovies,
  getMovieDetails,
  getMovieSources,
  getGenres,
} from "../services/watchmode.service.js";


export async function discover(
  req,
  res,
  next
) {
  try {
    const data =
      await discoverMovies({
        page: req.query.page,
        limit: req.query.limit,
        sortBy:
          req.query.sortBy ||
          "popularity_desc",
        year: req.query.year,
        genre: req.query.genre,
      });

    res.json(data);
  } catch (error) {
    next(error);
  }
}


export async function genres(
  req,
  res,
  next
) {
  try {
    const data =
      await getGenres();

    res.json(data);
  } catch (error) {
    next(error);
  }
}


export async function search(
  req,
  res,
  next
) {
  try {
    const query = String(
      req.query.q || ""
    ).trim();

    if (!query) {
      return res.status(400).json({
        message:
          "Search query is required",
      });
    }

    if (query.length < 2) {
      return res.status(400).json({
        message:
          "Search query must contain at least 2 characters",
      });
    }

    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );

    const limit = Math.min(
      48,
      Math.max(
        1,
        Number(req.query.limit) || 24
      )
    );

    const data =
      await searchMovies(
        query,
        {
          page,
          limit,
        }
      );

    res.json(data);
  } catch (error) {
    next(error);
  }
}


export async function details(
  req,
  res,
  next
) {
  try {
    const data =
      await getMovieDetails(
        req.params.id
      );

    res.json(data);
  } catch (error) {
    next(error);
  }
}


export async function sources(
  req,
  res,
  next
) {
  try {
    const data =
      await getMovieSources(
        req.params.id
      );

    res.json(data);
  } catch (error) {
    next(error);
  }
}