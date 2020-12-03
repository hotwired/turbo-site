---
permalink: /handbook/advanced
---

# Advanced Usage

## Displaying Progress

During Turbolinks navigation, the browser will not display its native progress indicator. Turbolinks installs a CSS-based progress bar to provide feedback while issuing a request.

The progress bar is enabled by default. It appears automatically for any page that takes longer than 500ms to load. (You can change this delay with the [`Turbolinks.setProgressBarDelay`](#turbolinkssetprogressbardelay) method.)

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

Turbolinks can track the URLs of asset elements in `<head>` from one page to the next and automatically issue a full reload if they change. This ensures that users always have the latest versions of your application’s scripts and styles.

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

This setting may be useful as a workaround for third-party JavaScript libraries that don’t interact well with Turbolinks page changes.

## Setting a Root Location

By default, Turbolinks only loads URLs with the same origin—i.e. the same protocol, domain name, and port—as the current document. A visit to any other URL falls back to a full page load.

In some cases, you may want to further scope Turbolinks to a path on the same origin. For example, if your Turbolinks application lives at `/app`, and the non-Turbolinks help site lives at `/help`, links from the app to the help site shouldn’t use Turbolinks.

Include a `<meta name="turbolinks-root">` element in your pages’ `<head>` to scope Turbolinks to a particular root location. Turbolinks will only load same-origin URLs that are prefixed with this path.

```html
<head>
  ...
  <meta name="turbolinks-root" content="/app">
</head>
```

## Following Redirects

When you visit location `/one` and the server redirects you to location `/two`, you expect the browser’s address bar to display the redirected URL.

However, Turbolinks makes requests using `XMLHttpRequest`, which transparently follows redirects. There’s no way for Turbolinks to tell whether a request resulted in a redirect without additional cooperation from the server.

To work around this problem, send the `Turbolinks-Location` header in the final response to a visit that was redirected, and Turbolinks will replace the browser’s topmost history entry with the value you provide.

The Turbolinks Rails engine sets `Turbolinks-Location` automatically when using `redirect_to` in response to a Turbolinks visit.

## Redirecting After a Form Submission

Submitting an HTML form to the server and redirecting in response is a common pattern in web applications. Standard form submission is similar to navigation, resulting in a full page load. Using Turbolinks you can improve the performance of form submission without complicating your server-side code.

Instead of submitting forms normally, submit them with XHR. In response to an XHR submit on the server, return JavaScript that performs a [`Turbolinks.visit`](#turbolinksvisit) to be evaluated by the browser.

If form submission results in a state change on the server that affects cached pages, consider clearing Turbolinks’ cache with [`Turbolinks.clearCache()`](#turbolinksclearcache).

The Turbolinks Rails engine performs this optimization automatically for non-GET XHR requests that redirect with the `redirect_to` helper.

## Setting Custom HTTP Headers

You can observe the `turbolinks:request-start` event to set custom headers on Turbolinks requests. Access the request’s XMLHttpRequest object via `event.data.xhr`, then call the [`setRequestHeader`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) method as many times as you wish.

For example, you might want to include a request ID with every Turbolinks link click and programmatic visit.

```javascript
document.addEventListener("turbolinks:request-start", function(event) {
  var xhr = event.data.xhr
  xhr.setRequestHeader("X-Request-Id", "123...")
})
```