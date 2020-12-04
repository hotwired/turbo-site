---
permalink: /handbook/navigating
---

# Navigating with Turbo Links

Turbo Links models navigation as a *visit* to a *location* (URL) with an *action*.

Visits represent the entire navigation lifecycle from click to render. That includes changing browser history, issuing the network request, restoring a copy of the page from cache, rendering the final response, and updating the scroll position.

There are two types of visit: an _application visit_, which has an action of _advance_ or _replace_, and a _restoration visit_, which has an action of _restore_.

## Application Visits

Application visits are initiated by clicking a Turbo-enabled link, or programmatically by calling [`Turbolinks.visit(location)`](#turbolinksvisit).

An application visit always issues a network request. When the response arrives, Turbolinks renders its HTML and completes the visit.

If possible, Turbolinks will render a preview of the page from cache immediately after the visit starts. This improves the perceived speed of frequent navigation between the same pages.

If the visit’s location includes an anchor, Turbolinks will attempt to scroll to the anchored element. Otherwise, it will scroll to the top of the page.

Application visits result in a change to the browser’s history; the visit’s _action_ determines how.

![Advance visit action](https://s3.amazonaws.com/turbolinks-docs/images/advance.svg)

The default visit action is _advance_. During an advance visit, Turbolinks pushes a new entry onto the browser’s history stack using [`history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState).

Applications using the Turbolinks [iOS adapter](https://github.com/turbolinks/turbolinks-ios) typically handle advance visits by pushing a new view controller onto the navigation stack. Similarly, applications using the [Android adapter](https://github.com/turbolinks/turbolinks-android) typically push a new activity onto the back stack.

![Replace visit action](https://s3.amazonaws.com/turbolinks-docs/images/replace.svg)

You may wish to visit a location without pushing a new history entry onto the stack. The _replace_ visit action uses [`history.replaceState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) to discard the topmost history entry and replace it with the new location.

To specify that following a link should trigger a replace visit, annotate the link with `data-turbolinks-action="replace"`:

```html
<a href="/edit" data-turbolinks-action="replace">Edit</a>
```

To programmatically visit a location with the replace action, pass the `action: "replace"` option to [`Turbolinks.visit`](#turbolinksvisit):

```js
Turbolinks.visit("/edit", { action: "replace" })
```

Applications using the Turbolinks [iOS adapter](https://github.com/turbolinks/turbolinks-ios) typically handle replace visits by dismissing the topmost view controller and pushing a new view controller onto the navigation stack without animation.

## Restoration Visits

Turbolinks automatically initiates a restoration visit when you navigate with the browser’s Back or Forward buttons. Applications using the [iOS](https://github.com/turbolinks/turbolinks-ios) or [Android](https://github.com/turbolinks/turbolinks-android) adapters initiate a restoration visit when moving backward in the navigation stack.

![Restore visit action](https://s3.amazonaws.com/turbolinks-docs/images/restore.svg)

If possible, Turbolinks will render a copy of the page from cache without making a request. Otherwise, it will retrieve a fresh copy of the page over the network. See [Understanding Caching](#understanding-caching) for more details.

Turbolinks saves the scroll position of each page before navigating away and automatically returns to this saved position on restoration visits.

Restoration visits have an action of _restore_ and Turbolinks reserves them for internal use. You should not attempt to annotate links or invoke [`Turbolinks.visit`](#turbolinksvisit) with an action of `restore`.

## Canceling Visits Before They Start

Application visits can be canceled before they start, regardless of whether they were initiated by a link click or a call to [`Turbolinks.visit`](#turbolinksvisit).

Listen for the `turbolinks:before-visit` event to be notified when a visit is about to start, and use `event.data.url` (or `$event.originalEvent.data.url`, when using jQuery) to check the visit’s location. Then cancel the visit by calling `event.preventDefault()`.

Restoration visits cannot be canceled and do not fire `turbolinks:before-visit`. Turbolinks issues restoration visits in response to history navigation that has *already taken place*, typically via the browser’s Back or Forward buttons.

## Disabling Turbolinks on Specific Links

Turbolinks can be disabled on a per-link basis by annotating a link or any of its ancestors with `data-turbolinks="false"`.

```html
<a href="/" data-turbolinks="false">Disabled</a>

<div data-turbolinks="false">
  <a href="/">Disabled</a>
</div>
```

To reenable when an ancestor has opted out, use `data-turbolinks="true"`:

```html
<div data-turbolinks="false">
  <a href="/" data-turbolinks="true">Enabled</a>
</div>
```

Links with Turbolinks disabled will be handled normally by the browser.