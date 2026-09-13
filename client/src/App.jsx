import React, { useEffect, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  addWatchlist,
  getGenres,
  getDiscover,
  getMovie,
  getWatchlist,
  removeWatchlist,
  searchMovies,
} from "./api.js";

function App() {
  return (
    <div className="app-shell">
      <Header />

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

 
  useEffect(() => {
    if (location.pathname === "/search") {
      const params = new URLSearchParams(location.search);
      const urlQuery = params.get("q") || "";

      setQuery(urlQuery);
    } else {
      setQuery("");
    }
  }, [location.pathname, location.search]);

  function submit(e) {
    e.preventDefault();

    const value = query.trim();

    if (!value) {
      return;
    }

    setMenuOpen(false);

    navigate(`/search?q=${encodeURIComponent(value)}`);
  }

  function clearSearch() {
    setQuery("");

    if (location.pathname === "/search") {
      navigate("/search");
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="header">
      <div className="nav container">
        <Link
          to="/"
          className="brand"
          onClick={() => {
            closeMenu();
            setQuery("");
          }}
        >
          <span className="brand-mark">C</span>
          CineScope
        </Link>

        <form className="search-form" onSubmit={submit}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies..."
            aria-label="Search movies"
          />

          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={clearSearch}
              aria-label="Clear search"
              title="Clear search"
            >
              ×
            </button>
          )}

          <button type="submit">Search</button>
        </form>

        {/* DESKTOP NAV */}
        <nav className="desktop-nav">
          <Link
            to="/"
            onClick={() => {
              closeMenu();
              setQuery("");
            }}
          >
            Discover
          </Link>

          <Link to="/watchlist" onClick={closeMenu}>
            Watchlist
          </Link>
        </nav>

        {/* MOBILE / TABLET MENU */}
        <button
          type="button"
          className={`menu-button ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {menuOpen && (
          <div className="mobile-menu">
            <Link
              to="/"
              onClick={() => {
                closeMenu();
                setQuery("");
              }}
            >
              <span className="menu-icon">⌂</span>
              Discover
            </Link>

            <Link to="/watchlist" onClick={closeMenu}>
              <span className="menu-icon">♡</span>
              Watchlist
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}


function CustomSelect({
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!event.target.closest(".custom-select")) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const selectedOption = options.find(
    (option) =>
      String(option.value) === String(value)
  );

  const displayValue =
    selectedOption?.label || placeholder;

  function selectOption(option) {
    onChange(option.value);
    setOpen(false);
  }

  return (
    <div
      className={`custom-select ${
        open ? "is-open" : ""
      } ${disabled ? "is-disabled" : ""}`}
    >
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        aria-label={ariaLabel}
        aria-expanded={open}
        disabled={disabled}
      >
        <span className="custom-select-value">
          {displayValue}
        </span>

        <span className="custom-select-arrow">↓</span>
      </button>

      {open && (
        <div className="custom-select-menu">
          {options.map((option) => (
            <button
              type="button"
              key={String(option.value)}
              className={`custom-select-option ${
                String(option.value) === String(value)
                  ? "selected"
                  : ""
              }`}
              onClick={() => selectOption(option)}
            >
              <span>{option.label}</span>

              {String(option.value) === String(value) && (
                <span className="option-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Home() {
  const [data, setData] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genresLoading, setGenresLoading] = useState(true);
  const [error, setError] = useState("");
  const [genreError, setGenreError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);

  const page = Number(params.get("page")) || 1;
  const sortBy =
    params.get("sortBy") || "popularity_desc";
  const year = params.get("year") || "";
  const genre = params.get("genre") || "";

  function updateFilters(changes = {}) {
    const next = new URLSearchParams(location.search);

    Object.entries(changes).forEach(([key, value]) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    if (
      changes.sortBy !== undefined ||
      changes.year !== undefined ||
      changes.genre !== undefined
    ) {
      next.set("page", "1");
    }

    const queryString = next.toString();

    navigate(
      queryString ? `/?${queryString}` : "/"
    );
  }

  function changePage(nextPage) {
    const next = new URLSearchParams(location.search);

    next.set("page", String(nextPage));

    navigate(`/?${next.toString()}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  useEffect(() => {
    let active = true;

    async function loadGenres() {
      setGenresLoading(true);
      setGenreError("");

      try {
        const result = await getGenres();

        if (active) {
          setGenres(
            [...result].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );
        }
      } catch (err) {
        if (active) {
          setGenreError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setGenresLoading(false);
        }
      }
    }

    loadGenres();

    return () => {
      active = false;
    };
  }, []);



  useEffect(() => {
    let active = true;

    async function loadMovies() {
      setLoading(true);
      setError("");

      try {
        const result = await getDiscover({
          page,
          limit: 24,
          sortBy,
          year,
          genre,
        });

        if (active) {
          setData(result);
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMovies();

    return () => {
      active = false;
    };
  }, [page, sortBy, year, genre]);

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">MOVIE DISCOVERY</p>

          <h1>Find your next movie night.</h1>

          <p className="hero-copy">
            Explore a large catalog, search for titles, compare
            details and keep a personal watchlist.
          </p>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <p className="eyebrow">EXPLORE</p>
          <h2>Movies</h2>
        </div>

        <div className="filters">
          {/* YEAR */}
          <div className="filter-control">
            <CustomSelect
              value={year}
              onChange={(value) =>
                updateFilters({
                  year: value,
                })
              }
              ariaLabel="Filter by year"
              placeholder="All years"
              options={[
                {
                  value: "",
                  label: "All years",
                },

                ...Array.from(
                  {
                    length:
                      new Date().getFullYear() -
                      1950 +
                      1,
                  },
                  (_, index) => {
                    const movieYear =
                      new Date().getFullYear() - index;

                    return {
                      value: movieYear,
                      label: String(movieYear),
                    };
                  }
                ),
              ]}
            />
          </div>

          {/* GENRE */}
          <div className="filter-control">
            <CustomSelect
              value={genre}
              onChange={(value) =>
                updateFilters({
                  genre: value,
                })
              }
              ariaLabel="Filter by genre"
              placeholder={
                genresLoading
                  ? "Loading genres..."
                  : "All genres"
              }
              disabled={genresLoading}
              options={[
                {
                  value: "",
                  label: "All genres",
                },

                ...genres.map((item) => ({
                  value: item.id,
                  label: item.name,
                })),
              ]}
            />
          </div>

          {/* SORT */}
          <div className="filter-control">
            <CustomSelect
              value={sortBy}
              onChange={(value) =>
                updateFilters({
                  sortBy: value,
                })
              }
              ariaLabel="Sort movies"
              placeholder="Most popular"
              options={[
                {
                  value: "popularity_desc",
                  label: "Most popular",
                },
                {
                  value: "release_date_desc",
                  label: "Newest releases",
                },
                {
                  value: "release_date_asc",
                  label: "Oldest releases",
                },
                {
                  value: "title_asc",
                  label: "Title A–Z",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {genreError && <ErrorBox message={genreError} />}

      {error && (
        <ErrorBox
          message={error}
          onRetry={() => {
            const current = new URLSearchParams(
              location.search
            );

            current.set("page", String(page));

            navigate(`/?${current.toString()}`);
          }}
        />
      )}

      {loading ? (
        <LoadingGrid />
      ) : (
        <MovieGrid
          movies={data?.results || []}
          emptyMessage={
            year || genre
              ? "No movies match your selected filters."
              : "No movies available."
          }
        />
      )}

      {!loading && data?.totalPages > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalResults={data.totalResults}
          onChange={changePage}
        />
      )}
    </>
  );
}

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);

  const q = params.get("q") || "";
  const page = Math.max(
    1,
    Number(params.get("page")) || 1
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(q));
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!q) {
      setData({
        results: [],
        page: 1,
        totalResults: 0,
        totalPages: 0,
      });

      setLoading(false);
      setError("");

      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");

    searchMovies(q, {
      page,
      limit: 24,
    })
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch((err) => {
        if (active) {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [q, page]);

  function changePage(nextPage) {
    const next = new URLSearchParams(
      location.search
    );

    next.set("q", q);
    next.set("page", String(nextPage));

    navigate(`/search?${next.toString()}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      <section className="page-title">
        <p className="eyebrow">SEARCH RESULTS</p>

        <h1>
          {q
            ? `Results for “${q}”`
            : "Search movies"}
        </h1>
      </section>

      {error && <ErrorBox message={error} />}

      {loading && <LoadingGrid />}

      {!loading && !error && (
        <>
          <MovieGrid
            movies={data?.results || []}
            emptyMessage="No movies found for this search."
          />

          {data?.totalPages > 1 && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalResults={data.totalResults}
              onChange={changePage}
            />
          )}
        </>
      )}
    </>
  );
}

function MovieGrid({
  movies,
  emptyMessage = "No movies available.",
}) {
  if (!movies.length) {
    return (
      <div className="empty-state">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
        />
      ))}
    </div>
  );
}

function MovieCard({ movie }) {
  const location = useLocation();

  return (
    <Link
      to={`/movie/${movie.id}${location.search}`}
      className="movie-card"
    >
      <div className="poster">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
          />
        ) : (
          <div className="poster-placeholder">
            {movie.title?.slice(0, 1) || "M"}
          </div>
        )}

        <span className="type-pill">
          Movie
        </span>
      </div>

      <div className="card-body">
        <h3>{movie.title}</h3>

        <p>
          {movie.year || "Year unavailable"}
        </p>
      </div>
    </Link>
  );
}

function MovieDetails() {
  const { id } = useParams();
  const location = useLocation();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      getMovie(id),
      getWatchlist(),
    ])
      .then(([movieData, watchlistData]) => {
        if (!active) return;

        setMovie(movieData);

        setSaved(
          watchlistData.items.some(
            (item) =>
              String(item.movieId) ===
              String(movieData.id)
          )
        );
      })
      .catch((err) => {
        if (active) {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function toggleWatchlist() {
    if (!movie) return;

    try {
      if (saved) {
        await removeWatchlist(movie.id);
        setSaved(false);
      } else {
        await addWatchlist({
          movieId: movie.id,
          title: movie.title,
          year: movie.year,
          posterUrl: movie.posterUrl,
        });

        setSaved(true);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) {
    return <LoadingDetails />;
  }

  if (error) {
    return <ErrorBox message={error} />;
  }

  if (!movie) {
    return null;
  }

  return (
    <article className="details">
      <div className="details-poster">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
          />
        ) : (
          <div className="poster-placeholder large">
            {movie.title?.slice(0, 1)}
          </div>
        )}
      </div>

      <div className="details-content">
        <Link
          to={`/${location.search}`}
          className="back-link"
        >
          ← Back to discover
        </Link>

        <p className="eyebrow">
          {movie.type || "MOVIE"}
        </p>

        <h1>{movie.title}</h1>

        <div className="meta-row">
          {movie.year && (
            <span>{movie.year}</span>
          )}

          {movie.runtimeMinutes && (
            <span>
              {movie.runtimeMinutes} min
            </span>
          )}

          {movie.userRating != null && (
            <span>
              ★ {movie.userRating}
            </span>
          )}

          {movie.criticScore != null && (
            <span>
              Critic {movie.criticScore}
            </span>
          )}
        </div>

        {movie.genreNames?.length > 0 && (
          <div className="chips">
            {movie.genreNames.map((genre) => (
              <span key={genre}>
                {genre}
              </span>
            ))}
          </div>
        )}

        <p className="overview">
          {movie.overview ||
            "No overview is available for this title."}
        </p>

        <div className="actions">
          <button
            className="primary-button"
            onClick={toggleWatchlist}
          >
            {saved
              ? "✓ In watchlist"
              : "+ Add to watchlist"}
          </button>

          {movie.trailer && (
            <a
              className="secondary-button"
              href={movie.trailer}
              target="_blank"
              rel="noreferrer"
            >
              Watch trailer
            </a>
          )}
        </div>

        {movie.sources?.length > 0 && (
          <section className="sources">
            <h2>Where to watch</h2>

            <div className="source-list">
              {movie.sources.map(
                (source, index) => (
                  <div
                    className="source-item"
                    key={`${
                      source.source_id ||
                      source.name
                    }-${index}`}
                  >
                    <strong>
                      {source.name ||
                        "Streaming service"}
                    </strong>

                    <span>
                      {source.type ||
                        source.source_type ||
                        "Available"}
                    </span>

                    {(source.web_url ||
                      source.link) && (
                      <a
                        href={
                          source.web_url ||
                          source.link
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    )}
                  </div>
                )
              )}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}


function Watchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await getWatchlist();

      setItems(data.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    try {
      await removeWatchlist(id);

      setItems((current) =>
        current.filter(
          (item) => item.movieId !== id
        )
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <section className="page-title">
        <p className="eyebrow">YOUR LIST</p>

        <h1>Watchlist</h1>
      </section>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <LoadingGrid />
      ) : (
        <div className="watchlist-grid">
          {items.length ? (
            items.map((item) => (
              <div
                className="watchlist-card"
                key={item.movieId}
              >
                <Link
                  to={`/movie/${item.movieId}`}
                  className="watchlist-link"
                >
                  <div className="poster small">
                    {item.posterUrl ? (
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                      />
                    ) : (
                      <div className="poster-placeholder">
                        {item.title?.slice(0, 1)}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3>{item.title}</h3>

                    <p>
                      {item.year ||
                        "Year unavailable"}
                    </p>
                  </div>
                </Link>

                <button
                  className="icon-button"
                  onClick={() =>
                    remove(item.movieId)
                  }
                  aria-label={`Remove ${item.title}`}
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h2>
                Your watchlist is empty
              </h2>

              <p>
                Add movies from their details
                page and they will appear here.
              </p>

              <Link
                className="primary-button inline"
                to="/"
              >
                Discover movies
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Pagination({
  page,
  totalPages,
  totalResults,
  onChange,
}) {
  function getPages() {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const pages = new Set();

    pages.add(1);
    pages.add(totalPages);

    for (
      let number = page - 2;
      number <= page + 2;
      number++
    ) {
      if (
        number > 1 &&
        number < totalPages
      ) {
        pages.add(number);
      }
    }

    return [...pages].sort(
      (a, b) => a - b
    );
  }

  const pages = getPages();
  const visiblePages = [];

  pages.forEach((number, index) => {
    const previous = pages[index - 1];

    if (
      previous &&
      number - previous > 1
    ) {
      visiblePages.push(
        <span
          key={`ellipsis-${number}`}
          className="pagination-ellipsis"
        >
          ...
        </span>
      );
    }

    visiblePages.push(
      <button
        key={number}
        className={
          number === page ? "active" : ""
        }
        onClick={() =>
          onChange(number)
        }
        aria-current={
          number === page
            ? "page"
            : undefined
        }
      >
        {number}
      </button>
    );
  });

  return (
    <div className="pagination-wrapper">
      <div className="pagination-info">
        {totalResults?.toLocaleString() || 0}{" "}
        movies
        <span>·</span>
        Page {page} of {totalPages}
      </div>

      <div className="pagination">
        <button
          className="pagination-nav"
          disabled={page === 1}
          onClick={() =>
            onChange(page - 1)
          }
        >
          ← Previous
        </button>

        <div className="pagination-pages">
          {visiblePages}
        </div>

        <button
          className="pagination-nav"
          disabled={
            page === totalPages
          }
          onClick={() =>
            onChange(page + 1)
          }
        >
          Next →
        </button>
      </div>
    </div>
  );
}


function LoadingGrid() {
  return (
    <div className="movie-grid">
      {Array.from({ length: 12 }).map(
        (_, index) => (
          <div
            className="skeleton-card"
            key={index}
          >
            <div className="skeleton poster"></div>

            <div className="skeleton-line"></div>

            <div className="skeleton-line short"></div>
          </div>
        )
      )}
    </div>
  );
}

function LoadingDetails() {
  return (
    <div className="loading-details">
      <div className="skeleton large-box"></div>

      <div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
    </div>
  );
}

function ErrorBox({
  message,
  onRetry,
}) {
  return (
    <div className="error-box">
      <strong>Something went wrong</strong>

      <p>{message}</p>

      {onRetry && (
        <button onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}


function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>CineScope</span>

        <span>
          Movie data powered by Watchmode
        </span>
      </div>
    </footer>
  );
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to load movie data."
  );
}

export default App;