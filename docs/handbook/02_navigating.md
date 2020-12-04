---
permalink: /handbook/navigating
---

# Navigating with Turbo Drive
{:.no_toc}

Turbo Drive models navigation as a *visit* to a *location* (URL) with an *action*.

Visits represent the entire navigation lifecycle from click to render. That includes changing browser history, issuing the network request, restoring a copy of the page from cache, rendering the final response, and updating the scroll position.

There are two types of visit: an _application visit_, which has an action of _advance_ or _replace_, and a _restoration visit_, which has an action of _restore_.

* TOC
{:toc}

## Application Visits

Application visits are initiated by clicking a Turbo Drive-enabled link, or programmatically by calling [`TurboDrive.visit(location)`](#turbolinksvisit).

An application visit always issues a network request. When the response arrives, Turbo Drive renders its HTML and completes the visit.

If possible, Turbo Drive will render a preview of the page from cache immediately after the visit starts. This improves the perceived speed of frequent navigation between the same pages.

If the visit’s location includes an anchor, Turbo Drive will attempt to scroll to the anchored element. Otherwise, it will scroll to the top of the page.

Application visits result in a change to the browser’s history; the visit’s _action_ determines how.

![Advance visit action](https://s3.amazonaws.com/turbolinks-docs/images/advance.svg)

The default visit action is _advance_. During an advance visit, Turbo Drives pushes a new entry onto the browser’s history stack using [`history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState).

Applications using the Turbo Drive [iOS adapter](https://github.com/turbolinks/turbolinks-ios) typically handle advance visits by pushing a new view controller onto the navigation stack. Similarly, applications using the [Android adapter](https://github.com/turbolinks/turbolinks-android) typically push a new activity onto the back stack.

![Replace visit action](https://s3.amazonaws.com/turbolinks-docs/images/replace.svg)

You may wish to visit a location without pushing a new history entry onto the stack. The _replace_ visit action uses [`history.replaceState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) to discard the topmost history entry and replace it with the new location.

To specify that following a link should trigger a replace visit, annotate the link with `data-turbolinks-action="replace"`:

```html
<a href="/edit" data-turbolinks-action="replace">Edit</a>
```

To programmatically visit a location with the replace action, pass the `action: "replace"` option to [`Turbo Drive.visit`](#turbolinksvisit):

```js
Turbo Drive.visit("/edit", { action: "replace" })
```

Applications using the Turbo Drive [iOS adapter](https://github.com/turbolinks/turbolinks-ios) typically handle replace visits by dismissing the topmost view controller and pushing a new view controller onto the navigation stack without animation.

## Restoration Visits

Turbo Drive automatically initiates a restoration visit when you navigate with the browser’s Back or Forward buttons. Applications using the [iOS](https://github.com/turbolinks/turbolinks-ios) or [Android](https://github.com/turbolinks/turbolinks-android) adapters initiate a restoration visit when moving backward in the navigation stack.

![Restore visit action](https://s3.amazonaws.com/turbolinks-docs/images/restore.svg)

If possible, Turbo Drive will render a copy of the page from cache without making a request. Otherwise, it will retrieve a fresh copy of the page over the network. See [Understanding Caching](#understanding-caching) for more details.

Turbo Drive saves the scroll position of each page before navigating away and automatically returns to this saved position on restoration visits.

Restoration visits have an action of _restore_ and Turbo Drive reserves them for internal use. You should not attempt to annotate links or invoke [`Turbo Drive.visit`](#turbolinksvisit) with an action of `restore`.

## Canceling Visits Before They Start

Application visits can be canceled before they start, regardless of whether they were initiated by a link click or a call to [`Turbo Drive.visit`](#turbolinksvisit).

Listen for the `turbolinks:before-visit` event to be notified when a visit is about to start, and use `event.data.url` (or `$event.originalEvent.data.url`, when using jQuery) to check the visit’s location. Then cancel the visit by calling `event.preventDefault()`.

Restoration visits cannot be canceled and do not fire `turbolinks:before-visit`. Turbo Drive issues restoration visits in response to history navigation that has *already taken place*, typically via the browser’s Back or Forward buttons.

## Disabling Turbo Drive on Specific Links

Turbo Drive can be disabled on a per-link basis by annotating a link or any of its ancestors with `data-turbolinks="false"`.

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

Links with Turbo Drive disabled will be handled normally by the browser.

## Displaying Progress

During Turbo Drive navigation, the browser will not display its native progress indicator. Turbo Drive installs a CSS-based progress bar to provide feedback while issuing a request.

The progress bar is enabled by default. It appears automatically for any page that takes longer than 500ms to load. (You can change this delay with the [`Turbo Drive.setProgressBarDelay`](#turbolinkssetprogressbardelay) method.)

The progress bar is a `<div>` element with the class name `turbolinks-progress-bar`. Its default styles appear first in the document and can be overridden by rules that come later.

For example, the following CSS will result in a thick green progress bar:

```css
.turbolinks-progress-bar {
  height: 5px;
  background-color: green;
}
```

To disable the progress bar entirely, set its `visibility` style to `hidden`:

```css
.turbolinks-progress-bar {
  visibility: hidden;
}
```

## Reloading When Assets Change

Turbo Drive can track the URLs of asset elements in `<head>` from one page to the next and automatically issue a full reload if they change. This ensures that users always have the latest versions of your application’s scripts and styles.

Annotate asset elements with `data-turbolinks-track="reload"` and include a version identifier in your asset URLs. The identifier could be a number, a last-modified timestamp, or better, a digest of the asset’s contents, as in the following example.

```html
<head>
  ...
  <link rel="stylesheet" href="/application-258e88d.css" data-turbolinks-track="reload">
  <script src="/application-cbd3cd4.js" data-turbolinks-track="reload"></script>
</head>
```

## Ensuring Specific Pages Trigger a Full Reload

You can ensure visits to a certain page will always trigger a full reload by including a `<meta name="turbolinks-visit-control">` element in the page’s `<head>`.

```html
<head>
  ...
  <meta name="turbolinks-visit-control" content="reload">
</head>
```

This setting may be useful as a workaround for third-party JavaScript libraries that don’t interact well with Turbo Drive page changes.

## Setting a Root Location

By default, Turbo Drive only loads URLs with the same origin—i.e. the same protocol, domain name, and port—as the current document. A visit to any other URL falls back to a full page load.

In some cases, you may want to further scope Turbo Drive to a path on the same origin. For example, if your Turbo Drive application lives at `/app`, and the non-Turbo Drive help site lives at `/help`, links from the app to the help site shouldn’t use Turbo Drive.

Include a `<meta name="turbolinks-root">` element in your pages’ `<head>` to scope Turbo Drive to a particular root location. Turbo Drive will only load same-origin URLs that are prefixed with this path.

```html
<head>
  ...
  <meta name="turbolinks-root" content="/app">
</head>
```

## Following Redirects

When you visit location `/one` and the server redirects you to location `/two`, you expect the browser’s address bar to display the redirected URL.

However, Turbo Drive makes requests using `XMLHttpRequest`, which transparently follows redirects. There’s no way for Turbo Drive to tell whether a request resulted in a redirect without additional cooperation from the server.

To work around this problem, send the `Turbo Drive-Location` header in the final response to a visit that was redirected, and Turbo Drive will replace the browser’s topmost history entry with the value you provide.

The Turbo Drive Rails engine sets `Turbo Drive-Location` automatically when using `redirect_to` in response to a Turbo Drive visit.

## Redirecting After a Form Submission

Submitting an HTML form to the server and redirecting in response is a common pattern in web applications. Standard form submission is similar to navigation, resulting in a full page load. Using Turbo Drive you can improve the performance of form submission without complicating your server-side code.

Instead of submitting forms normally, submit them with XHR. In response to an XHR submit on the server, return JavaScript that performs a [`Turbo Drive.visit`](#turbolinksvisit) to be evaluated by the browser.

If form submission results in a state change on the server that affects cached pages, consider clearing Turbo Drive’ cache with [`Turbo Drive.clearCache()`](#turbolinksclearcache).

The Turbo Drive Rails engine performs this optimization automatically for non-GET XHR requests that redirect with the `redirect_to` helper.

## Setting Custom HTTP Headers

You can observe the `turbolinks:request-start` event to set custom headers on Turbo Drive requests. Access the request’s XMLHttpRequest object via `event.data.xhr`, then call the [`setRequestHeader`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) method as many times as you wish.

For example, you might want to include a request ID with every Turbo Drive link click and programmatic visit.

```javascript
document.addEventListener("turbolinks:request-start", function(event) {
  var xhr = event.data.xhr
  xhr.setRequestHeader("X-Request-Id", "123...")
})
```