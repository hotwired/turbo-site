---
permalink: /reference/drive
order: 01
description: "A reference of everything you can do with Turbo Drive."
---

# Drive

## TurboDrive.visit

```js
TurboDrive.visit(location)
TurboDrive.visit(location, { action: action })
```

Performs an [Application Visit](/handbook/drive#application-visits) to the given _location_ (a string containing a URL or path) with the specified _action_ (a string, either `"advance"` or `"replace"`).

If _location_ is a cross-origin URL, or falls outside of the specified root (see [Setting a Root Location](/handbook/drive#setting-a-root-location)), or if the value of [`TurboDrive.supported`](#turbodrivesupported) is `false`, Turbolinks performs a full page load by setting `window.location`.

If _action_ is unspecified, Turbo Drive assumes a value of `"advance"`.

Before performing the visit, Turbo Drive fires a `turbo-drive:before-visit` event on `document`. Your application can listen for this event and cancel the visit with `event.preventDefault()` (see [Canceling Visits Before They Start](/handbook/drive#canceling-visits-before-they-start)).

## TurboDrive.clearCache

```js
TurboDrive.clearCache()
```

Removes all entries from the Turbo Drive page cache. Call this when state has changed on the server that may affect cached pages.

## TurboDrive.setProgressBarDelay

```js
TurboDrive.setProgressBarDelay(delayInMilliseconds)
```

Sets the delay after which the [progress bar](/handbook/drive#displaying-progress) will appear during navigation, in milliseconds. The progress bar appears after 500ms by default.

Note that this method has no effect when used with the iOS or Android adapters.

## TurboDrive.supported

```js
if (TurboDrive.supported) {
  // ...
}
```

Detects whether Turbo Drive is supported in the current browser. Turbo Drive works in all modern desktop and mobile browsers. It depends on the <a href="http://caniuse.com/#search=pushState">HTML5 History API</a> and <a href="http://caniuse.com/#search=requestAnimationFrame">Window.requestAnimationFrame</a>. In unsupported browsers, Turbo Drive gracefully degrades to standard navigation.
