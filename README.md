seanc-SDK
=========

API for The Lord of the Rings (the-one-api.dev).

How to Run
==========

First, [install deno](https://deno.land).

Next, you can run the example CLI via:

```bash
env SEANCSDK_TOKEN='YourAPIToken' \
  deno run 'https://raw.githubusercontent.com/velipso/seanc-SDK/main/src/cli.ts'
```

You can also run the test suite via:

```bash
deno test 'https://raw.githubusercontent.com/velipso/seanc-SDK/main/src/test.ts'
```

Notes and Limitations
=====================

I timeboxed myself to 3 hours, so there are some limitations.

Specifically:

#### 1. Incomplete test suite

I used [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) to mock the tests,
as an example of what can be accomplished.  But I didn't write tests for really critical parts, like
retry logic, or if the service responds with malformed data.

Still, I wanted to include a couple, just so you could see the idea.

#### 2. Incomplete CLI features

I originally wanted a full CLI program where you could do run all portions of the SDK from the
command line, but ran out of time.

Instead, the CLI tool just lists all movies.

#### 3. No examples

I wanted to include some runnable examples in the repo, but you'll have to settle for plain old
docmentation.

#### 4. Naive rate limiting and cache

I have a few places where I simply loop forever, specifically if the API returns "Too Many Requests"
error, or if the API returns an unreasonable amount of items (ex: 10000000 quotes for a movie).

While I do wait between requests, I could be a little smarter, by having exponential backoff, and a
failure condition (say, fail after trying 50 times).

Still, I wanted to include _some_ rate limiting, so you could see the idea.

SDK Documentation
=================

The SDK is split into two parts.

`TheOneAPI` is for low-level access to the API, which will perform the fetches using the access
token, and return the raw data.  This is useful if you need direct access to the service.

`TheOneSDK` adds more high-level features, like caching, retry logic, and resolving character names
from quotes automatically.

### `TheOneAPI`

blah
