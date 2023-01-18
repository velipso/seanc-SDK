#!/usr/bin/env -S deno run --check=all --allow-net --allow-env=SEANCSDK_TOKEN
//
// seanc-SDK - A wonderfully made SDK for the-one-api.dev
// by Sean Connelly (@velipso), https://sean.cm
// Project Home: https://github.com/velipso/seanc-SDK
// SPDX-License-Identifier: MIT
//

import { TheOneAPI } from "./api.ts";
import { TheOneSDK } from "./sdk.ts";

const tokenEnv = "SEANCSDK_TOKEN";
const token = Deno.env.get(tokenEnv);

if (!token) {
  console.error(`Error: Missing API access token

Please set the environment variable ${tokenEnv} to your
access token given by the-one-api.dev

Example:

$ env ${tokenEnv}='A123b123c123d123e123' ./src/cli.ts`);
  Deno.exit(1);
}

const api = new TheOneAPI(
  token,
  (msg: string) => console.log(`[${new Date()}] ${msg}`),
);
const sdk = new TheOneSDK(api);

const movies = await sdk.allMovies();
for (const movie of movies.values()) {
  console.log(movie.name);
}
