---
permalink: /handbook/streams
description: "Turbo Streams deliver page changes over WebSocket, SSE or in response to form submissions using just HTML and a set of CRUD-like actions."
---

# Come Alive with Turbo Streams

Turbo Streams deliver page changes as fragments of HTML wrapped in self-executing `<turbo-stream>` elements. Each stream element specifies an action together with a target ID to declare what should happen to the HTML inside it. These elements are delivered by the server over a WebSocket, SSE or other transport to bring the application alive with updates made by other users or processes. A new email arriving in your <a href="https://itsnotatypo.com">imbox</a> is a great example.

## Stream Messages and Actions

A Turbo Streams message is a fragment of HTML consisting of `<turbo-stream>` elements. The stream message below demonstrates the five possible stream actions:

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

<turbo-stream action="update" target="unread_count">
  <template>
    <!-- The contents of this template will replace the
    contents of the element with ID "unread_count". -->
    1
  </template>
</turbo-stream>

<turbo-stream action="remove" target="message_1">
  <!-- The element with DOM ID "message_1" will be removed.
  The contents of this stream element are ignored. -->
</turbo-stream>
```

Note that every `<turbo-stream>` element must wrap its included HTML inside a `<template>` element.

You can render any number of stream elements in a single stream message from a WebSocket, SSE or in response to a form submission.

## Streaming From HTTP Responses

Turbo knows to automatically load stream elements when they arrive in response to form submissions with a MIME type of `text/html; turbo-stream`. Turbo itself adds this type to the `Accept` header to let the server know that these responses are possible. It's therefore easily possible to tailor your server responses to deal with both Turbo Streams and regular redirects or other responses for clients that don't want the streams (such as native applications).

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

## Reusing Server-Side Templates

The key to Turbo Streams is the ability to reuse your existing server-side templates to perform live, partial page changes. The HTML template used to render each message in a list of such on the first page load is the same template that'll be used to add one new message to the list dynamically later. This is at the essence of the HTML-over-the-wire approach: You don't need to serialize the new message as JSON, receive it in JavaScript, render a client-side template. It's just the standard server-side templates reused.

Another example from how this would look in Rails:

```eruby
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
Content-Type: text/html; turbo-stream; charset=utf-8

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

Turbo Streams consciously restricts the types of actions you can perform to just five: append, prepend, replace, update, and remove. If you want to trigger additional behavior when these actions are carried out, you should attach behavior using <a href="https://stimulus.hotwire.dev">Stimulus</a> controllers. This restriction allows Turbo Streams to focus on the essential task of delivering HTML over the wire, leaving additional logic to live in dedicated JavaScript files.

Embracing these constraints will keep you from turning individual responses in a jumble of behaviors that cannot be reused and which make the app hard to follow. The key benefit from Turbo Streams is the ability to reuse templates for initial rendering of a page through all subsequent updates.


## Integration with Server-Side Frameworks

Of all the techniques that are included with Turbo, it's with Turbo Streams you'll see the biggest advantage from close integration with your backend framework. As part of the official Hotwire suite, we've created a reference implementation for what such an integration can look like in the <a href="https://github.com/hotwired/turbo-rails">turbo-rails gem</a>. This gem relies on the built-in support for both WebSockets and asynchronous rendering present in Rails through the Action Cable and Active Job frameworks, respectively.

Using the <a href="https://github.com/hotwired/turbo-rails/blob/main/app/models/concerns/turbo/broadcastable.rb">Broadcastable</a> concern mixed into Active Record, you can trigger WebSocket updates directly from your domain model. And using the <a href="https://github.com/hotwired/turbo-rails/blob/main/app/models/turbo/streams/tag_builder.rb">Turbo::Streams::TagBuilder</a>, you can render `<turbo-stream>` elements in inline controller responses or dedicated templates, invoking the five actions with associated rendering through a simple DSL.

Turbo itself is completely backend-agnostic, though. So we encourage other frameworks in other ecosystems to look at the reference implementation provided for Rails to create their own tight integration.

## Triggering Updates Using SSE and Mercure

[The Mercure protocol](https://mercure.rocks) is a convenient way to trigger updates from any server application, even if it isn't able to maintain persistent WebSocket connections (ex: PHP).

Mercure defines a simple interface to publish updates to a *hub*.
When the *hub* receives an update, it broadcasts it using [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) to every connected client. Several Open Source and commercial hubs are [available](https://mercure.rocks/spec#implementation-status).

Connecting Turbo to a Mercure stream (or any other SSE stream) is straightforward, and doesn't require any external dependency:

```javascript
import { connectStreamSource } from "@hotwired/turbo";

// The "topic" parameter can be any string or URI
const es = new EventSource("https://example.com/.well-known/mercure?topic=my-stream");
connectStreamSource(es);
```

To broadcast a Turbo Streams message, simply send a `POST` HTTP request to the Mercure hub:

    curl \
      -H 'Authorization: Bearer <snip>'
      -d 'topic=my-stream' \
      -d 'data=<turbo-stream action=...'
      -X POST \
      https://example.com/.well-known/mercure

`topic` must be the same topic you subscribed in JavaScript, and `data` contains the Turbo Streams message.

Most Mercure *hubs* require the subscriber to be [authorized](https://mercure.rocks/spec#authorization). Refer to the documentation of your hub to learn how to generate a proper JSON Web Token.

In this example, we use `curl` but any HTTP client will work.

To disconnect the stream source, use the `disconnectStreamSource()` function:

```javascript
import { disconnectStreamSource } from "@hotwired/turbo";

disconnectStreamSource(es);
```

In the following example, we use a Stimulus controller to connect to an SSE stream when an HTML element is created, and to disconnect when it is destroyed:

```javascript
// stream_controller.js
import { Controller } from "stimulus";
import { connectStreamSource, disconnectStreamSource } from "@hotwired/turbo";

export default class extends Controller {
  connect() {
    this.es = new EventSource(this.element.getAttribute("data-url"));
    connectStreamSource(this.es);
  }

  disconnect() {
    this.es.close();
    disconnectStreamSource(this.es);
  }
}
```

```html
<div data-controller="stream" data-url="https://example.com/.well-known/mercure?topic=my-stream">
  <!-- ... -->
</div>
```
