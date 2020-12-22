---
permalink: /reference/events
order: 04
description: "A reference of everything you can do with Turbo Events."
---

# Events

Turbo emits events that allow you to track the navigation lifecycle and respond to page loading. Except where noted, Turbo fires events on the `document.documentElement` object (i.e., the `<html>` element).

(Note that when using jQuery, the data on the event must be accessed as `$event.originalEvent.detail`.)

* `turbo:click` fires when you click a Turbo-enabled link. The clicked element is the event target. Access the requested location with `event.detail.url`. Cancel this event to let the click fall through to the browser as normal navigation.

* `turbo:before-visit` fires before visiting a location, except when navigating by history. Access the requested location with `event.detail.url`. Cancel this event to prevent navigation.

* `turbo:visit` fires immediately after a visit starts.

* `turbo:submit-start` fires during a form submission. Access the `FormSubmission` object with `event.detail.formSubmission`.

* `turbo:before-fetch-request` fires before Turbo issues a network request to fetch the page. Access the fetch options object with `event.detail`.

* `turbo:before-fetch-response` fires after the network request completes. Access the fetch options object with `event.detail`.

* `turbo:submit-end` fires after the form submission-initiated network request completes. Access the `FormSubmission` object with `event.detail.formSubmission` along with `FormSubmissionResult` properties included within `event.detail`.

* `turbo:before-cache` fires before Turbo saves the current page to cache.

* `turbo:before-render` fires before rendering the page. Access the new `<body>` element with `event.detail.newBody`.

* `turbo:render` fires after Turbo renders the page. This event fires twice during an application visit to a cached location: once after rendering the cached version, and again after rendering the fresh version.

* `turbo:load` fires once after the initial page load, and again after every Turbo visit. Access visit timing metrics with the `event.detail.timing` object.
