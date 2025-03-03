---
permalink: /reference/events.html
order: 04
description: "A reference of everything you can do with Turbo Events."
---

# Events

Turbo emits a variety of [Custom Events][] types, dispatched from the following
sources:

* [Document](#document)
* [Page Refreshes](#page-refreshes)
* [Forms](#forms)
* [Frames](#frames)
* [Streams](#streams)
* [HTTP Requests](#http-requests)

When using jQuery, the data on the event must be accessed as `$event.originalEvent.detail`.

[Custom Events]: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent

## Document

Turbo Drive emits events that allow you to track the navigation life cycle and respond to page loading. Except where noted, the following events fire on the [document.documentElement][] object (i.e., the `<html>` element).

[document.documentElement]: https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement

### `turbo:click`

Fires when you click a Turbo-enabled link. The clicked element is the [event.target][]. Access the requested location with `event.detail.url`. Cancel this event to let the click fall through to the browser as normal navigation.

| `event.detail` property   | Type              | Description
|---------------------------|-------------------|------------
| `url`                     | `string`          | the requested location
| `originalEvent`           | [MouseEvent][]    | the original [`click` event]

[`click` event]: https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
[MouseEvent]: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
[event.target]: https://developer.mozilla.org/en-US/docs/Web/API/Event/target

### `turbo:before-visit`

Fires before visiting a location, except when navigating by history. Access the requested location with `event.detail.url`. Cancel this event to prevent navigation.

| `event.detail` property   | Type              | Description
|---------------------------|-------------------|------------
| `url`                     | `string`          | the requested location

### `turbo:visit`

Fires immediately after a visit starts. Access the requested location with `event.detail.url` and action with `event.detail.action`.

| `event.detail` property   | Type                                  | Description
|---------------------------|---------------------------------------|------------
| `url`                     | `string`                              | the requested location
| `action`                  | `"advance" \| "replace" \| "restore"` | the visit's [Action][]

[Action]: /handbook/drive#page-navigation-basics

### `turbo:before-cache`

Fires before Turbo saves the current page to cache.

Instances of `turbo:before-cache` events do not have an `event.detail` property.

### `turbo:before-render`

Fires before rendering the page. Access the new `<body>` element with `event.detail.newBody`. Rendering can be canceled and continued with `event.detail.resume` (see [Pausing Rendering](/handbook/drive#pausing-rendering)). Customize how Turbo Drive renders the response by overriding the `event.detail.render` function (see [Custom Rendering](/handbook/drive#custom-rendering)).

| `event.detail` property   | Type                              | Description
|---------------------------|-----------------------------------|------------
| `renderMethod`            | `"replace" \| "morph"`            | the strategy that will be used to render the new content
| `newBody`                 | [HTMLBodyElement][]               | the new `<body>` element that will replace the document's current `<body>` element
| `resume`                  | `(value?: any) => void`           | called when [Pausing Requests][]
| `render`                  | `(currentBody, newBody) => void`  | override to [Customize Rendering](/handbook/drive#custom-rendering)

[HTMLBodyElement]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLBodyElement
[preview]: /handbook/building#understanding-caching

### `turbo:render`

Fires after Turbo renders the page. This event fires twice during an application visit to a cached location: once after rendering the cached version, and again after rendering the fresh version.

| `event.detail` property   | Type                      | Description
|---------------------------|---------------------------|------------
| `renderMethod`            | `"replace" \| "morph"`    | the strategy used to render the new content

### `turbo:load`

Fires once after the initial page load, and again after every Turbo visit.

| `event.detail` property   | Type      | Description
|---------------------------|-----------|------------
| `url`                     | `string`  | the requested location
| `timing.visitStart`       | `number`  | timestamp at the start of the Visit
| `timing.requestStart`     | `number`  | timestamp at the start of the HTTP request for the next page
| `timing.requestEnd`       | `number`  | timestamp at the end of the HTTP request for the next page
| `timing.visitEnd`         | `number`  | timestamp at the end of the Visit


## Page Refreshes

Turbo Drive emits events while morphing the page's content.

### `turbo:morph`

Fires after Turbo morphs the page.

| `event.detail` property   | Type        | Description
|---------------------------|-------------|------------
| `currentElement`          | [Element][] | the original [Element][] that remains connected after the morph (most commonly `document.body`)
| `newElement`              | [Element][] | the [Element][] with the new attributes and children that is not connected after the morph

### `turbo:before-morph-element`

Fires before Turbo morphs an element. The [event.target][] references the original element that will remain connected to the document. Cancel this event by calling `event.preventDefault()` to skip morphing and preserve the original element, its attributes, and its children.

| `event.detail` property   | Type          | Description
|---------------------------|---------------|------------
| `newElement`              | [Element][]   | the [Element][] with the new attributes and children that is not connected after the morph

### `turbo:before-morph-attribute`

Fires before Turbo morphs an element's attributes. The [event.target][] references the original element that will remain connected to the document. Cancel this event by calling `event.preventDefault()` to skip morphing and preserve the original attribute value.

| `event.detail` property   | Type                      | Description
|---------------------------|---------------------------|------------
| `attributeName`           | `string`                  | the name of the attribute to be mutated
| `mutationType`            | `"update" \| "remove"`    | how the attribute will be mutated

### `turbo:morph-element`

Fires after Turbo morphs an element. The [event.target][] references the morphed element that remains connected after the morph.

| `event.detail` property   | Type          | Description
|---------------------------|---------------|------------
| `newElement`              | [Element][]   | the [Element][] with the new attributes and children that is not connected after the morph

[Element]: https://developer.mozilla.org/en-US/docs/Web/API/Element

## Forms

Turbo Drive emits events during submission, redirection, and submission failure. The following events fire on the `<form>` element during submission.

### `turbo:submit-start`

Fires during a form submission. Access the [FormSubmission][] object with `event.detail.formSubmission`. Abort form submission (e.g. after validation failure) with `event.detail.formSubmission.stop()`. Use `event.originalEvent.detail.formSubmission.stop()` if you're using jQuery.

| `event.detail` property   | Type                                      | Description
|---------------------------|-------------------------------------------|------------
| `formSubmission`          | [FormSubmission][]                        | the `<form>` element submission

### `turbo:submit-end`

Fires after the form submission-initiated network request completes. Access the [FormSubmission][] object with `event.detail.formSubmission` along with the properties included within `event.detail`.

| `event.detail` property   | Type                             | Description
|---------------------------|----------------------------------|------------
| `formSubmission`          | [FormSubmission][]               | the `<form>` element submission
| `success`                 | `boolean`                        | a `boolean` representing the request's success
| `fetchResponse`           | [FetchResponse][] \| `undefined` | present when a response is received, even if `success: false`. `undefined` if the request errored before a response was received
| `error`                   | [Error][] \| `undefined`         | `undefined` unless an actual fetch error occurs (e.g., network issues)

[Error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors
[FormSubmission]: /reference/drive#formsubmission

## Frames

Turbo Frames emit events during their navigation life cycle. The following events fire on the `<turbo-frame>` element.

### `turbo:before-frame-render`

Fires before rendering the `<turbo-frame>` element. Access the new `<turbo-frame>` element with `event.detail.newFrame`. Rendering can be canceled and continued with `event.detail.resume` (see [Pausing Rendering](/handbook/frames#pausing-rendering)). Customize how Turbo Drive renders the response by overriding the `event.detail.render` function (see [Custom Rendering](/handbook/frames#custom-rendering)).

| `event.detail` property   | Type                              | Description
|---------------------------|-----------------------------------|------------
| `newFrame`                | `FrameElement`                    | the new `<turbo-frame>` element that will replace the current `<turbo-frame>` element
| `resume`                  | `(value?: any) => void`           | called when [Pausing Requests][]
| `render`                  | `(currentFrame, newFrame) => void`| override to [Customize Rendering](/handbook/drive#custom-rendering)

### `turbo:frame-render`

Fires right after a `<turbo-frame>` element renders its view. The specific `<turbo-frame>` element is the [event.target][]. Access the [FetchResponse][] object with `event.detail.fetchResponse` property.

| `event.detail` property   | Type                              | Description
|---------------------------|-----------------------------------|------------
| `fetchResponse`           | [FetchResponse][]                 | the HTTP request's response

### `turbo:frame-load`

Fires when a `<turbo-frame>` element is navigated and finishes loading (fires after `turbo:frame-render`). The specific `<turbo-frame>` element is the [event.target][].

Instances of `turbo:frame-load` events do not have an `event.detail` property.

### `turbo:frame-missing`

Fires when the response to a `<turbo-frame>` element request does not contain a matching `<turbo-frame>` element. By default, Turbo writes an informational message into the frame and throws an exception. Cancel this event to override this handling. You can access the [Response][] instance with `event.detail.response`, and perform a visit by calling `event.detail.visit(location, visitOptions)` (see [Turbo.visit][] to learn more about `VisitOptions`).

| `event.detail` property   | Type                                                                  | Description
|---------------------------|-----------------------------------------------------------------------|------------
| `response`                | [Response][]                                                          | the HTTP response for the request initiated by a `<turbo-frame>` element
| `visit`                   | `async (location: string \| URL, visitOptions: VisitOptions) => void` | a convenience function to initiate a page-wide navigation

[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[Turbo.visit]: /reference/drive#turbo.visit

## Streams

Turbo Streams emit events during their life cycle. The following events fire on the `<turbo-stream>` element.

### `turbo:before-stream-render`

Fires before rendering a Turbo Stream page update. Access the new `<turbo-stream>` element with `event.detail.newStream`. Customize the element's behavior by overriding the `event.detail.render` function (see [Custom Actions][]).

| `event.detail` property   | Type                              | Description
|---------------------------|-----------------------------------|------------
| `newStream`               | `StreamElement`                   | the new `<turbo-stream>` element whose action will be executed
| `render`                  | `async (currentElement) => void`  | override to define [Custom Actions][]

[Custom Actions]: /handbook/streams#custom-actions

## HTTP Requests

Turbo emits events when fetching content over HTTP. Depending on the what
initiated the request, the events could fire on:

* a `<turbo-frame>` during its navigation
* a `<form>` during its submission
* the `<html>` element during a page-wide Turbo Visit

### `turbo:before-fetch-request`

Fires before Turbo issues a network request (to fetch a page, submit a form, preload a link, etc.). Access the requested location with `event.detail.url` and the fetch options object with `event.detail.fetchOptions`. This event fires on the respective element (`<turbo-frame>` or `<form>` element) which triggers it and can be accessed with [event.target][] property. Request can be canceled and continued with `event.detail.resume` (see [Pausing Requests][]).

| `event.detail` property   | Type                              | Description
|---------------------------|-----------------------------------|------------
| `fetchOptions`            | [RequestInit][]                   | the `options` used to construct the [Request][]
| `url`                     | [URL][]                           | the request's location
| `resume`                  | `(value?: any) => void` callback  | called when [Pausing Requests][]

[RequestInit]: https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options
[Request]: https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
[URL]: https://developer.mozilla.org/en-US/docs/Web/API/URL
[Pausing Requests]: /handbook/drive#pausing-requests

### `turbo:before-fetch-response`

Fires after the network request completes. Access the fetch options object with `event.detail`. This event fires on the respective element (`<turbo-frame>` or `<form>` element) which triggers it and can be accessed with [event.target][] property.

| `event.detail` property   | Type                      | Description
|---------------------------|---------------------------|------------
| `fetchResponse`           | [FetchResponse][]         | the HTTP request's response

[FetchResponse]: /reference/drive#fetchresponse

### `turbo:before-prefetch`

Fires before Turbo prefetches a link. The link is the `event.target`. Cancel this event to prevent prefetching.

### `turbo:fetch-request-error`

Fires when a form or frame fetch request fails due to network errors. This event fires on the respective element (`<turbo-frame>` or `<form>` element) which triggers it and can be accessed with [event.target][] property. This event can be canceled.

| `event.detail` property   | Type              | Description
|---------------------------|-------------------|------------
| `request`                 | [FetchRequest][]  | The HTTP request that failed
| `error`                   | [Error][]         | provides the cause of the failure

[Error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors
[FetchRequest]: /reference/drive#fetchrequest
