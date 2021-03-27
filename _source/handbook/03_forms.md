---
permalink: /handbook/forms.html
description: "Turbo Drive accelerates form submissions and provides mechanisms to modify the current document."
---

# Interact with Turbo Forms

On top of accelerating page-level navigation, Turbo Drive also enhances `<form>` submissions.

As users interact with the Turbo Drive-powered applications, Turbo submits the page's `<form>` elements in order to fetch and render server-generated HTML seamlessly through a combination of HTTP redirects and [Turbo Stream](streams) responses.

${toc}

## Redirecting After a Form Submission

Turbo Drive handles form submissions in a manner similar to link clicks. The key difference is that form submissions can issue stateful requests using the HTTP POST method, while link clicks only ever issue stateless HTTP GET requests.

After a stateful request from a form submission, Turbo Drive expects the server to return an [HTTP 303 redirect response](https://en.wikipedia.org/wiki/HTTP_303), which it will then follow and use to navigate and update the page without reloading.

The exception to this rule is when the response's [HTTP Status Code] is within the [Client error range][] of 400 to 499, or the [Server error range][] of 500 to 599. This affords servers an opportunity to handle invalid submissions by re-rendering a form and responding with a status of [422 Unprocessable Entity][422], or to handle a server-side error by rendering a "Something Went Wrong" screen and responding with a status of [500 Internal Server Error][500].

The reason Turbo doesn't allow regular rendering on 200 is that browsers have built-in behavior for dealing with reloads on POST visits where they present a "Are you sure you want to submit this form again?" dialogue that Turbo can't replicate. Instead, Turbo will stay on the current URL upon a form submission that tries to render, rather than change it to the form action, since a reload would then issue a GET against that action URL, which may not even exist.

[HTTP Status Code]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
[Client error range]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
[Server error range]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses
[422]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422
[500]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500

## Streaming After a Form Submission

Servers may also respond to form submissions with a [Turbo Streams](streams) message by sending the header `Content-Type: text/vnd.turbo-stream.html` followed by one or more `<turbo-stream>` elements in the response body. This lets you update multiple parts of the page without navigating.
<br><br>
