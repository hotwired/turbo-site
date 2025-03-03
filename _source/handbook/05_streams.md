---
permalink: /handbook/streams.html
description: "Turbo Streams deliver page changes over WebSocket, SSE or in response to form submissions using just HTML and a set of CRUD-like actions."
---

# Come Alive with Turbo Streams

Turbo Streams deliver page changes as fragments of HTML wrapped in `<turbo-stream>` elements. Each stream element specifies an action together with a target ID to declare what should happen to the HTML inside it. These elements can be delivered to the browser synchronously as a classic HTTP response, or asynchronously over transports such as webSockets, SSE, etc, to bring the application alive with updates made by other users or processes.

They can be used to surgically update the DOM after a user action such as removing an element from a list without reloading the whole page, or to implement real-time capabilities such as appending a new message to a live conversation as it is sent by a remote user.

## Stream Messages and Actions

A Turbo Streams message is a fragment of HTML consisting of `<turbo-stream>` elements. The stream message below demonstrates the nine possible stream actions:

```html
<turbo-stream action="append" target="messages">
  <template>
    <div id="message_1">
      This div will be appended to the element with the DOM ID "messages".
    </div>
  </template>
</turbo-stream>

<turbo-stream action="prepend" target="messages">
  <template>
    <div id="message_1">
      This div will be prepended to the element with the DOM ID "messages".
    </div>
  </template>
</turbo-stream>

<turbo-stream action="replace" target="message_1">
  <template>
    <div id="message_1">
      This div will replace the existing element with the DOM ID "message_1".
    </div>
  </template>
</turbo-stream>

<turbo-stream action="replace" method="morph" target="current_step">
  <template>
    <!-- The contents of this template will replace the element with ID "current_step" via morph. -->
    <li>New item</li>
  </template>
</turbo-stream>

<turbo-stream action="update" target="unread_count">
  <template>
    <!-- The contents of this template will replace the
    contents of the element with ID "unread_count" by
    setting innerHtml to "" and then switching in the
    template contents. Any handlers bound to the element
    "unread_count" would be retained. This is to be
    contrasted with the "replace" action above, where
    that action would necessitate the rebuilding of
    handlers. -->
    1
  </template>
</turbo-stream>

<turbo-stream action="update" method="morph" target="current_step">
  <template>
    <!-- The contents of this template will replace the children of the element with ID "current_step" via morph. -->
    <li>New item</li>
  </template>
</turbo-stream>

<turbo-stream action="remove" target="message_1">
  <!-- The element with DOM ID "message_1" will be removed.
  The contents of this stream element are ignored. -->
</turbo-stream>

<turbo-stream action="before" target="current_step">
  <template>
    <!-- The contents of this template will be added before the
    the element with ID "current_step". -->
    <li>New item</li>
  </template>
</turbo-stream>

<turbo-stream action="after" target="current_step">
  <template>
    <!-- The contents of this template will be added after the
    the element with ID "current_step". -->
    <li>New item</li>
  </template>
</turbo-stream>

<turbo-stream action="refresh" request-id="abcd-1234"></turbo-stream>
```

Note that every `<turbo-stream>` element must wrap its included HTML inside a `<template>` element.

A Turbo Stream can integrate with any element in the document that can be
resolved by an [id](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id) attribute or [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) (with the exception of `<template>` element or `<iframe>` element content). It is not necessary to change targeted elements into [`<turbo-frame>` elements](/handbook/frames). If your application utilizes `<turbo-frame>` elements for the sake of a `<turbo-stream>` element, change the `<turbo-frame>` into another [built-in element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element).


You can render any number of stream elements in a single stream message from a WebSocket, SSE or in response to a form submission.

Also, any `<turbo-stream>` element that's inserted into the page (e.g. through full page or frame load), will be processed by Turbo and then removed from the dom. This allows stream actions to be executed automatically when a page or frame is loaded.

## Actions With Multiple Targets

Actions can be applied against multiple targets using the `targets` attribute with a CSS query selector, instead of the regular `target` attribute that uses a dom ID reference. Examples:

