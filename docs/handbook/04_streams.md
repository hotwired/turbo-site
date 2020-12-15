---
permalink: /handbook/streams
description: "Turbo Streams deliver page changes over WebSocket (or in response to form submissions), using just HTML and a set of CRUD-like action tags."
---

# Alive with Turbo Streams

Turbo Streams

Turbo Streams deliver page changes as fragments of HTML wrapped in `<turbo-stream>` tags that specify an action together with a target id to detail what should happen to that HTML. These change actions are usually delivered via WebSocket to bring the application alive with updates made by other users or processes. A new email arriving in your <a href="https://itsnotatypo.com">imbox</a> is a great example.

The action stream tags look like this:

```html
<turbo-stream action="append" target="messages">
  <template>
    <div id="message_1">
      This div will be appended to the dom container with the id of messages.
    </div>
  </template>
</turbo-stream>

<turbo-stream action="prepend" target="messages">
  <template>
    <div id="message_1">
      This div will be prepend to the dom container with the id of messages.
    </div>
  </template>
</turbo-stream>
    
<turbo-stream action="replace" target="message_1">
  <template>
    <div id="message_1">
      This div will be replace the existing div with the dom id of message_1.
    </div>
  </template>
</turbo-stream>

<turbo-stream action="remove" target="message_1">
  This will remove the existing dom element with the id of message_1.
  The content within this template is not used.
</turbo-stream>
```

You can stream multiple actions in a single message from a WebSocket or response to a form submission.

## Processing updates in HTTP responses

Turbo knows to automatically apply the change actions when they arrive in a response using the content type of `text/html; turbo-stream`. Turbo itself adds this content type to the `Accept` header, to let the server know that these responses are possible. It's therefore easily possible to tailor your server responses to deal with both Turbo Streams and regular redirects or other responses for clients that don't want the streams (such as native applications).

In a Rails controller, this would look like:

```ruby
def destroy
  @message = Message.find(params[:id])
  @message.destroy
  
  respond_to do |format|
    format.turbo_stream { render turbo_stream: turbo_stream.remove dom_id(@message) }
    format.html         { redirect_to messages_url }
  end
end
```

## Reusing server-side templates

The key to Turbo Streams is the ability to reuse your existing server-side templates to perform live, partial page changes. The HTML template used to render each message in a list of such on the first page load is the same template that'll be used to add one new message to the list dynamically later. This is at the essence of the HTML-over-the-wire approach: You don't need to serialize the new message as JSON, receive it in JavaScript, render a client-side template. It's just the standard server-side templates reused.

Another example from how this would look in Rails:

```html
# app/views/messages/_message.html.erb
<div id="<%= dom_id message %>">
  <%= message.content %>
</div>

# app/views/messages/index.html.erb
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
        render turbo_stream: turbo_stream.append :messages, partial: "messages/message",
          locals: { message: message }, formats: :html %>
      end

      format.html { redirect_to messages_url }
    end
  end
end
```

When the form to create a new message is submitting to the `MessagesController#create` action, the very same partial template that was used to render the list of messages in `MessagesController#index` is used to render the turbo-stream action. This will come across as a response that looks like this:

```html
Content-Type: text/html; turbo-update

<turbo-stream action="append" target="messages">
  <template>
    <div id="message_1">
      The content of the message.
    </div>
  </template>
</turbo-stream>
```

This `messages/message` template partial can then also be used to re-render the message following an edit/update operation. Or to supply new messages over WebSocket created by other users. Being able to reuse the same templates across the whole spectrum of use is incredibly powerful, and key to reducing the amount of work it takes to create these modern, fast applications.


## Make it a progressive enhancement

It's good practice to start your interaction design without Turbo Streams. Make the entire application work as it would if Turbo Streams were not available, then layer them on as a level-up. This means you won't come to rely on the updates for flows that need to work in native applications or elsewhere without them.

The same is especially true for WebSocket updates. On poor connections, or if there are server issues, your WebSocket may well get disconnected. If the application is designed to work without it, it'll be more resilient. 


## But what about other JavaScript logic?

Turbo Streams consciously restricts the types of actions you can take to just a four basic: append, prepend, replace, and remove. If you want to trigger additional behavior when these actions are carried out, you should attach behavior using <a href="https://stimulus.hotwire.dev">Stimulus</a> controllers. This restriction allows Turbo Streams to focus on the essential task of delivering HTML over the wire, leaving additional or advanced logic to live in dedicated JavaScript encapsulations.

Embracing these constraints will keep you from turning individual responses in a mumble of behaviors that cannot be reused. And that make the logic hard to follow. The key benefit from Turbo Streams is the ability to reuse templates for initial rendering of a page through all subsequent updates.


## Integration with server-side frameworks

Of all the techniques that are included with Turbo, it's with Turbo Streams you'll see the biggest advantage from close integration with your backend framework. As part of the official Hotwire suite, we've created a reference implementation for what such an integration can look like in the <a href="https://github.com/hotwired/turbo-rails">turbo-rails gem</a>. This gem relies on the built-in support for both WebSockets and asynchronous rendering present in Rails through the Action Cable and Active Job frameworks, respectively.

Using the <a href="https://github.com/hotwired/turbo-rails/blob/main/app/models/concerns/turbo/broadcastable.rb">Broadcastable</a> concern mixed into Active Record, you can trigger WebSocket updates directly from your domain model. And using the <a href="https://github.com/hotwired/turbo-rails/blob/main/app/models/turbo/streams/tag_builder.rb">Turbo::Streams::TagBuilder</a>, you can render turbo-stream actions in inline controller responses or dedicated templates, invoking the four actions with associated rendering through a simple DSL.

Turbo itself is completely backend-agnostic, though. So we encourage other frameworks in other ecosystems to look at the reference implementation provided for Rails to create their own tight integrations. 