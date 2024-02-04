---
permalink: /handbook/building.html
description: "Learn more about building an application with Turbo."
---

# Building Your Turbo Application

Turbo is fast because it prevents the whole page from reloading when you follow a link or submit a form. Your application becomes a persistent, long-running process in the browser. This requires you to rethink the way you structure your JavaScript.

In particular, you can no longer depend on a full page load to reset your environment every time you navigate. The JavaScript `window` and `document` objects retain their state across page changes, and any other objects you leave in memory will stay in memory.

With awareness and a little extra care, you can design your application to gracefully handle this constraint without tightly coupling it to Turbo.

## Working with Script Elements

Your browser automatically loads and evaluates any `<script>` elements present on the initial page load.

When you navigate to a new page, Turbo Drive looks for any `<script>` elements in the new page’s `<head>` which aren’t present on the current page. Then it appends them to the current `<head>` where they’re loaded and evaluated by the browser. You can use this to load additional JavaScript files on-demand.

Turbo Drive evaluates `<script>` elements in a page’s `<body>` each time it renders the page. You can use inline body scripts to set up per-page JavaScript state or bootstrap client-side models. To install behavior, or to perform more complex operations when the page changes, avoid script elements and use the `turbo:load` event instead.

Annotate `<script>` elements with `data-turbo-eval="false"` if you do not want Turbo to evaluate them after rendering. Note that this annotation will not prevent your browser from evaluating scripts on the initial page load.

### Loading Your Application’s JavaScript Bundle

Always make sure to load your application’s JavaScript bundle using `<script>` elements in the `<head>` of your document. Otherwise, Turbo Drive will reload the bundle with every page change.

```html
<head>
  ...
  <script src="/application-cbd3cd4.js" defer></script>
</head>
```

