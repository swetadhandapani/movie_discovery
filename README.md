# CineScope — Movie Discovery App

A full-stack movie discovery application built with **React, Node.js, Express, MongoDB, and the Watchmode API**.

CineScope allows users to discover movies, search for titles, view detailed movie information, check streaming availability, and maintain a personal watchlist.

## Features

* Movie discovery with pagination
* Search movies by title
* Popular movie discovery
* Recent movie discovery
* Sort movies by:

  * Most popular
  * Newest releases
  * Oldest releases
  * Title A–Z
* Filter movies by year
* Filter movies by genre
* Movie details page
* Movie title, year, genre, rating, runtime, release date, and overview when available
* Trailer link when supplied by Watchmode
* Streaming availability and supported services
* Add movies to a watchlist
* Remove movies from a watchlist
* MongoDB-backed watchlist
* Loading states
* Empty states
* Error handling
* Responsive navigation
* Backend API for all Watchmode communication
* Watchmode API key kept securely on the backend
* Server-side response normalization
* Simple in-memory caching to reduce repeated API requests
* Request deduplication for simultaneous identical API requests

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express
* Axios
* MongoDB
* Mongoose
* dotenv
* CORS

### External API

* Watchmode API

## Architecture

```text
React (Vite)
     |
     | HTTP requests
     v
Node.js + Express
     |
     +-------------> Watchmode API
     |
     +-------------> MongoDB
```

The frontend communicates only with the Express backend.

The backend is responsible for:

* Communicating with Watchmode
* Keeping the Watchmode API key private
* Normalizing Watchmode responses
* Handling API errors
* Caching API responses
* Managing the MongoDB watchlist

## Project Structure

```text
movie-discovery/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── ...
│   ├── .env.example
│   ├── package.json
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── ...
│   ├── .env.example
│   ├── package.json
│   └── ...
│
└── README.md
```

## Requirements

Before running the project, make sure you have:

* Node.js 18 or later
* MongoDB running locally or a MongoDB connection string
* A Watchmode API key

## Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

### 2. Backend Setup

Open a terminal and run:

```bash
cd server
npm install
```

Create a `.env` file from `.env.example`.

Example:

```env
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/movie_discovery

WATCHMODE_API_KEY=YOUR_WATCHMODE_API_KEY

CLIENT_URL=http://localhost:5173

CACHE_TTL_MS=120000

WATCHMODE_REGION=US
```

Start the backend:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file from `.env.example` if required.

Example:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the Vite URL displayed in the terminal, usually:

```text
http://localhost:5173
```

## Environment Variables

### Backend

| Variable            | Description                            |
| ------------------- | -------------------------------------- |
| `PORT`              | Port used by the Express server        |
| `MONGODB_URI`       | MongoDB connection string              |
| `WATCHMODE_API_KEY` | Watchmode API key                      |
| `CLIENT_URL`        | Frontend URL used for CORS             |
| `CACHE_TTL_MS`      | Cache duration in milliseconds         |
| `WATCHMODE_REGION`  | Region used for streaming availability |

### Frontend

| Variable            | Description                 |
| ------------------- | --------------------------- |
| `VITE_API_BASE_URL` | Base URL of the Express API |

## API Routes

### Health Check

```http
GET /api/health
```

Checks whether the backend is running.

### Movie Discovery

```http
GET /api/movies/discover
```

Supports pagination, sorting, year filtering, and genre filtering.

Example:

```http
GET /api/movies/discover?page=1&limit=24&sortBy=popularity_desc
```

### Search Movies

```http
GET /api/movies/search?q=inception
```

Supports pagination.

Example:

```http
GET /api/movies/search?q=inception&page=1&limit=24
```

### Movie Details

```http
GET /api/movies/:id
```

Returns normalized movie information and available sources.

Example:

```http
GET /api/movies/12345
```

### Movie Sources

```http
GET /api/movies/:id/sources
```

Returns streaming availability for the selected movie.

