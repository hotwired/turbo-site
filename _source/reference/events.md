---
permalink: /reference/events.html
order: 04
description: "A reference of everything you can do with Turbo Events."
---

# Events

Turbo emits events that allow you to track the navigation lifecycle and respond to page loading. Except where noted, Turbo fires events on the `document.documentElement` object (i.e., the `<html>` element).

(Note that when using jQuery, the data on the event must be accessed as `$event.originalEvent.detail`.)

* `turbo:click` fires when you click a Turbo-enabled link. The clicked element is the event target. Access the requested location with `event.detail.url`. Cancel this event to let the click fall through to the browser as normal navigation.

* `turbo:before-visit` fires before visiting a location, except when navigating by history. Access the requested location with `event.detail.url`. Cancel this event to prevent navigation.

* `turbo:visit` fires immediately after a visit starts. Access the requested location with `event.detail.url` and action with `event.detail.action`.

* `turbo:submit-start` fires during a form submission. Access the `FormSubmission` object with `event.detail.formSubmission`. Abort form submission (e.g. after validation failure) with `event.detail.formSubmission.stop()`. (use `event.originalEvent.detail.formSubmission.stop()` if you're using jQuery).

* `turbo:before-fetch-request` fires before Turbo issues a network request to fetch the page. Access the requested location with `event.detail.url` and the fetch options object with `event.detail.fetchOptions`. This event fires on the respective element (turbo-frame or form element) which triggers it and can be accessed with `event.target` property. Request can be canceled and continued with `event.detail.resume` (see [Pausing Requests](/handbook/drive#pausing-requests)).

* `turbo:before-fetch-response` fires after the network request completes. Access the fetch options object with `event.detail`. This event fires on the respective element (turbo-frame or form element) which triggers it and can be accessed with `event.target` property.

* `turbo:submit-end` fires after the form submission-initiated network request completes. Access the `FormSubmission` object with `event.detail.formSubmission` along with `FormSubmissionResult` properties included within `event.detail`.

* `turbo:before-cache` fires before Turbo saves the current page to cache.

* `turbo:before-render` fires before rendering the page. Access the new `<body>` element with `event.detail.newBody`. Rendering can be canceled and continued with `event.detail.resume` (see [Pausing Rendering](/handbook/drive#pausing-rendering)). Customize how Turbo Drive renders the response by overriding the `event.detail.render` function (see [Custom Rendering](/handbook/drive#custom-rendering)).

* `turbo:before-stream-render` fires before rendering a Turbo Stream page update. Access the new `<turbo-stream>` element with `event.detail.newStream`. Customize the element's behavior by overriding the `event.detail.render` function (see [Custom Actions](/handbook/streams#custom-actions)).

* `turbo:render` fires after Turbo renders the page. This event fires twice during an application visit to a cached location: once after rendering the cached version, and again after rendering the fresh version.

* `turbo:load` fires once after the initial page load, and again after every Turbo visit. Access visit timing metrics with the `event.detail.timing` object.

* `turbo:before-frame-render` fires before rendering the `<turbo-frame>` element. Access the new `<turbo-frame>` element with `event.detail.newFrame`. Rendering can be canceled and continued with `event.detail.resume` (see [Pausing Rendering](/handbook/frames#pausing-rendering)). Customize how Turbo Drive renders the response by overriding the `event.detail.render` function (see [Custom Rendering](/handbook/frames#custom-rendering)).

* `turbo:frame-render` fires right after a `<turbo-frame>` element renders its view. The specific `<turbo-frame>` element is the event target. Access the `FetchResponse` object with `event.detail.fetchResponse` property.

* `turbo:frame-load` fires when a `<turbo-frame>` element is navigated and finishes loading (fires after `turbo:frame-render`). The specific `<turbo-frame>` element is the event target.

* `turbo:frame-missing` fires when the response to a `<turbo-frame>` element request does not contain a matching `<turbo-frame>` element. By default, Turbo writes an informational message into the frame and throws an exception. Cancel this event to override this handling. You can access the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) instance with `event.detail.response`, and perform a visit by calling `event.detail.visit(...)`.

* `turbo:fetch-request-error` fires when a form or frame fetch request fails due to network errors. This event fires on the respective element (turbo-frame or form element) which triggers it and can be accessed with `event.target` property. This event can be canceled.
