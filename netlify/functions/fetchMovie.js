// netlify/functions/searchMovie.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
  const movieName = event.queryStringParameters.query;

  const API_KEY = process.env.REACT_APP_API_KEY;
  const TMDB_URL = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
    movieName
  )}&api_key=${API_KEY}`;

  try {
    const response = await fetch(TMDB_URL);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch movie data" }),
    };
  }
};
