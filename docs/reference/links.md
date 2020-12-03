---
permalink: /reference/links
order: 01
---

# Links

## Turbolinks.visit

Usage:
```js
Turbolinks.visit(location)
Turbolinks.visit(location, { action: action })
```

Performs an [Application Visit](#application-visits) to the given _location_ (a string containing a URL or path) with the specified _action_ (a string, either `"advance"` or `"replace"`).

If _location_ is a cross-origin URL, or falls outside of the specified root (see [Setting a Root Location](#setting-a-root-location)), or if the value of [`Turbolinks.supported`](#turbolinkssupported) is `false`, Turbolinks performs a full page load by setting `window.location`.

If _action_ is unspecified, Turbolinks assumes a value of `"advance"`.

Before performing the visit, Turbolinks fires a `turbolinks:before-visit` event on `document`. Your application can listen for this event and cancel the visit with `event.preventDefault()` (see [Canceling Visits Before They Start](#canceling-visits-before-they-start)).

## Turbolinks.clearCache

Usage:
```js
Turbolinks.clearCache()
```

Removes all entries from the Turbolinks page cache. Call this when state has changed on the server that may affect cached pages.

## Turbolinks.setProgressBarDelay

Usage:
```js
Turbolinks.setProgressBarDelay(delayInMilliseconds)
```

Sets the delay after which the [progress bar](#displaying-progress) will appear during navigation, in milliseconds. The progress bar appears after 500ms by default.

Note that this method has no effect when used with the iOS or Android adapters.

## Turbolinks.supported

Usage:
```js
if (Turbolinks.supported) {
  // ...
}
```

Detects whether Turbolinks is supported in the current browser (see [Supported Browsers](#supported-browsers)).
