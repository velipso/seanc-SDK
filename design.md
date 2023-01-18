Design Considerations
=====================

I originally thought I would just make a simple wrapper around the API, which became `TheOneAPI`.

I wanted the types to mirror the API directly, because I didn't want the code to stand in the way of
whatever the programmer wanted to accomplish -- but I did want the programmer to have access to
types for convenience.

I added the ability to override the `fetch` function to enable testing, or if the programmer wants
to use another method of hitting the API.

Once I discovered that the quotes API returned a character ID instead of a character name, I
thought I should really resolve that for the programmer... but it didn't feel right to place it in
`TheOneAPI` since it is suppose to be a thin wrapper.

So instead I decided to create `TheOneSDK` to resolve the character name, remove paging, and add
some caching behavior.  After hitting the rate limit while testing, I thought I should try to handle
that more gracefully, and added some additional logic for retries.

Overall, it was a fun exercise, and after 3 hours I realized I could probably easily spend another
3 hours on it, and still not be satisfied with the end result.

If I dedicated more time, the first thing I would add is more testing around the paging and retry
behavior.

I apologize that I didn't complete everything to my satisfaction, but I thought this was enough to
get an idea of how I solve problems.  If you would like to see more examples, where I haven spent
more time, please browse my GitHub!  I would be happy to walk through the open source projects I've
created.

Here are a couple:

* [gvasm](https://github.com/velipso/gvasm)
* [polybooljs](https://npmjs.com/package/polybooljs)
* [sink](https://github.com/velipso/sink)
* [sndfilter](https://github.com/velipso/sndfilter)
* [whisky](https://github.com/velipso/whisky)
