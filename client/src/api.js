import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 12000,
});

export async function getDiscover(params = {}) {
  const { data } = await api.get("/movies/discover", { params });
  return data;
}

export async function getGenres() {
  const { data } = await api.get("/movies/genres");
  return data;
}

export async function searchMovies(q, params = {}) {
  const { data } = await api.get("/movies/search", {
    params: { q, ...params },
  });
  return data;
}

export async function getMovie(id) {
  const { data } = await api.get(`/movies/${id}`);
  return data;
}

export async function getWatchlist() {
  const { data } = await api.get("/watchlist");
  return data;
}

export async function addWatchlist(movie) {
  const { data } = await api.post("/watchlist", movie);
  return data;
}

export async function removeWatchlist(id) {
  const { data } = await api.delete(`/watchlist/${id}`);
  return data;
}
