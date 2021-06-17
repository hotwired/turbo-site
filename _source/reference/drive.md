---
permalink: /reference/drive.html
order: 01
description: "A reference of everything you can do with Turbo Drive."
---

# Drive

## Turbo.visit

```js
Turbo.visit(location)
Turbo.visit(location, { action: action })
```

Performs an [Application Visit](/handbook/drive#application-visits) to the given _location_ (a string containing a URL or path) with the specified _action_ (a string, either `"advance"` or `"replace"`).

If _location_ is a cross-origin URL, or falls outside of the specified root (see [Setting a Root Location](/handbook/drive#setting-a-root-location)), Turbo performs a full page load by setting `window.location`.

If _action_ is unspecified, Turbo Drive assumes a value of `"advance"`.

Before performing the visit, Turbo Drive fires a `turbo:before-visit` event on `document`. Your application can listen for this event and cancel the visit with `event.preventDefault()` (see [Canceling Visits Before They Start](/handbook/drive#canceling-visits-before-they-start)).

## Turbo.clearCache

```js
Turbo.clearCache()
```

Removes all entries from the Turbo Drive page cache. Call this when state has changed on the server that may affect cached pages.

## Turbo.setProgressBarDelay

```js
Turbo.setProgressBarDelay(delayInMilliseconds)
```

Sets the delay after which the [progress bar](/handbook/drive#displaying-progress) will appear during navigation, in milliseconds. The progress bar appears after 500ms by default.

Note that this method has no effect when used with the iOS or Android adapters.

## Turbo.setRequestInterceptor

Sets the interceptor for HTTP requests. It will be called before every visit and form submission. This may be useful for fetching and setting JWT token in headers for every request to the server.

```js
Turbo.setRequestInterceptor(async (request) => {
  const token = await getSessionToken(window.app)
  request.addHeader('Authorization', `Bearer ${token}`)
})
```

## Turbo.clearRequestInterceptor

```js
Turbo.clearRequestInterceptor()
```

Removes request interceptor.
