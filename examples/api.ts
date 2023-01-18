//
// seanc-SDK - A wonderfully made SDK for the-one-api.dev
// by Sean Connelly (@velipso), https://sean.cm
// Project Home: https://github.com/velipso/seanc-SDK
// SPDX-License-Identifier: MIT
//

import { TheOneAPI } from "https://raw.githubusercontent.com/velipso/seanc-SDK/main/src/api.ts";

// Provide your access token to the API
const api = new TheOneAPI("YourAccessTokenHere");

// List movies, starting at offset 0, with a limit of 10
const movies = await api.listMovies({ offset: 0, limit: 10 });
console.log(movies);

// Get a single movie
const movie = await api.getMovie("5cd95395de30eff6ebccde5d");
console.log(movie);

// Get quotes from a movie
const quotes = await api.getMovieQuotes("5cd95395de30eff6ebccde5d", {
  offset: 0,
  limit: 10,
});
console.log(quotes);

// Resolve a character ID to a name
const name = await api.getCharacterName("5cd99d4bde30eff6ebccfe9e");
console.log(name);
