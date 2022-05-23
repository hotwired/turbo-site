---
permalink: /handbook/drive.html
description: "Turbo Drive accelerates links and form submissions by negating the need for full page reloads."
---

# Navigate with Turbo Drive

Turbo Drive is the part of Turbo that enhances page-level navigation. It watches for link clicks and form submissions, performs them in the background, and updates the page without doing a full reload. It's the evolution of a library previously known as [Turbolinks](https://github.com/turbolinks/turbolinks).

${toc}

## Page Navigation Basics

Turbo Drive models page navigation as a *visit* to a *location* (URL) with an *action*.

Visits represent the entire navigation lifecycle from click to render. That includes changing browser history, issuing the network request, restoring a copy of the page from cache, rendering the final response, and updating the scroll position.

There are two types of visit: an _application visit_, which has an action of _advance_ or _replace_, and a _restoration visit_, which has an action of _restore_.

## Application Visits

Application visits are initiated by clicking a Turbo Drive-enabled link, or programmatically by calling [`Turbo.visit(location)`](/reference/drive#turbodrivevisit).

An application visit always issues a network request. When the response arrives, Turbo Drive renders its HTML and completes the visit.

If possible, Turbo Drive will render a preview of the page from cache immediately after the visit starts. This improves the perceived speed of frequent navigation between the same pages.

If the visit’s location includes an anchor, Turbo Drive will attempt to scroll to the anchored element. Otherwise, it will scroll to the top of the page.

Application visits result in a change to the browser’s history; the visit’s _action_ determines how.

![Advance visit action](https://s3.amazonaws.com/turbolinks-docs/images/advance.svg)

The default visit action is _advance_. During an advance visit, Turbo Drives pushes a new entry onto the browser’s history stack using [`history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState).

Applications using the Turbo Drive [iOS adapter](https://github.com/hotwired/turbo-ios) typically handle advance visits by pushing a new view controller onto the navigation stack. Similarly, applications using the [Android adapter](https://github.com/hotwired/turbo-android) typically push a new activity onto the back stack.

![Replace visit action](https://s3.amazonaws.com/turbolinks-docs/images/replace.svg)

You may wish to visit a location without pushing a new history entry onto the stack. The _replace_ visit action uses [`history.replaceState`](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) to discard the topmost history entry and replace it with the new location.

To specify that following a link should trigger a replace visit, annotate the link with `data-turbo-action="replace"`:

```html
<a href="/edit" data-turbo-action="replace">Edit</a>
```

To programmatically visit a location with the replace action, pass the `action: "replace"` option to `Turbo.visit`:

```js
Turbo.visit("/edit", { action: "replace" })
```

Applications using the Turbo Drive [iOS adapter](https://github.com/hotwired/turbo-ios) typically handle replace visits by dismissing the topmost view controller and pushing a new view controller onto the navigation stack without animation.

## Restoration Visits

Turbo Drive automatically initiates a restoration visit when you navigate with the browser’s Back or Forward buttons. Applications using the [iOS](https://github.com/hotwired/turbo-ios) or [Android](https://github.com/hotwired/turbo-android) adapters initiate a restoration visit when moving backward in the navigation stack.

![Restore visit action](https://s3.amazonaws.com/turbolinks-docs/images/restore.svg)

If possible, Turbo Drive will render a copy of the page from cache without making a request. Otherwise, it will retrieve a fresh copy of the page over the network. See [Understanding Caching](/handbook/building#understanding-caching) for more details.

Turbo Drive saves the scroll position of each page before navigating away and automatically returns to this saved position on restoration visits.

Restoration visits have an action of _restore_ and Turbo Drive reserves them for internal use. You should not attempt to annotate links or invoke `Turbo.visit` with an action of `restore`.

## Canceling Visits Before They Start

Application visits can be canceled before they start, regardless of whether they were initiated by a link click or a call to [`Turbo.visit`](/reference/drive#turbovisit).

Listen for the `turbo:before-visit` event to be notified when a visit is about to start, and use `event.detail.url` (or `$event.originalEvent.detail.url`, when using jQuery) to check the visit’s location. Then cancel the visit by calling `event.preventDefault()`.

Restoration visits cannot be canceled and do not fire `turbo:before-visit`. Turbo Drive issues restoration visits in response to history navigation that has *already taken place*, typically via the browser’s Back or Forward buttons.

## Pausing Rendering

Application can pause rendering and make additional preparation before it will be executed.

Listen for the `turbo:before-render` event to be notified when rendering is about to start, and pause it using `event.preventDefault()`. Once the preparation is done continue rendering by calling `event.detail.resume()`.

An example use case is adding exit animation for visits:
```javascript
document.addEventListener('turbo:before-render', async (event) => {
  event.preventDefault()

  await animateOut()

  event.detail.resume()
})
```

## Pausing Requests

Application can pause request and make additional preparation before it will be executed.

Listen for the `turbo:before-fetch-request` event to be notified when a request is about to start, and pause it using `event.preventDefault()`. Once the preparation is done continue request by calling `event.detail.resume()`.

An example use case is setting `Authorization` header for the request:
```javascript
document.addEventListener('turbo:before-fetch-request', async (event) => {
  event.preventDefault()

  const token = await getSessionToken(window.app)
  event.detail.fetchOptions.headers['Authorization'] = `Bearer ${token}`

  event.detail.resume()
})
```

## Performing Visits With a Different Method

By default, link clicks send a `GET` request to your server. But you can change this with `data-turbo-method`:

```html
<a href="/articles/54" data-turbo-method="delete">Delete the article</a>
```

The link will get converted into a hidden form next to the `a` element in the DOM. This means that the link can't appear inside another form, as you can't have nested forms.

You should also consider that for accessibility reasons, it's better to use actual forms and buttons for anything that's not a GET.


## Disabling Turbo Drive on Specific Links or Forms

Turbo Drive can be disabled on a per-element basis by annotating the element or any of its ancestors with `data-turbo="false"`.

```html
<a href="/" data-turbo="false">Disabled</a>

<form action="/messages" method="post" data-turbo="false">
  ...
</form>

<div data-turbo="false">
  <a href="/">Disabled</a>
  <form action="/messages" method="post">
    ...
  </form>
</div>
```

To reenable when an ancestor has opted out, use `data-turbo="true"`:

```html
<div data-turbo="false">
  <a href="/" data-turbo="true">Enabled</a>
</div>
```

Links or forms with Turbo Drive disabled will be handled normally by the browser.

If you want Drive to be opt-in rather than opt-out, then you can set `Turbo.session.drive = false`; then, `data-turbo="true"` is used to enable Drive on a per-element basis. If you're importing Turbo in a JavaScript pack, you can do this globally:

```js
import { Turbo } from "@hotwired/turbo-rails"
Turbo.session.drive = false
```

## Displaying Progress

During Turbo Drive navigation, the browser will not display its native progress indicator. Turbo Drive installs a CSS-based progress bar to provide feedback while issuing a request.

The progress bar is enabled by default. It appears automatically for any page that takes longer than 500ms to load. (You can change this delay with the [`Turbo.setProgressBarDelay`](/reference/drive#turbodrivesetprogressbardelay) method.)

The progress bar is a `<div>` element with the class name `turbo-progress-bar`. Its default styles appear first in the document and can be overridden by rules that come later.

For example, the following CSS will result in a thick green progress bar:

```css
.turbo-progress-bar {
  height: 5px;
  background-color: green;
}
```

To disable the progress bar entirely, set its `visibility` style to `hidden`:

```css
.turbo-progress-bar {
  visibility: hidden;
}
```

## Reloading When Assets Change

Turbo Drive can track the URLs of asset elements in `<head>` from one page to the next and automatically issue a full reload if they change. This ensures that users always have the latest versions of your application’s scripts and styles.

Annotate asset elements with `data-turbo-track="reload"` and include a version identifier in your asset URLs. The identifier could be a number, a last-modified timestamp, or better, a digest of the asset’s contents, as in the following example.

```html
<head>
  ...
  <link rel="stylesheet" href="/application-258e88d.css" data-turbo-track="reload">
  <script src="/application-cbd3cd4.js" data-turbo-track="reload"></script>
</head>
```

## Ensuring Specific Pages Trigger a Full Reload

You can ensure visits to a certain page will always trigger a full reload by including a `<meta name="turbo-visit-control">` element in the page’s `<head>`.

```html
<head>
  ...
  <meta name="turbo-visit-control" content="reload">
</head>
```

This setting may be useful as a workaround for third-party JavaScript libraries that don’t interact well with Turbo Drive page changes.

## Setting a Root Location

By default, Turbo Drive only loads URLs with the same origin—i.e. the same protocol, domain name, and port—as the current document. A visit to any other URL falls back to a full page load.

In some cases, you may want to further scope Turbo Drive to a path on the same origin. For example, if your Turbo Drive application lives at `/app`, and the non-Turbo Drive help site lives at `/help`, links from the app to the help site shouldn’t use Turbo Drive.

Include a `<meta name="turbo-root">` element in your pages’ `<head>` to scope Turbo Drive to a particular root location. Turbo Drive will only load same-origin URLs that are prefixed with this path.

```html
<head>
  ...
  <meta name="turbo-root" content="/app">
</head>
```

## Form Submissions

Turbo Drive handles form submissions in a manner similar to link clicks. The key difference is that form submissions can issue stateful requests using the HTTP POST method, while link clicks only ever issue stateless HTTP GET requests.

Throughout a submission, Turbo Drive will dispatch a series of [events][] that
target the `<form>` element and [bubble up][] through the document:

1. `turbo:submit-start`
2. `turbo:before-fetch-request`
3. `turbo:before-fetch-response`
4. `turbo:submit-end`

During a submission, Turbo Drive will set the "submitter" element's [disabled][] attribute when the submission begins, then remove the attribute after the submission ends. When submitting a `<form>` element, browser's will treat the `<input type="submit">` or `<button>` element that initiated the submission as the [submitter][]. To submit a `<form>` element programmatically, invoke the [HTMLFormElement.requestSubmit()][] method and pass an `<input type="submit">` or `<button>` element as an optional parameter.

If there are other changes you'd like to make during a `<form>` submission (for
example, disabling _all_ [fields within a submitted `<form>`][elements]), you
can declare your own event listeners:

```js
addEventListener("turbo:submit-start", ({ target }) => {
  for (const field of target.elements) {
    field.disabled = true
  }
})
```

[events]: /reference/events
[bubble up]: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture
[elements]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements
[disabled]: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
[submitter]: https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent/submitter
[HTMLFormElement.requestSubmit()]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit

## Redirecting After a Form Submission

After a stateful request from a form submission, Turbo Drive expects the server to return an [HTTP 303 redirect response](https://en.wikipedia.org/wiki/HTTP_303), which it will then follow and use to navigate and update the page without reloading.

The exception to this rule is when the response is rendered with either a 4xx or 5xx status code. This allows form validation errors to be rendered by having the server respond with `422 Unprocessable Entity` and a broken server to display a "Something Went Wrong" screen on a `500 Internal Server Error`.

The reason Turbo doesn't allow regular rendering on 200 is that browsers have built-in behavior for dealing with reloads on POST visits where they present a "Are you sure you want to submit this form again?" dialogue that Turbo can't replicate. Instead, Turbo will stay on the current URL upon a form submission that tries to render, rather than change it to the form action, since a reload would then issue a GET against that action URL, which may not even exist.

## Streaming After a Form Submission

Servers may also respond to form submissions with a [Turbo Streams](streams) message by sending the header `Content-Type: text/vnd.turbo-stream.html` followed by one or more `<turbo-stream>` elements in the response body. This lets you update multiple parts of the page without navigating.
<br><br>
