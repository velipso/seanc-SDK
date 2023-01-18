//
// seanc-SDK - A wonderfully made SDK for the-one-api.dev
// by Sean Connelly (@velipso), https://sean.cm
// Project Home: https://github.com/velipso/seanc-SDK
// SPDX-License-Identifier: MIT
//

// deno-lint-ignore-file require-await

export interface IAPIMovie {
  _id: string;
  name: string;
  runtimeInMinutes: number;
  budgetInMillions: number;
  boxOfficeRevenueInMillions: number;
  academyAwardNominations: number;
  academyAwardWins: number;
  rottenTomatoesScore: number;
}

export interface IAPIQuote {
  _id: string;
  dialog: string;
  movie: string;
  character: string;
  id: string;
}

export interface IAPIDocument<T> {
  docs: T[];
  total: number;
  limit: number;
  offset: number;
  page: number;
  pages: number;
}

export interface IAPIOptions {
  offset: number;
  limit: number;
  sort: string | false;
  sortAscending: boolean;
}

export class UnauthorizedError extends Error {
}

export class NotFoundError extends Error {
}

export class TooManyRequestsError extends Error {
}

export class TheOneAPI {
  private accessToken: string;
  private logger: (message: string) => void;
  private endpoint: string;
  private fetchFunc: typeof fetch;

  static DEFAULT_ENDPOINT = "https://the-one-api.dev/v2";

  constructor(
    accessToken: string,
    logger: (message: string) => void = () => {},
    endpoint = TheOneAPI.DEFAULT_ENDPOINT,
    fetchFunc = fetch,
  ) {
    this.accessToken = accessToken;
    this.logger = logger;
    this.endpoint = endpoint;
    this.fetchFunc = fetchFunc;
  }

  async fetch<T>(
    path: string,
    options?: Partial<IAPIOptions>,
  ): Promise<IAPIDocument<T>> {
    const { offset, limit, sort, sortAscending } = {
      offset: 0,
      limit: 10,
      sort: false,
      sortAscending: true,
      ...options,
    };
    const query = new URLSearchParams();
    query.append("offset", `${offset}`);
    query.append("limit", `${limit}`);
    if (sort) {
      query.append("sort", `${sort}:${sortAscending ? "asc" : "desc"}`);
    }
    const url = `${this.endpoint}${path}?${query}`;
    const method = "GET";
    const request = new Request(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    const response = await this.fetchFunc(request);
    this.logger(`fetch: ${response.status} ${method} ${url}`);
    if (response.status === 200) {
      return await response.json();
    } else if (response.status === 401) {
      throw new UnauthorizedError(
        `Unauthorized; please verify your access token: ${method} ${url}`,
      );
    } else if (response.status === 404) {
      throw new NotFoundError(`API endpoint not found: ${method} ${url}`);
    } else if (response.status === 429) {
      this.logger("Too many requests");
      throw new TooManyRequestsError(`Too many requests: ${method} ${url}`);
    } else {
      throw new Error(
        `Expecting response status 200 but instead got ${response.status}: ${method} ${url}`,
      );
    }
  }

  async listMovies(
    options?: Partial<IAPIOptions>,
  ): Promise<IAPIDocument<IAPIMovie>> {
    return this.fetch<IAPIMovie>("/movie", options);
  }

  async getMovie(
    id: string,
    options?: Partial<IAPIOptions>,
  ): Promise<IAPIDocument<IAPIMovie>> {
    return this.fetch<IAPIMovie>(`/movie/${id}`, options);
  }

  async getMovieQuotes(
    id: string,
    options?: Partial<IAPIOptions>,
  ): Promise<IAPIDocument<IAPIQuote>> {
    return this.fetch<IAPIQuote>(`/movie/${id}/quote`, options);
  }

  async getCharacterName(
    id: string,
    options?: Partial<IAPIOptions>,
  ): Promise<string> {
    const { docs } = await this.fetch<{ name: string }>(
      `/character/${id}`,
      options,
    );
    if (docs.length !== 1) {
      throw new Error(`Invalid character id: ${id}`);
    }
    return docs[0].name || id;
  }
}
