---
permalink: /reference/drive.html
order: 01
description: "A reference of everything you can do with Turbo Drive."
---

# Drive

## Turbo.visit

```js
Turbo.visit(location)
Turbo.visit(location, { action: action })
Turbo.visit(location, { frame: frame })
```

Performs an [Application Visit][] to the given _location_ (a string containing a URL or path) with the specified _action_ (a string, either `"advance"` or `"replace"`).

If _location_ is a cross-origin URL, or falls outside of the specified root (see [Setting a Root Location](/handbook/drive#setting-a-root-location)), Turbo performs a full page load by setting `window.location`.

If _action_ is unspecified, Turbo Drive assumes a value of `"advance"`.

Before performing the visit, Turbo Drive fires a `turbo:before-visit` event on `document`. Your application can listen for this event and cancel the visit with `event.preventDefault()` (see [Canceling Visits Before They Start](/handbook/drive#canceling-visits-before-they-start)).

If _frame_ is specified, find a `<turbo-frame>` element with an `[id]` attribute that matches the provided value, and navigate it to the provided _location_. If the `<turbo-frame>` cannot be found, perform a page-level [Application Visit][].

[Application Visit]: /handbook/drive#application-visits

## Turbo.cache.clear

```js
Turbo.cache.clear()
```

Removes all entries from the Turbo Drive page cache. Call this when state has changed on the server that may affect cached pages.

**Note:** This function was previously exposed as `Turbo.clearCache()`. The top-level function was deprecated in favor of the new `Turbo.cache.clear()` function.

## Turbo.config.drive.progressBarDelay

```js
Turbo.config.drive.progressBarDelay = delayInMilliseconds
```

Sets the delay after which the [progress bar](/handbook/drive#displaying-progress) will appear during navigation, in milliseconds. The progress bar appears after 500ms by default.

Note that this method has no effect when used with the iOS or Android adapters.

**Note:** This function was previously exposed as `Turbo.setProgressBarDelay` function. The top-level function was deprecated in favor of the new `Turbo.config.drive.progressBarDelay = delayInMilliseconds` syntax.

## Turbo.config.forms.confirm

```js
Turbo.config.forms.confirm = confirmMethod
```

Sets the method that is called by links decorated with [`data-turbo-confirm`](/handbook/drive#requiring-confirmation-for-a-visit). The default is the browser's built in `confirm`. The method should return a `Promise` object that resolves to true or false, depending on whether the visit should proceed.

**Note:** This function was previously exposed as `Turbo.setConfirmMethod` function. The top-level function was deprecated in favor of the new `Turbo.config.forms.confirm = confirmMethod` syntax.

## Turbo.session.drive

```js
Turbo.session.drive = false
```

Turns Turbo Drive off by default. You must now opt-in to Turbo Drive on a per-link and per-form basis using `data-turbo="true"`.

## `FetchRequest`

Turbo dispatches a variety of [events while making HTTP requests](/reference/events#http-requests) that reference `FetchRequest` objects with the following properties:

| Property          | Type                                                                              | Description
|-------------------|-----------------------------------------------------------------------------------|------------
| `body`            | [FormData][] \| [URLSearchParams][]                                               | a [URLSearchParams][] instance for `"get"` requests, [FormData][] otherwise
| `enctype`         | `"application/x-www-form-urlencoded" \| "multipart/form-data" \| "text/plain"`    | the [HTMLFormElement.enctype][] value
| `fetchOptions`    | [RequestInit][]                                                                   | the request's configuration options
| `headers`         | [Headers][] \| `{ [string]: [any] }`                                              | the request's HTTP headers
| `method`          | `"get" \| "post" \| "put" \| "patch" \| "delete"`                                 | the HTTP verb
| `params`          | [URLSearchParams][]                                                               | the [URLSearchParams][] instance for `"get"` requests
| `target`          | [HTMLFormElement][] \| [HTMLAnchorElement][] \| `FrameElement` \| `null`          | the element responsible for initiating the request
| `url`             | [URL][]                                                                           | the request's [URL][]

[HTMLAnchorElement]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
[RequestInit]: https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options
[Headers]: https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#headers
[HTMLFormElement.enctype]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/enctype

## `FetchResponse`

Turbo dispatches a variety of [events while making HTTP requests](/reference/events#http-requests) that reference `FetchResponse` objects with the following properties:

| Property          | Type               | Description
|-------------------|--------------------|------------
| `clientError`     | `boolean`          | `true` if the status is between 400 and 499, `false` otherwise
| `contentType`     | `string` \| `null` | the value of the [Content-Type][] header
| `failed`          | `boolean`          | `true` if the response did not succeed, `false` otherwise
| `isHTML`          | `boolean`          | `true` if the content type is HTML, `false` otherwise
| `location`        | [URL][]            | the value of [Response.url][]
| `redirected`      | `boolean`          | the value of [Response.redirected][]
| `responseHTML`    | `Promise<string>`  | clones the `Response` if its HTML, then calls [Response.text()][]
| `responseText`    | `Promise<string>`  | clones the `Response`, then calls [Response.text()][]
| `response`        | [Response]         | the `Response` instance
| `serverError`     | `boolean`          | `true` if the status is between 500 and 599, `false` otherwise
| `statusCode`      | `number`           | the value of [Response.status][]
| `succeeded`       | `boolean`          | `true` if the [Response.ok][], `false` otherwise

[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[Response.url]: https://developer.mozilla.org/en-US/docs/Web/API/Response/url
[Response.ok]: https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
[Response.redirected]: https://developer.mozilla.org/en-US/docs/Web/API/Response/redirected
[Response.status]: https://developer.mozilla.org/en-US/docs/Web/API/Response/status
[Response.text()]: https://developer.mozilla.org/en-US/docs/Web/API/Response/text
[Content-Type]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type

## `FormSubmission`

Turbo dispatches a variety of [events while submitting forms](/reference/events#forms) that reference `FormSubmission` objects with the following properties:

| Property          | Type                                                                             | Description
|-------------------|----------------------------------------------------------------------------------|------------
| `action`          | `string`                                                                         | where the `<form>` element is submitting to
| `body`            | [FormData][] \| [URLSearchParams][]                                              | the underlying [Request][] payload
| `enctype`         | `"application/x-www-form-urlencoded" \| "multipart/form-data" \| "text/plain"`   | the [HTMLFormElement.enctype][]
| `fetchRequest`    | [FetchRequest][]                                                                 | the underlying [FetchRequest][] instance
| `formElement`     | [HTMLFormElement][]                                                              | the `<form>` element to that is submitting
| `isSafe`          | `boolean`                                                                        | `true` if the `method` is `"get"`, `false` otherwise
| `location`        | [URL][]                                                                          | the `action` string transformed into a [URL][] instance
| `method`          | `"get" \| "post" \| "put" \| "patch" \| "delete"`                                | the HTTP verb
| `submitter`       | [HTMLButtonElement][] \| [HTMLInputElement][] \| `undefined`                     | the element responsible for submitting the `<form>` element

[FetchRequest]: #fetchrequest
[FormData]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[HTMLFormElement]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement
[URLSearchParams]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[URL]: https://developer.mozilla.org/en-US/docs/Web/API/URL
[HTMLButtonElement]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement
[HTMLInputElement]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
[Request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