```html
<turbo-stream action="remove" targets=".old_records">
  <!-- The element with the class "old_records" will be removed.
  The contents of this stream element are ignored. -->
</turbo-stream>

<turbo-stream action="after" targets="input.invalid_field">
  <template>
    <!-- The contents of this template will be added after the
    all elements that match "inputs.invalid_field". -->
    <span>Incorrect</span>
  </template>
</turbo-stream>
```

## Streaming From HTTP Responses

Turbo knows to automatically attach `<turbo-stream>` elements when they arrive in response to `<form>` submissions that declare a [MIME type][] of `text/vnd.turbo-stream.html`. When submitting a `<form>` element whose [method][] attribute is set to `POST`, `PUT`, `PATCH`, or `DELETE`, Turbo injects `text/vnd.turbo-stream.html` into the set of response formats in the request's [Accept][] header. When responding to requests containing that value in its [Accept][] header, servers can tailor their responses to deal with Turbo Streams, HTTP redirects, or other types of clients that don't support streams (such as native applications).

In a Rails controller, this would look like:

```ruby
def destroy
  @message = Message.find(params[:id])
  @message.destroy

  respond_to do |format|
    format.turbo_stream { render turbo_stream: turbo_stream.remove(@message) }
    format.html         { redirect_to messages_url }
  end
end
```

By default, Turbo doesn't add the `text/vnd.turbo-stream.html` MIME type when submitting links, or forms with a method type of `GET`. To use Turbo Streams responses with `GET` requests in an application you can instruct Turbo to include the MIME type by adding a `data-turbo-stream` attribute to a link or form.

[MIME type]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
[method]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-method
[Accept]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept

## Reusing Server-Side Templates

The key to Turbo Streams is the ability to reuse your existing server-side templates to perform live, partial page changes. The HTML template used to render each message in a list of such on the first page load is the same template that'll be used to add one new message to the list dynamically later. This is at the essence of the HTML-over-the-wire approach: You don't need to serialize the new message as JSON, receive it in JavaScript, render a client-side template. It's just the standard server-side templates reused.

Another example from how this would look in Rails:

```erb
<!-- app/views/messages/_message.html.erb -->
<div id="<%= dom_id message %>">
  <%= message.content %>
</div>

<!-- app/views/messages/index.html.erb -->
<h1>All the messages</h1>
<%= render partial: "messages/message", collection: @messages %>
```

```ruby
# app/controllers/messages_controller.rb
class MessagesController < ApplicationController
  def index
    @messages = Message.all
  end

  def create
    message = Message.create!(params.require(:message).permit(:content))

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.append(:messages, partial: "messages/message",
          locals: { message: message })
      end

      format.html { redirect_to messages_url }
    end
  end
end
```

When the form to create a new message submits to the `MessagesController#create` action, the very same partial template that was used to render the list of messages in `MessagesController#index` is used to render the turbo-stream action. This will come across as a response that looks like this:

```html
Content-Type: text/vnd.turbo-stream.html; charset=utf-8

<turbo-stream action="append" target="messages">
  <template>
    <div id="message_1">
      The content of the message.
    </div>
  </template>
</turbo-stream>
```

This `messages/message` template partial can then also be used to re-render the message following an edit/update operation. Or to supply new messages created by other users over a WebSocket or a SSE connection. Being able to reuse the same templates across the whole spectrum of use is incredibly powerful, and key to reducing the amount of work it takes to create these modern, fast applications.

## Progressively Enhance When Necessary

It's good practice to start your interaction design without Turbo Streams. Make the entire application work as it would if Turbo Streams were not available, then layer them on as a level-up. This means you won't come to rely on the updates for flows that need to work in native applications or elsewhere without them.

The same is especially true for WebSocket updates. On poor connections, or if there are server issues, your WebSocket may well get disconnected. If the application is designed to work without it, it'll be more resilient.

## But What About Running JavaScript?

