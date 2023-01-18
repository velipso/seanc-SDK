//
// seanc-SDK - A wonderfully made SDK for the-one-api.dev
// by Sean Connelly (@velipso), https://sean.cm
// Project Home: https://github.com/velipso/seanc-SDK
// SPDX-License-Identifier: MIT
//

// deno-lint-ignore-file require-await

import {
  IAPIDocument,
  IAPIMovie,
  IAPIQuote,
  TheOneAPI,
  TooManyRequestsError,
} from "./api.ts";

export type MovieID = string;
export type QuoteID = string;
type CharacterID = string;

export interface ISDKMovie {
  id: MovieID;
  name: string;
  runtimeInMinutes: number;
  budgetInMillions: number;
  boxOfficeRevenueInMillions: number;
  academyAwardNominations: number;
  academyAwardWins: number;
  rottenTomatoesScore: number;
}

export interface ISDKQuote {
  id: QuoteID;
  movieId: MovieID;
  dialog: string;
  character: string;
}

export class TheOneSDK {
  private api: TheOneAPI;
  private gotAllMovies = false;
  private movieCache: Map<MovieID, ISDKMovie> = new Map();
  private quoteCache: Map<MovieID, Map<QuoteID, ISDKQuote>> = new Map();
  private characterCache: Map<CharacterID, string> = new Map();
  private limitResponse: number;
  private limitRequestsPerMinute: number;
  private retryOnTooManyRequests: boolean;
  private retryWaitMilliseconds: number;
  private requestTimeLog: number[] = [];

  constructor(
    api: TheOneAPI,
    limitResponse = 10,
    limitRequestsPerMinute = 10,
    retryOnTooManyRequests = true,
    retryWaitMilliseconds = 30000,
  ) {
    this.api = api;
    this.limitResponse = limitResponse;
    this.limitRequestsPerMinute = limitRequestsPerMinute;
    this.retryOnTooManyRequests = retryOnTooManyRequests;
    this.retryWaitMilliseconds = retryWaitMilliseconds;
  }

  private async wait(milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  private async request<T>(requestFunc: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // prune out of date requests
    while (
      this.requestTimeLog.length > 0 && this.requestTimeLog[0] + 60000 < now
    ) {
      this.requestTimeLog.shift();
    }

    if (this.requestTimeLog.length + 1 > this.limitRequestsPerMinute) {
      // too many requests, so wait until the last request will be out of our minute window
      const delta = this.requestTimeLog[0] + 60000 - now;
      await this.wait(delta + 500); // plus a little buffer
      return this.request(requestFunc);
    } else {
      // we can make a request, so log the time, and make it!
      this.requestTimeLog.push(now);
      try {
        return await requestFunc();
      } catch (e) {
        if (e instanceof TooManyRequestsError && this.retryOnTooManyRequests) {
          // oh no... I guess wait a little while and try again
          this.requestTimeLog.pop();
          await this.wait(this.retryWaitMilliseconds);
          return this.request(requestFunc);
        } else {
          throw e;
        }
      }
    }
  }

  private addMoviesToCache(movies: IAPIDocument<IAPIMovie>) {
    for (const movie of movies.docs) {
      this.movieCache.set(movie._id, {
        id: movie._id,
        name: movie.name,
        runtimeInMinutes: movie.runtimeInMinutes,
        budgetInMillions: movie.budgetInMillions,
        boxOfficeRevenueInMillions: movie.boxOfficeRevenueInMillions,
        academyAwardNominations: movie.academyAwardNominations,
        academyAwardWins: movie.academyAwardWins,
        rottenTomatoesScore: movie.rottenTomatoesScore,
      });
    }
  }

  private async addQuotesToMap(
    quoteMap: Map<QuoteID, ISDKQuote>,
    quotes: IAPIDocument<IAPIQuote>,
  ) {
    for (const quote of quotes.docs) {
      quoteMap.set(quote._id, {
        id: quote._id,
        movieId: quote.movie,
        dialog: quote.dialog,
        character: await this.getCharacterName(quote.character),
      });
    }
  }

  private async getCharacterName(id: CharacterID): Promise<string> {
    const cachedName = this.characterCache.get(id);
    if (cachedName) {
      return cachedName;
    }

    // name isn't in cache, so fetch it, and add to the cache
    const name = await this.request(() => this.api.getCharacterName(id));
    this.characterCache.set(id, name);
    return name;
  }

  clearCache() {
    this.movieCache = new Map();
    this.quoteCache = new Map();
    this.characterCache = new Map();
    this.gotAllMovies = false;
  }

  async allMovies(): Promise<Map<MovieID, ISDKMovie>> {
    if (!this.gotAllMovies) {
      const movies = await this.request(() =>
        this.api.listMovies({ offset: 0, limit: this.limitResponse })
      );
      this.addMoviesToCache(movies);
      let offset = movies.docs.length;
      while (this.movieCache.size < movies.total) {
        const more = await this.request(() =>
          this.api.listMovies({ offset, limit: this.limitResponse })
        );
        this.addMoviesToCache(more);
        offset += more.docs.length;
      }
      this.gotAllMovies = true;
    }
    return this.movieCache;
  }

  async getMovie(id: MovieID): Promise<ISDKMovie> {
    const cachedMovie = this.movieCache.get(id);
    if (cachedMovie) {
      return cachedMovie;
    }

    // movie isn't in cache, so fetch it, and add it to the cache
    this.addMoviesToCache(await this.request(() => this.api.getMovie(id)));
    const movie = this.movieCache.get(id);
    if (movie) {
      return movie;
    }
    throw new Error(`Failed to get movie: ${id}`);
  }

  async getMovieQuotes(id: MovieID): Promise<Map<QuoteID, ISDKQuote>> {
    const cachedQuotes = this.quoteCache.get(id);
    if (cachedQuotes) {
      return cachedQuotes;
    }

    // quotes aren't in cache, so fetch them, and add to the cache
    const quoteMap = new Map<QuoteID, ISDKQuote>();
    const quotes = await this.request(() =>
      this.api.getMovieQuotes(id, { offset: 0, limit: this.limitResponse })
    );
    await this.addQuotesToMap(quoteMap, quotes);
    let offset = quotes.docs.length;
    while (quoteMap.size < quotes.total) {
      const more = await this.request(() =>
        this.api.getMovieQuotes(id, { offset, limit: this.limitResponse })
      );
      await this.addQuotesToMap(quoteMap, more);
      offset += more.docs.length;
    }
    this.quoteCache.set(id, quoteMap);
    return quoteMap;
  }
}