You should also consider configuring your asset packaging system to fingerprint each script so it has a new URL when its contents change. Then you can use the `data-turbo-track` attribute to force a full page reload when you deploy a new JavaScript bundle. See [Reloading When Assets Change](/handbook/drive#reloading-when-assets-change) for information.

## Understanding Caching

Turbo Drive maintains a cache of recently visited pages. This cache serves two purposes: to display pages without accessing the network during restoration visits, and to improve perceived performance by showing temporary previews during application visits.

When navigating by history (via [Restoration Visits](/handbook/drive#restoration-visits)), Turbo Drive will restore the page from cache without loading a fresh copy from the network, if possible.

Otherwise, during standard navigation (via [Application Visits](/handbook/drive#application-visits)), Turbo Drive will immediately restore the page from cache and display it as a preview while simultaneously loading a fresh copy from the network. This gives the illusion of instantaneous page loads for frequently accessed locations.

Turbo Drive saves a copy of the current page to its cache just before rendering a new page. Note that Turbo Drive copies the page using [`cloneNode(true)`](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode), which means any attached event listeners and associated data are discarded.

### Preparing the Page to be Cached

Listen for the `turbo:before-cache` event if you need to prepare the document before Turbo Drive caches it. You can use this event to reset forms, collapse expanded UI elements, or tear down any third-party widgets so the page is ready to be displayed again.

```js
document.addEventListener("turbo:before-cache", function() {
  // ...
})
```

Certain page elements are inherently _temporary_, like flash messages or alerts. If they’re cached with the document they’ll be redisplayed when it’s restored, which is rarely desirable. You can annotate such elements with `data-turbo-temporary` to have Turbo Drive automatically remove them from the page before it’s cached.

```html
<body>
  <div class="flash" data-turbo-temporary>
    Your cart was updated!
  </div>
  ...
</body>
```

### Detecting When a Preview is Visible

Turbo Drive adds a `data-turbo-preview` attribute to the `<html>` element when it displays a preview from cache. You can check for the presence of this attribute to selectively enable or disable behavior when a preview is visible.

```js
if (document.documentElement.hasAttribute("data-turbo-preview")) {
  // Turbo Drive is displaying a preview
}
```

### Opting Out of Caching

You can control caching behavior on a per-page basis by including a `<meta name="turbo-cache-control">` element in your page’s `<head>` and declaring a caching directive.

Use the `no-preview` directive to specify that a cached version of the page should not be shown as a preview during an application visit. Pages marked no-preview will only be used for restoration visits.

To specify that a page should not be cached at all, use the `no-cache` directive. Pages marked no-cache will always be fetched over the network, including during restoration visits.

```html
<head>
  ...
  <meta name="turbo-cache-control" content="no-cache">
</head>
```

To completely disable caching in your application, ensure every page contains a no-cache directive.

### Opting Out of Caching from the client-side

The value of the `<meta name="turbo-cache-control">` element can also be controlled by a client-side API exposed via `Turbo.cache`.

```js
// Set cache control of current page to `no-cache`
Turbo.cache.exemptPageFromCache()

// Set cache control of current page to `no-preview`
Turbo.cache.exemptPageFromPreview()
```

Both functions will create a `<meta name="turbo-cache-control">` element in the `<head>` if the element is not already present.

A previously set cache control value can be reset via:

```js
Turbo.cache.resetCacheControl()
```

## Installing JavaScript Behavior

You may be used to installing JavaScript behavior in response to the `window.onload`, `DOMContentLoaded`, or jQuery `ready` events. With Turbo, these events will fire only in response to the initial page load, not after any subsequent page changes. We compare two strategies for connecting JavaScript behavior to the DOM below.

### Observing Navigation Events

Turbo Drive triggers a series of events during navigation. The most significant of these is the `turbo:load` event, which fires once on the initial page load, and again after every Turbo Drive visit.

You can observe the `turbo:load` event in place of `DOMContentLoaded` to set up JavaScript behavior after every page change:

```js
document.addEventListener("turbo:load", function() {
  // ...
})
```

Keep in mind that your application will not always be in a pristine state when this event is fired, and you may need to clean up behavior installed for the previous page.

Also note that Turbo Drive navigation may not be the only source of page updates in your application, so you may wish to move your initialization code into a separate function which you can call from `turbo:load` and anywhere else you may change the DOM.

When possible, avoid using the `turbo:load` event to add other event listeners directly to elements on the page body. Instead, consider using [event delegation](https://learn.jquery.com/events/event-delegation/) to register event listeners once on `document` or `window`.

See the [Full List of Events](/reference/events) for more information.

### Attaching Behavior With Stimulus

New DOM elements can appear on the page at any time by way of frame navigation, stream messages, or client-side rendering operations, and these elements often need to be initialized as if they came from a fresh page load.

You can handle all of these updates, including updates from Turbo Drive page loads, in a single place with the conventions and lifecycle callbacks provided by Turbo's sister framework, [Stimulus](https://stimulus.hotwired.dev).

Stimulus lets you annotate your HTML with controller, action, and target attributes:

```html
<div data-controller="hello">
  <input data-hello-target="name" type="text">
  <button data-action="click->hello#greet">Greet</button>
</div>
```

Implement a compatible controller and Stimulus connects it automatically:

```js
// hello_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  greet() {
    console.log(`Hello, ${this.name}!`)
  }

  get name() {
    return this.targets.find("name").value
  }
}
```

Stimulus connects and disconnects these controllers and their associated event handlers whenever the document changes using the [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) API. As a result, it handles Turbo Drive page changes, Turbo Frames navigation, and Turbo Streams messages the same way it handles any other type of DOM update.

## Making Transformations Idempotent

Often you’ll want to perform client-side transformations to HTML received from the server. For example, you might want to use the browser’s knowledge of the user’s current time zone to group a collection of elements by date.

Suppose you have annotated a set of elements with `data-timestamp` attributes indicating the elements’ creation times in UTC. You have a JavaScript function that queries the document for all such elements, converts the timestamps to local time, and inserts date headers before each element that occurs on a new day.

Consider what happens if you’ve configured this function to run on `turbo:load`. When you navigate to the page, your function inserts date headers. Navigate away, and Turbo Drive saves a copy of the transformed page to its cache. Now press the Back button—Turbo Drive restores the page, fires `turbo:load` again, and your function inserts a second set of date headers.

To avoid this problem, make your transformation function _idempotent_. An idempotent transformation is safe to apply multiple times without changing the result beyond its initial application.

One technique for making a transformation idempotent is to keep track of whether you’ve already performed it by setting a `data` attribute on each processed element. When Turbo Drive restores your page from cache, these attributes will still be present. Detect these attributes in your transformation function to determine which elements have already been processed.

A more robust technique is simply to detect the transformation itself. In the date grouping example above, that means checking for the presence of a date divider before inserting a new one. This approach gracefully handles newly inserted elements that weren’t processed by the original transformation.

## Persisting Elements Across Page Loads

Turbo Drive allows you to mark certain elements as _permanent_. Permanent elements persist across page loads, so that any changes you make to those elements do not need to be reapplied after navigation.

Consider a Turbo Drive application with a shopping cart. At the top of each page is an icon with the number of items currently in the cart. This counter is updated dynamically with JavaScript as items are added and removed.

Now imagine a user who has navigated to several pages in this application. She adds an item to her cart, then presses the Back button in her browser. Upon navigation, Turbo Drive restores the previous page’s state from cache, and the cart item count erroneously changes from 1 to 0.

You can avoid this problem by marking the counter element as permanent. Designate permanent elements by giving them an HTML `id` and annotating them with `data-turbo-permanent`.

```html
<div id="cart-counter" data-turbo-permanent>1 item</div>
```

Before each render, Turbo Drive matches all permanent elements by ID and transfers them from the original page to the new page, preserving their data and event listeners.
