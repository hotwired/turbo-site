---
permalink: /handbook/frames
---

# Decompose with Turbo Frames
{:.no_toc}

Frames are created by wrapping a segment of the page in a `<turbo-frame>` tag. Each tag must have a unique id, which is used for matching the content to replace when requesting new pages from the server. A single page can have multiple frames, each establishing their own context:

```html
<body>
  <div id="navigation">Links targeting the entire page</div>

  <turbo-frame id="message_1">
    <h1>My message title</h1>
    <p>My message content</p>
    <a href="/messages/1/edit">Edit this message</a>
  </turbo-frame>

  <turbo-frame id="comments">
    <div id="comment_1">One comment</div>
    <div id="comment_2">Two comments</div>

    <form action="/messages/comments">...</form>
  </turbo-frame>  
</body>
```

This page has two frames: One to display the message itself, with a link to edit it. One to list all the comments, with a form to add another. Each create their own context for navigation: Following links and submitting forms.

The frame for the message has a link to edit the message, which will be intercepted by Turbo when clicked. The response provided by `/messages/1/edit` is examined for a `<turbo-frame id="message_1">` segment, and the content of that frame is used to replace the current content of the frame. The response might look like this:

```html
<body>
  <h1>Editing message</h1>

  <turbo-frame id="message_1">
    <form action="/messages/1">
      <input name="message[name]" type="text" value="My message title">
      <textarea name="message[name]">My message content</textarea>
      <input type="submit">
    </form>
  </turbo-frame>
</body>
```

Notice how the `h1` tag isn't inside the `turbo-frame` tag. This means it'll be ignored when the form replaces the display of the message upon editing. Only content inside a matching `turbo-frame` tag is used when the frame is updated.

This means your page can easily play two purposes. One purpose when used to make edits in place within a frame. Another if the edit happens outside the frame, and where the entire page is dedicated to the action.

## Lazy-loading frames

Frames don't have to be populated when the page that contains them is loaded. If a `src` attribute is present on the `turbo-frame` tag, the referenced URL will automatically be lazy loaded as soon as the tag is rendered. An example:

```html
<body>
  <h1>Imbox</h1>

  <div id="emails">
    ...
  </div>

  <turbo-frame id="set_aside_tray" src="/emails/set_aside">
  </turbo-frame>

  <turbo-frame id="reply_later_tray" src="/emails/reply_later">
  </turbo-frame>
</body>
```

This page lists all the emails available in your <a href="https://itsnotatypo.com">imbox</a> immediately upon loading the page, but then makes two subsequent requests to present small trays at the bottom of the page for emails that have been set aside or a waiting for a later reply. These trays are created out of separate HTTP requests made to the URLs referenced in the `src`.

In the example above, the trays start out empty. But it's also possible to populate the lazy-loading frames with initial content, which is then overwritten when the content is fetched from the `src`:

```html
<turbo-frame id="set_aside_tray" src="/emails/set_aside">
  <img src="/icons/spinner.gif">
</turbo-frame>
```

The response to `/emails/set_aside` must contain a corresponding `turbo-frame` tag as in the original example:

```html
<body>
  <h1>Set Aside Emails</h1>

  <p>These are emails you've set aside</p>

  <turbo-frame id="set_aside_tray">
    <div id="emails">
      <div id="email_1"><a href="/emails/1">My important email</a></div>
    </div>
  </turbo-frame>
</body>
```

This page now works in both its minimized form, where only the `div` with the individual emails are loaded into the tray frame on the imbox page, but also as a direct destination where a header and a description is provided.

Note that the `turbo-frame` tag on `/emails/set_aside` does not contain a `src` attribute. This would create a loop where the frame keeps requesting itself.

## Navigation targeting

By default, navigation within the frame will target just the frame. Navigating links and submitting forms both work like this. But it's possible to both set their targets to the top "frame" (i.e. the whole page) or even another named frame. This is frequently done when the primary purpose of the frame is to provide lazy loading. 

In the example with the set-aside tray, the links within the tray point to individual emails. You don't want those links to look for frame tags that match the `set_aside_tray` id. You want to navigate directly to that email. This is done by marking the trays with the `drive-target` attribute:

```html
<body>
  <h1>Imbox</h1>
  ...
  <turbo-frame id="set_aside_tray" src="/emails/set_aside" drive-target="top">
  </turbo-frame>
</body>

<body>
  <h1>Set Aside Emails</h1>
  ...
  <turbo-frame id="set_aside_tray" drive-target="top">
    ...
  </turbo-frame>
</body>
```