Example:

```http
GET /api/movies/12345/sources
```

### Get Watchlist

```http
GET /api/watchlist
```

Returns movies saved in the watchlist.

### Add to Watchlist

```http
POST /api/watchlist
```

Adds a movie to the MongoDB-backed watchlist.

### Remove from Watchlist

```http
DELETE /api/watchlist/:id
```

Removes a movie from the watchlist.

## Caching

The backend uses a simple in-memory cache to reduce unnecessary Watchmode API requests.

Frequently requested data such as:

* Movie discovery results
* Search results
* Movie details
* Streaming sources
* Genres

can be cached for the configured duration.

The cache duration is controlled by:

```env
CACHE_TTL_MS=120000
```

The application also uses request deduplication so that simultaneous requests for the same resource can share a single pending API request instead of creating multiple identical Watchmode requests.

## Error Handling

The backend handles common Watchmode API errors, including:

* Invalid or missing API key
* API rate limits
* API quota exhaustion
* Movie not found
* Upstream API errors
* General server errors
* Unknown routes

The frontend displays appropriate error messages and loading states when requests fail.

## Security

The Watchmode API key is **never exposed to the React frontend**.

The frontend communicates with the Express backend, and the backend communicates with Watchmode.

```text
Browser
   |
   v
Express API
   |
   v
Watchmode
```

The API key is stored only in:

```text
server/.env
```

Do not commit this file to GitHub.

Make sure `.gitignore` contains:

```text
.env
```

## Watchmode API

The application uses Watchmode for movie metadata and streaming availability.

Watchmode currently offers a free Developer plan with limited monthly API credits for non-commercial use. Check the current Watchmode terms and limits before deployment.

Watchmode requires attribution on the free plan. Image URLs returned by Watchmode may also point to third-party assets, so review the current Watchmode terms and the rights associated with any images before public deployment.

## Application Flow

The recommended demo flow is:

1. Open **Discover**
2. Browse popular movies
3. Use year or genre filters
4. Change the sorting option
5. Navigate through movie pages using pagination
6. Search for a movie
7. Open a movie's details page
8. View movie information
9. View available streaming sources
10. Open the trailer when available
11. Add the movie to the watchlist
12. Open **Watchlist**
13. Remove the movie from the watchlist

## Main Pages

### Discover

The Discover page displays movies from Watchmode and provides:

* Pagination
* Year filtering
* Genre filtering
* Sorting
* Movie cards
* Loading states
* Empty states
* Error handling

### Search

The Search page allows users to search movies by title and browse the resulting movies with pagination.

### Movie Details

The Movie Details page displays available information such as:

* Title
* Year
* Runtime
* User rating
* Critic score
* Genres
* Overview
* Trailer
* Streaming availability

Users can also add or remove the movie from their watchlist.

### Watchlist

The Watchlist page displays movies saved by the user.

Users can:

* View saved movies
* Open a movie's details
* Remove movies
* Return to movie discovery when the list is empty

## Product Decisions

The frontend never communicates directly with Watchmode.

Instead:

```text
React
  ↓
Express Backend
  ↓
Watchmode API
```

This provides a clean separation between the frontend and external API provider.

The Express backend:

* Protects the Watchmode API key
* Provides a consistent API for the frontend
* Normalizes Watchmode responses
* Handles errors centrally
* Provides caching
* Makes it easier to replace or extend the movie provider in the future

The watchlist is stored separately in MongoDB.

## Important Notes

Do not commit:

```text
server/.env
```

to the repository.

Do not expose:

```text
WATCHMODE_API_KEY
```

in frontend code or client-side environment variables.

For public deployment, review:

* Watchmode API limits
* Watchmode attribution requirements
* Watchmode terms of use
* Rights for movie/poster images
* Streaming provider links and availability

## License

This project is intended as a movie discovery application project/demo. Movie metadata, streaming availability, images, and other third-party content are provided by their respective services and remain subject to their respective terms and rights.
