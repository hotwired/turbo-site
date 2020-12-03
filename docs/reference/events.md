---
permalink: /reference/events
order: 02
---

# Events

Turbolinks emits events that allow you to track the navigation lifecycle and respond to page loading. Except where noted, Turbolinks fires events on the `document` object.  
Note that when using jQuery, the data on the event must be accessed as `$event.originalEvent.data`.

* `turbolinks:click` fires when you click a Turbolinks-enabled link. The clicked element is the event target. Access the requested location with `event.data.url`. Cancel this event to let the click fall through to the browser as normal navigation.

* `turbolinks:before-visit` fires before visiting a location, except when navigating by history. Access the requested location with `event.data.url`. Cancel this event to prevent navigation.

* `turbolinks:visit` fires immediately after a visit starts.

* `turbolinks:request-start` fires before Turbolinks issues a network request to fetch the page. Access the XMLHttpRequest object with `event.data.xhr`.

* `turbolinks:request-end` fires after the network request completes. Access the XMLHttpRequest object with `event.data.xhr`.

* `turbolinks:before-cache` fires before Turbolinks saves the current page to cache.

* `turbolinks:before-render` fires before rendering the page. Access the new `<body>` element with `event.data.newBody`.

* `turbolinks:render` fires after Turbolinks renders the page. This event fires twice during an application visit to a cached location: once after rendering the cached version, and again after rendering the fresh version.

* `turbolinks:load` fires once after the initial page load, and again after every Turbolinks visit. Access visit timing metrics with the `event.data.timing` object.