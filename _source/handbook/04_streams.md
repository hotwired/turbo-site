---
permalink: /handbook/streams.html
description: "Turbo Streams deliver page changes over WebSocket, SSE or in response to form submissions using just HTML and a set of CRUD-like actions."
---

# Come Alive with Turbo Streams

Turbo Streams deliver page changes as fragments of HTML wrapped **in self-executing** `<turbo-stream>` elements.

**Each stream element specifies an action together with a target ID to declare what should happen to the HTML inside it.**

These elements are delivered by the server over a **WebSocket**, **SSE** or **other transport** to bring the application alive with updates made by other users or processes. A new email arriving in your [imbox](https://www.hey.com/features/the-imbox/) is a great example.

## Stream Messages and Actions

A Turbo Streams message is a fragment of HTML consisting of `<turbo-stream>` elements. The stream message below demonstrates [the seven possible stream actions](/reference/streams).

For instance, with the action `replace`:

```html
<turbo-stream action="replace" target="message_1">
  <template>
    <div id="message_1">
      This div will replace the existing element with the DOM ID "message_1".
    </div>
  </template>
</turbo-stream>
```

Note that every `<turbo-stream>` element must wrap its included HTML inside a `<template>` element.

You can render any number of stream elements in a single stream message from a WebSocket, SSE or in response to a form submission.

## Streaming From HTTP Responses

Turbo knows to automatically attach `<turbo-stream>` elements when they arrive in response to `<form>` submissions that declare a [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) of `text/vnd.turbo-stream.html`.

When submitting a `<form>` element whose [method](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-method) attribute is set to `POST`, `PUT`, `PATCH`, or `DELETE`, Turbo injects `text/vnd.turbo-stream.html` into the set of response formats in the request's [Accept][] header.

When responding to requests containing that value in its [Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept) header, servers can tailor their responses to deal with Turbo Streams, HTTP redirects, or other types of clients that don't support streams (such as native applications).

Thanks to the [turbo-rails](https://github.com/hotwired/turbo-rails) gem, in a Rails controller, this would look like:

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

Or you can use a file with the `.turbo_stream.erb` extension to define one or more `<turbo-stream>`.
```ruby
def destroy
  @message = Message.find(params[:id])
  @message.destroy

  respond_to do |format|
    format.turbo_stream
    format.html         { redirect_to messages_url }
  end
end

# messages/destroy.turbo_stream.erb
<%= turbo_stream.remove(@message) %>
```

### Rendering multiple stream elements

In Rails, we can use an array to render multiple `<turbo-stream>` elements
```ruby
render turbo_stream: [
  turbo_stream.remove(@message),
  turbo_stream.update(:messages_count, Message.count)
]
```

Or in `messages/destroy.turbo_stream.erb`:
```html
# messages/destroy.turbo_stream.erb
<%= turbo_stream.remove(@message) %>
<%= turbo_stream.update(:messages_count, Message.count) %>
```

It is very convenient if you want to make actions on multiple `<turbo-frame>` on the page in a single response. In this case, we will remove the div that contains the message and update the counter.

## Reusing Server-Side Templates

The key to Turbo Streams is the ability to reuse your existing server-side templates to perform live, partial page changes.

The HTML template used to render each message in a list of such on the first page load is the same template that'll be used to add one new message to the list dynamically later. This is at the essence of the HTML-over-the-wire approach: You don't need to serialize the new message as JSON, receive it in JavaScript, render a client-side template. It's just the standard server-side templates reused.

Another example from how this would look in Rails:

```erb
<!-- app/views/messages/_message.html.erb -->
<div id="<%= dom_id message %>">
  <%= message.content %>
</div>

<!-- app/views/messages/index.html.erb -->
<h1>All the messages</h1>
<div id="messages">
  <%= render partial: "messages/message", collection: @messages %>
</div>
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

## Progressively Enhance When Necessary

It's good practice to start your interaction design without Turbo Streams. Make the entire application work as it would if Turbo Streams were not available, then layer them on as a level-up. This means you won't come to rely on the updates for flows that need to work in native applications or elsewhere without them.

The same is especially true for WebSocket updates. On poor connections, or if there are server issues, your WebSocket may well get disconnected. If the application is designed to work without it, it'll be more resilient.

## But What About Running JavaScript?

Turbo Streams consciously restricts you to seven actions: append, prepend, (insert) before, (insert) after, replace, update, and remove. If you want to trigger additional behavior when these actions are carried out, you should attach behavior using <a href="https://stimulus.hotwired.dev">Stimulus</a> controllers. This restriction allows Turbo Streams to focus on the essential task of delivering HTML over the wire, leaving additional logic to live in dedicated JavaScript files.

Embracing these constraints will keep you from turning individual responses in a jumble of behaviors that cannot be reused and which make the app hard to follow. The key benefit from Turbo Streams is the ability to reuse templates for initial rendering of a page through all subsequent updates.


## Integration with Server-Side Frameworks

Of all the techniques that are included with Turbo, it's with Turbo Streams you'll see the biggest advantage from close integration with your backend framework. As part of the official Hotwire suite, we've created a reference implementation for what such an integration can look like in the <a href="https://github.com/hotwired/turbo-rails">turbo-rails gem</a>. This gem relies on the built-in support for both WebSockets and asynchronous rendering present in Rails through the Action Cable and Active Job frameworks, respectively.

Using the <a href="https://github.com/hotwired/turbo-rails/blob/main/app/models/concerns/turbo/broadcastable.rb">Broadcastable</a> concern mixed into Active Record, you can trigger WebSocket updates directly from your domain model. And using the <a href="https://github.com/hotwired/turbo-rails/blob/main/app/models/turbo/streams/tag_builder.rb">Turbo::Streams::TagBuilder</a>, you can render `<turbo-stream>` elements in inline controller responses or dedicated templates, invoking the five actions with associated rendering through a simple DSL.

Turbo itself is completely backend-agnostic, though. So we encourage other frameworks in other ecosystems to look at the reference implementation provided for Rails to create their own tight integration.

Alternatively, a straightforward way to integrate any backend application with Turbo Streams is to rely on [the Mercure protocol](https://mercure.rocks). Mercure defines a convenient way for server applications to broadcast page changes to every connected clients through [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events). [Learn how to use Mercure with Turbo Streams](https://mercure.rocks/docs/ecosystem/hotwire).
