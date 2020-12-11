---
permalink: /reference/events
order: 04
description: "A reference of everything you can do with Turbo Events."
---

# Events

Turbo emits events that allow you to track the navigation lifecycle and respond to page loading. Except where noted, Turbo fires events on the `document` object.  

(Note that when using jQuery, the data on the event must be accessed as `$event.originalEvent.data`.)

* `turbo-drive:click` fires when you click a Turbo Drive-enabled link. The clicked element is the event target. Access the requested location with `event.data.url`. Cancel this event to let the click fall through to the browser as normal navigation.

* `turbo-drive:before-visit` fires before visiting a location, except when navigating by history. Access the requested location with `event.data.url`. Cancel this event to prevent navigation.

* `turbo-drive:visit` fires immediately after a visit starts.

* `turbo-drive:request-start` fires before Turbo Drive issues a network request to fetch the page. Access the XMLHttpRequest object with `event.data.xhr`.

* `turbo-drive:request-end` fires after the network request completes. Access the XMLHttpRequest object with `event.data.xhr`.

* `turbo-drive:before-cache` fires before Turbo Drive saves the current page to cache.

* `turbo-drive:before-render` fires before rendering the page. Access the new `<body>` element with `event.data.newBody`.

* `turbo-drive:render` fires after Turbo Drive renders the page. This event fires twice during an application visit to a cached location: once after rendering the cached version, and again after rendering the fresh version.

* `turbo-drive:load` fires once after the initial page load, and again after every Turbo Drive visit. Access visit timing metrics with the `event.data.timing` object.
