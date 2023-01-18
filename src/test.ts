#!/usr/bin/env -S deno test --check=all
//
// seanc-SDK - A wonderfully made SDK for the-one-api.dev
// by Sean Connelly (@velipso), https://sean.cm
// Project Home: https://github.com/velipso/seanc-SDK
// SPDX-License-Identifier: MIT
//

// deno-lint-ignore-file no-explicit-any require-await

import { IAPIDocument, IAPIMovie, TheOneAPI } from "./api.ts";
import { TheOneSDK } from "./sdk.ts";
import { assertEquals } from "https://deno.land/std@0.163.0/testing/asserts.ts";

const dummyMovieData: any = {
  name: "The Test Series",
  runtimeInMinutes: 234,
  budgetInMillions: 345,
  boxOfficeRevenueInMillions: 456,
  academyAwardNominations: 567,
  academyAwardWins: 67,
  rottenTomatoesScore: 9,
};

const dummyMovies: any = {
  docs: [{ _id: "123", ...dummyMovieData }],
  total: 1,
  offset: 0,
  limit: 10,
  page: 0,
  pages: 1,
};

Deno.test("get movies from API", async () => {
  const fetchFunc: any = () =>
    new Response(JSON.stringify(dummyMovies), { status: 200 });
  const api = new TheOneAPI("token", () => {}, "https://localhost", fetchFunc);
  const movies = await api.listMovies();
  assertEquals(movies, dummyMovies);
});

Deno.test("get movies from SDK", async () => {
  class DummyAPI extends TheOneAPI {
    async listMovies(): Promise<IAPIDocument<IAPIMovie>> {
      return dummyMovies;
    }
  }
  const api = new DummyAPI("token");
  const sdk = new TheOneSDK(api);
  const movies = await sdk.allMovies();
  const expected = new Map<string, any>();
  expected.set("123", { id: "123", ...dummyMovieData });
  assertEquals(movies, expected);
});