Turbo Streams consciously restricts you to nine actions: append, prepend, (insert) before, (insert) after, replace, update, remove, morph, and refresh. If you want to trigger additional behavior when these actions are carried out, you should attach behavior using <a href="https://stimulus.hotwired.dev">Stimulus</a> controllers. This restriction allows Turbo Streams to focus on the essential task of delivering HTML over the wire, leaving additional logic to live in dedicated JavaScript files.

Embracing these constraints will keep you from turning individual responses into a jumble of behaviors that cannot be reused and which make the app hard to follow. The key benefit from Turbo Streams is the ability to reuse templates for initial rendering of a page through all subsequent updates.

## Custom Actions

By default, Turbo Streams support [nine values for its `action` attribute](/reference/streams#the-seven-actions). If your application needs to support other behaviors, you can override the `event.detail.render` function.

For example, if you'd like to expand upon the nine actions to support `<turbo-stream>` elements with `[action="alert"]` or `[action="log"]`, you could declare a `turbo:before-stream-render` listener to provide custom behavior:

```javascript
addEventListener("turbo:before-stream-render", ((event) => {
  const fallbackToDefaultActions = event.detail.render

  event.detail.render = function (streamElement) {
    if (streamElement.action == "alert") {
      // ...
    } else if (streamElement.action == "log") {
      // ...
    } else {
      fallbackToDefaultActions(streamElement)
    }
  }
}))
```

In addition to listening for `turbo:before-stream-render` events, applications
can also declare actions as properties directly on `StreamActions`:

```javascript
import { StreamActions } from "@hotwired/turbo"

// <turbo-stream action="log" message="Hello, world"></turbo-stream>
//
StreamActions.log = function () {
  console.log(this.getAttribute("message"))
}
```

## Integration with Server-Side Frameworks

Of all the techniques that are included with Turbo, it's with Turbo Streams you'll see the biggest advantage from close integration with your backend framework. As part of the official Hotwire suite, we've created a reference implementation for what such an integration can look like in the <a href="https://github.com/hotwired/turbo-rails">turbo-rails gem</a>. This gem relies on the built-in support for both WebSockets and asynchronous rendering present in Rails through the Action Cable and Active Job frameworks, respectively.

Using the <a href="https://github.com/hotwired/turbo-rails/blob/main/app/models/concerns/turbo/broadcastable.rb">Broadcastable</a> concern mixed into Active Record, you can trigger WebSocket updates directly from your domain model. And using the <a href="https://github.com/hotwired/turbo-rails/blob/main/app/models/turbo/streams/tag_builder.rb">Turbo::Streams::TagBuilder</a>, you can render `<turbo-stream>` elements in inline controller responses or dedicated templates, invoking the eight actions with associated rendering through a simple DSL.

Turbo itself is completely backend-agnostic, though. So we encourage other frameworks in other ecosystems to look at the reference implementation provided for Rails to create their own tight integration.

Turbo's `<turbo-stream-source>` custom element connects to a stream source
through its `[src]` attribute. When declared with an `ws://` or `wss://` URL,
the underlying stream source will be a [WebSocket][] instance. Otherwise, the
connection is through an [EventSource][].

When the element is connected to the document, the stream source is
connected. When the element is disconnected, the stream is disconnected.

Since the document's `<head>` is persistent across Turbo navigations, it's
important to mount the `<turbo-stream-source>` as a descendant of the document's
`<body>` element.

Typical full page navigations driven by Turbo will result in the `<body>` contents
being discarded and replaced with the resulting document. It's the server's
responsibility to ensure that the element is present on any page that requires
streaming.

Alternatively, a straightforward way to integrate any backend application with Turbo Streams is to rely on [the Mercure protocol](https://mercure.rocks). Mercure defines a convenient way for server applications to broadcast page changes to every connected clients through [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events). [Learn how to use Mercure with Turbo Streams](https://mercure.rocks/docs/ecosystem/hotwire).

[WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
[EventSource]: https://developer.mozilla.org/en-US/docs/Web/API/EventSource
