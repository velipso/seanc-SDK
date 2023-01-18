//
// seanc-SDK - A wonderfully made SDK for the-one-api.dev
// by Sean Connelly (@velipso), https://sean.cm
// Project Home: https://github.com/velipso/seanc-SDK
// SPDX-License-Identifier: MIT
//

import { TheOneAPI } from "https://raw.githubusercontent.com/velipso/seanc-SDK/main/src/api.ts";
import { TheOneSDK } from "https://raw.githubusercontent.com/velipso/seanc-SDK/main/src/sdk.ts";

// First, you need to create your API using your access token
const api = new TheOneAPI(
  "YourAccessTokenHere",
  (msg: string) => console.log(msg),
);

// Now you can create the SDK
const sdk = new TheOneSDK(api);

// Fetch all movies (no paging required)
const movies = await sdk.allMovies();
console.log(movies);

// Get a single movie
const movie = await sdk.getMovie("5cd95395de30eff6ebccde5d");
console.log(movie);

// Get all movie quotes (no paging required)
const quotes = await sdk.getMovieQuotes("5cd95395de30eff6ebccde5d");
console.log(quotes);
