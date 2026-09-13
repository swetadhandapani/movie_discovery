import axios from "axios";
import { env } from "../config.js";
import { getCached, setCached } from "../utils/cache.js";

const client = axios.create({
  baseURL: "https://api.watchmode.com/v1",
  timeout: 10000,
  headers: {
    "X-API-Key": env.watchmodeApiKey,
    Accept: "application/json",
  },
});


const pendingRequests = new Map();


async function getCachedOrFetch(cacheKey, fetcher) {
  const cached = getCached(cacheKey);

  if (cached) {
    return cached;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const request = fetcher()
    .then((data) => {
      setCached(
        cacheKey,
        data,
        env.cacheTtlMs
      );

      return data;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(
    cacheKey,
    request
  );

  return request;
}


function normalizeTitle(item = {}) {
  return {
    id: item.id,

    title:
      item.title ??
      item.name ??
      "Untitled",

    name:
      item.name ??
      item.title ??
      "Untitled",

    year:
      item.year ??
      null,

    type:
      item.type ??
      null,

    imdbId:
      item.imdb_id ??
      null,

    tmdbId:
      item.tmdb_id ??
      null,

    
    posterUrl:
      item.poster ??
      item.poster_url ??
      item.posterMedium ??
      item.posterLarge ??
      item.image_url ??
      item.image ??
      null,

    overview:
      item.plot_overview ??
      item.overview ??
      item.description ??
      null,

    releaseDate:
      item.release_date ??
      null,

    runtimeMinutes:
      item.runtime_minutes ??
      null,

    userRating:
      item.user_rating ??
      null,

    criticScore:
      item.critic_score ??
      null,

    genreNames:
      item.genre_names ??
      item.genres ??
      [],

    trailer:
      item.trailer ??
      null,

    trailerThumbnail:
      item.trailer_thumbnail ??
      null,

    similarTitles:
      item.similar_titles ??
      [],
  };
}


export async function searchMovies(
  query,
  {
    page = 1,
    limit = 24,
  } = {}
) {
  const safePage = Math.max(
    1,
    Number(page) || 1
  );

  const safeLimit = Math.min(
    48,
    Math.max(
      1,
      Number(limit) || 24
    )
  );

  const safeQuery = String(
    query || ""
  ).trim();

  const cacheKey = [
    "search",
    safeQuery.toLowerCase(),
    safePage,
    safeLimit,
  ].join(":");

  return getCachedOrFetch(
    cacheKey,
    async () => {
      
      const response =
        await client.get(
          "/autocomplete-search",
          {
            params: {
              search_value:
                safeQuery,
              search_type: 3,
            },
          }
        );

      
      const titleResults =
        response.data.results ||
        response.data.title_results ||
        [];

      
      const normalizedResults =
        titleResults.map(
          normalizeTitle
        );

      
      const totalResults =
        normalizedResults.length;

      const totalPages =
        totalResults > 0
          ? Math.ceil(
              totalResults /
                safeLimit
            )
          : 0;

      const startIndex =
        (safePage - 1) *
        safeLimit;

      const endIndex =
        startIndex +
        safeLimit;

      const results =
        normalizedResults.slice(
          startIndex,
          endIndex
        );

      return {
        page: safePage,
        limit: safeLimit,
        totalResults,
        totalPages,
        results,
      };
    }
  );
}


export async function getGenres() {
  const cacheKey =
    "genres";

  return getCachedOrFetch(
    cacheKey,
    async () => {
      const response =
        await client.get(
          "/genres"
        );

      return (
        response.data || []
      );
    }
  );
}


export async function discoverMovies({
  page = 1,
  limit = 24,
  sortBy = "popularity_desc",
  year,
  genre,
}) {
  const safePage = Math.max(
    1,
    Number(page) || 1
  );

  const safeLimit = Math.min(
    48,
    Math.max(
      1,
      Number(limit) || 24
    )
  );

  const safeSort = [
    "popularity_desc",
    "release_date_desc",
    "release_date_asc",
    "title_asc",
  ].includes(sortBy)
    ? sortBy
    : "popularity_desc";

  const safeYear =
    year &&
    /^\d{4}$/.test(
      String(year)
    )
      ? Number(year)
      : null;

  const safeGenre =
    genre &&
    /^\d+$/.test(
      String(genre)
    )
      ? Number(genre)
      : null;

  const cacheKey = [
    "discover",
    safePage,
    safeLimit,
    safeSort,
    safeYear || "",
    safeGenre || "",
    env.watchmodeRegion,
  ].join(":");

  return getCachedOrFetch(
    cacheKey,
    async () => {
      const params = {
        types: "movie",
        regions:
          env.watchmodeRegion,
        sort_by: safeSort,
        page: safePage,
        limit: safeLimit,
      };

      
      if (safeGenre) {
        params.genres =
          String(safeGenre);
      }

      
      if (safeYear) {
        params.release_date_start =
          Number(
            `${safeYear}0101`
          );

        params.release_date_end =
          Number(
            `${safeYear}1231`
          );
      }

      
      const response =
        await client.get(
          "/list-titles",
          {
            params,
          }
        );

      const titles =
        response.data.titles ||
        [];

      
      const detailedResults =
        await Promise.allSettled(
          titles.map(async (item) => {
            const movieId =
              item.id;

            if (!movieId) {
              return normalizeTitle(
                item
              );
            }

            const details =
              await getMovieDetails(
                movieId
              );

            return {
              ...normalizeTitle(
                item
              ),
              ...details,
              id: movieId,
              title:
                details.title ||
                item.title ||
                "Untitled",
            };
          })
        );

      const results =
        detailedResults.map(
          (result, index) => {
            if (
              result.status ===
              "fulfilled"
            ) {
              return result.value;
            }

          
            console.error(
              `Failed to load details for movie ${titles[index]?.id}:`,
              result.reason?.message ||
                result.reason
            );

            return normalizeTitle(
              titles[index]
            );
          }
        );

      return {
        page:
          response.data.page,

        totalResults:
          response.data
            .total_results,

        totalPages:
          response.data
            .total_pages,

        results,
      };
    }
  );
}


export async function getMovieDetails(
  id
) {
  const cacheKey =
    `details:${id}`;

  return getCachedOrFetch(
    cacheKey,
    async () => {
      const response =
        await client.get(
          `/title/${encodeURIComponent(
            id
          )}/details`,
          {
            params: {
              append_to_response:
                "sources",
            },
          }
        );

      const data =
        normalizeTitle(
          response.data
        );

      data.sources =
        response.data.sources ||
        [];

      return data;
    }
  );
}

export async function getMovieSources(
  id
) {
  const cacheKey = [
    "sources",
    id,
    env.watchmodeRegion,
  ].join(":");

  return getCachedOrFetch(
    cacheKey,
    async () => {
      const response =
        await client.get(
          `/title/${encodeURIComponent(
            id
          )}/sources`,
          {
            params: {
              regions:
                env.watchmodeRegion,
            },
          }
        );

      return {
        sources:
          response.data || [],
      };
    }
  );
}