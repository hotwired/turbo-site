---
permalink: /reference/frames
order: 02
---

# Frames

## Basic frame

Confines all navigation within the frame by expecting any followed link or form submission to return a response including a matching frame tag:

```html
<turbo-frame id="messages">
  <a href="/messages/expanded">
    Show all expanded messages in this frame.
  </a>
  
  <form action="/messages">
    Show response from this form within this frame.
  </form>
</turbo-frame>
```

## Lazy-loaded frame

Works like the basic frame, but the content is loaded from a remote `src` first.

```html
<turbo-frame id="messages" src="/messages">
  Content will be replaced when /messages has been loaded.
</turbo-frame>
```

## Frame that drives navigation to replace whole page

```html
<turbo-frame id="messages" drive-target="top">
  <a href="/messages/1">
    Following link will replace the whole page, not this frame.
  </a>
  
  <form action="/messages">
    Submitting form will replace the whole page, not this frame.
  </form>
</turbo-frame>
```

## Frame with overwritten navigation targets

```html
<turbo-frame id="messages">
  <a href="/messages/1">
    Following link will replace this frame.
  </a>

  <a href="/messages/1" drive-target="top">
    Following link will replace the whole page, not this frame.
  </a>
  
  <form action="/messages" drive-target="navigation">
    Submitting form will replace the navigation frame.
  </form>
</turbo-frame>
```
