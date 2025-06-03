import { XIcon } from "@phosphor-icons/react";
import "./index.css";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const apiKey = process.env.REACT_APP_API_KEY;

export default function App() {
  const [movies, setMovies] = useState(null);
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false);
  const [isMovieDetailsOpen, setIsMovieDetailsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [query, setQuery] = useState("");
  const [watchList, setWatchList] = useState([]);
  const [filterBy, setFilterBy] = useState("all");

  function handleAddMovie() {
    if (isMovieDetailsOpen) setIsMovieDetailsOpen(false);
    setIsAddMovieOpen(!isAddMovieOpen);
    if (movies) {
      setMovies(null);
      setQuery("");
    }
  }

  function handleMovieDetails(movie) {
    if (isAddMovieOpen) setIsAddMovieOpen(false);
    setIsMovieDetailsOpen(true);
    setSelectedMovie(movie);
  }

  function handleMovieDetailClose() {
    setIsMovieDetailsOpen(false);
    setSelectedMovie(null);
  }

  function handleAddToWatchlist(currMovie) {
    if (watchList?.some((movie) => movie.id === currMovie.id)) return;

    setWatchList((list) => (list ? [...list, currMovie] : [currMovie]));
  }

  function handleRemoveFromWatchlist(currMovie) {
    const updatedWatchlist = watchList.filter(
      (movie) => movie.id !== currMovie.id
    );

    if (updatedWatchlist) {
      setWatchList(updatedWatchlist);
      setIsMovieDetailsOpen(false);
    }
  }

  function handleMarkAsWatched(currMovie) {
    const updatedData = watchList.map((movie) =>
      movie.id === currMovie.id ? { ...movie, watched: !movie.watched } : movie
    );

    setWatchList(updatedData);
  }

  function handleFilter(value) {
    setFilterBy(value);
  }

  const handleMovie = useCallback(async (movieName) => {
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/search/movie?query=${movieName}&api_key=${apiKey}`
      );

      const fetchedMovies = res.data.results.map(
        ({
          id,
          original_title,
          overview,
          poster_path,
          release_date,
          vote_average,
        }) => ({
          id,
          original_title,
          overview,
          poster_path: poster_path
            ? `https://image.tmdb.org/t/p/w500//${poster_path}`
            : null,
          release_date: release_date.slice(0, 4),
          vote_average,
        })
      );

      setMovies(fetchedMovies);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  }, []);

  return (
    <div className="app">
      <div className="left-section">
        <Header onAddMovie={handleAddMovie} />
        <hr className="grey-line" />
        <Stats
          watchList={watchList}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          handleFilter={handleFilter}
        />
        <MovieListBox
          onMovieDetails={handleMovieDetails}
          watchList={watchList}
          onRemove={handleRemoveFromWatchlist}
          onMarkAsWatched={handleMarkAsWatched}
          filterBy={filterBy}
        />
      </div>

      <div className="right-section">
        <MovieSearchBox
          isAddMovieOpen={isAddMovieOpen}
          onSearchMovie={handleMovie}
          movies={movies}
          setMovies={setMovies}
          query={query}
          setQuery={setQuery}
          onAddToWatchlist={handleAddToWatchlist}
        />
        <MovieFullDetails
          isMovieDetailsOpen={isMovieDetailsOpen}
          selectedMovie={selectedMovie}
          handleMovieDetailClose={handleMovieDetailClose}
        />
      </div>
    </div>
  );
}

function Header({ onAddMovie }) {
  return (
    <div className="header">
      <div>
        <h2>Watchlist</h2>
        <p>All your favourite movies in one place</p>
      </div>
      <AddMovieButton handleAddMovie={onAddMovie} />
    </div>
  );
}

function Stats({ watchList, filterBy, handleFilter }) {
  return watchList.length !== 0 ? (
    <div className="stats">
      <div className="filter">
        <label>Filter by:</label>
        <select value={filterBy} onChange={(e) => handleFilter(e.target.value)}>
          <option value="all">All </option>
          <option value="watched">Watched</option>
          <option value="not watched">Not Watched</option>
        </select>
      </div>
    </div>
  ) : (
    <div className="stats"></div>
  );
}

