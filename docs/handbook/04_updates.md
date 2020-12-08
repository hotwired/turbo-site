---
permalink: /handbook/updates
---

# Alive with Turbo Updates

Turbo Updates are fragments of HTML wrapped in a `<template>` tag which specify a command together with a dom id destination to detail what should happen to that HTML. The updates are usually delivered via WebSocket to bring the application alive with changes made by other users or processes or actions. A new email arriving in your <a href="https://itsnotatypo.com">imbox</a> is a great example.

The updates look like this:

```html
<template data-turbo-update="append#messages">
  <div id="message_1">
    This div will be appended to the dom container with the id of messages.
  </div>
</template>

<template data-turbo-update="prepend#messages">
  <div id="message_1">
    This div will be prepend to the dom container with the id of messages.
  </div>
</template>

<template data-turbo-update="replace#message_1">
  <div id="message_1">
    This div will be replace the existing div with the dom id of message_1.
  </div>
</template>

<template data-turbo-update="remove#message_1">
  This will remove the existing dom element with the id of message_1.
  The content within this template is not used.
</template>
```

A single update, whether it's coming from a WebSocket or in response to a form submission, can contain multiple commands, each wrapped in their own `<template>` tag.


## Processing updates in HTTP responses

Turbo knows to automatically apply updates when they arrive in a response using the content type of `text/html; turbo-update`. Turbo itself adds this content type to the `Accept` header, to let the server know that these responses are possible. It's therefore easily possible to tailor your server responses to deal with both Turbo Updates and regular redirects or other responses for clients that don't want the updates (such as native applications).

In a Rails controller, this would look like:

```ruby
def destroy
  @message = Message.find(params[:id])
  @message.destroy
  
  respond_to do |format|
    format.turbo_update { turbo_update.remove dom_id(@message) }
    format.html         { redirect_to messages_url }
  end
end
```

## Reusing server-side templates

The key to Turbo Updates is the ability to reuse your existing server-side templates to perform live, partial page updates. The HTML template used to render each message in a list of such on the first page load is the same template that'll be used to add one new message to the list dynamically later. This is at the essence of the HTML-over-the-wire approach: You don't need to serialize the new message as JSON, receive it in JavaScript, render a client-side template. It's just the standard server-side templates reused.

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
      format.turbo_update do 
        turbo_update.append :messages, partial: "messages/message",
          locals: { message: message }, formats: :html %>
      end

      format.html { redirect_to messages_url }
    end
  end
end
```

When the form to create a new message is submitting to the `MessagesController#create` action, the very same partial template that was used to render the list of messages in `MessagesController#index` is used to render the partial page update. This will come across as a response that looks like this:

```html
Content-Type: text/html; turbo-update

<template data-turbo-update="append#messages">
  <div id="message_1">
    The content of the message.
  </div>
</template>
```

This `messages/message` template partial can then also be used to re-render the message following an edit/update operation. Or to supply new messages over WebSocket created by other users. Being able to reuse the same templates across the whole spectrum of use is incredibly powerful, and key to reducing the amount of work it takes to create these modern, fast applications.


## Make it a progressive enhancement

It's good practice to start your interaction design without Turbo Updates. Make the entire application work as it would if Turbo Updates were not available, then layer them on as a level-up. This means you won't come to rely on the updates for flows that need to work in native applications or elsewhere without them.

The same is especially true for WebSocket updates. On poor connections, or if there are server issues, your WebSocket may well get disconnected. If the application is designed to work without it, it'll be more resilient. 


## But what about other JavaScript logic?

Turbo Updates consciously restricts the types of updates you can make to just the four basic commands: append, prepend, replace, and remove. If you want to trigger additional behavior when these commands are carried out, you should attach behavior using <a href="https://stimulusjs.org">Stimulus</a> controllers. This restriction allows Turbo Updates to focus on the essential task of delivering HTML over the wire, leaving additional or advanced logic to live in dedicated JavaScript encapsulations.

Embracing these constraints will keep you from turning individual responses in a mumble of behaviors that cannot be reused. And that make the logic hard to follow. The key benefit from Turbo Updates is the ability to reuse templates for initial rendering of a page through all subsequent updates.


## Integration with server-side frameworks

Of all the techniques that are included with Turbo, it's with Turbo Updates you'll see the biggest advantage from close integration with your backend framework. As part of the official Hotwire suite, we've created a reference implementation for what such an integration can look like in the <a href="https://github.com/hotwired/turbo-rails">turbo-rails gem</a>. This gem relies on the built-in support for both WebSockets and asynchronous rendering present in Rails through the Action Cable and Active Job frameworks, respectively.

Using the <a href="https://github.com/hotwired/turbo-rails/blob/main/app/models/concerns/turbo/broadcastable.rb">Broadcastable</a> concern mixed into Active Record, you can trigger WebSocket updates directly from your domain model. And using the <a href="https://github.com/hotwired/turbo-rails/blob/main/app/models/turbo/updates/tag_builder.rb">Turbo::Updates::TagBuilder</a>, you can render turbo updates in controller actions or dedicated templates, invoking the four commands with associated rendering through a simple DSL.

Turbo itself is completely backend-agnostic, though. So we encourage other frameworks in other ecosystems to look at the reference implementation provided for Rails to create their own tight integrations. 