function MovieListBox({
  onMovieDetails,
  watchList,
  onRemove,
  onMarkAsWatched,
  filterBy,
}) {
  let watchListMovies = watchList;

  if (filterBy === "all") watchListMovies = watchList;

  if (filterBy === "watched")
    watchListMovies = watchList.filter((movie) => movie.watched === true);

  if (filterBy === "not watched")
    watchListMovies = watchList.filter((movie) => movie.watched === false);

  return watchList.length !== 0 ? (
    <div className="movie-list">
      {watchListMovies?.map((movie) => (
        <MovieBox
          key={movie.id}
          id={movie.id}
          image={movie.image}
          title={movie.title}
          overview={movie.overview || "No description available"}
          releaseDate={movie.releaseDate || "N/A"}
          averagevote={movie.averagevote}
          watched={movie.watched}
          handleMovieDetails={onMovieDetails}
          movie={movie}
          onRemove={onRemove}
          onMarkAsWatched={onMarkAsWatched}
        />
      ))}
    </div>
  ) : (
    <h1
      style={{
        color: "#444",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "18rem 0",
        fontSize: "xx-large",
        fontWeight: "normal",
      }}
    >
      Start Adding Movies to Show here
    </h1>
  );
}

function MovieBox({
  movie,
  id,
  image,
  title,
  overview,
  releaseDate,
  averagevote,
  watched,
  handleMovieDetails,
  onMarkAsWatched,
  onRemove,
}) {
  return (
    <div className={watched ? "movie-box watched" : "movie-box"}>
      <img src={image ? image : "./noimage.jpg"} alt="movie-poster" />
      <h1
        onClick={() =>
          handleMovieDetails({
            id,
            image,
            title,
            overview,
            releaseDate,
            averagevote: averagevote || 0,
          })
        }
      >
        {title}
      </h1>
      <div className="movie-info">
        <p className="overview" data-tooltip={overview}>
          {overview}
        </p>
        <p>{releaseDate}</p>
      </div>
      <div className="button">
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            name="watched"
            checked={watched}
            onChange={() => onMarkAsWatched(movie)}
          />
          <span>Mark as Watched</span>
        </label>
        <button className="remove" onClick={() => onRemove(movie)}>
          Remove
        </button>
      </div>
    </div>
  );
}

function MovieSearchBox({
  movies,
  setMovies,
  isAddMovieOpen,
  onSearchMovie,
  query,
  setQuery,
  onAddToWatchlist,
}) {
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query) {
        onSearchMovie(query);
      } else {
        setMovies(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, onSearchMovie, setMovies]);

  return (
    <div className={isAddMovieOpen ? "movie-search" : "movie-search hide"}>
      <div className="movie-search-box">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {movies?.map((movie) => (
        <MovieSuggestion
          key={movie.id}
          movie={{
            id: movie.id,
            image: movie.poster_path,
            title: movie.original_title,
            overview: movie.overview || "No description available",
            releaseDate: movie.release_date || "N/A",
            averagevote: movie.vote_average,
          }}
          onAddToWatchlist={onAddToWatchlist}
        />
      ))}
    </div>
  );
}

function MovieSuggestion({ movie, onAddToWatchlist }) {
  const { image, title, overview, releaseDate } = movie;

  return (
    <div
      className="movie-suggestion"
      onClick={() => onAddToWatchlist({ ...movie, watched: false })}
    >
      <img src={image || "./noimage.jpg"} alt="movie-poster" />
      <div className="movie-suggestion-info">
        <p>
          <strong>{title}</strong>
        </p>
        <p>{overview.slice(0, 100)}</p>
        <p>{releaseDate}</p>
      </div>
    </div>
  );
}

function AddMovieButton({ handleAddMovie }) {
  return (
    <button className="add-movie-button" onClick={handleAddMovie}>
      Add Movie to Watchlist
    </button>
  );
}

function MovieFullDetails({
  isMovieDetailsOpen,
  selectedMovie,
  handleMovieDetailClose,
}) {
  if (!selectedMovie) return null;

  return (
    <div
      className={
        isMovieDetailsOpen ? "full-movie-details" : "full-movie-details hide"
      }
    >
      <XIcon
        size={32}
        weight="bold"
        className="close-icon"
        onClick={handleMovieDetailClose}
      />
      <img src={selectedMovie.image || "./noimage.jpg"} alt="selected-movie" />
      <div className="full-movie-main-details">
        <p>{selectedMovie.title}</p>
        <p>{selectedMovie.releaseDate}</p>
      </div>
      <p>{selectedMovie.overview}</p>
      <div className="rating">
        <CircularRating score={selectedMovie.averagevote || 0} />
        <p>Rating</p>
      </div>
    </div>
  );
}

function CircularRating({ score }) {
  const radius = 26;
  const stroke = 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = (score / 10) * circumference;

  return (
    <svg width="52" height="52" className="rating">
      <circle
        cx="26"
        cy="26"
        r={normalizedRadius}
        stroke="#2c2c2c"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx="26"
        cy="26"
        r={normalizedRadius}
        stroke="#f9b814"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#fff"
        fontSize="16"
        fontWeight="bold"
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
}
