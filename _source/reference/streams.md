---
permalink: /reference/streams.html
order: 03
description: "A reference of everything you can do with Turbo Streams."
---

# Streams

## The nine actions

### Append

Appends the content within the template tag to the container designated by the target dom id.

```html
<turbo-stream action="append" target="dom_id">
  <template>
    Content to append to container designated with the dom_id.
  </template>
</turbo-stream>
```
If the template's first element has an id that is already used by a direct child inside the container targeted by dom_id, it is replaced instead of appended.

### Prepend

Prepends the content within the template tag to the container designated by the target dom id.

```html
<turbo-stream action="prepend" target="dom_id">
  <template>
    Content to prepend to container designated with the dom_id.
  </template>
</turbo-stream>
```
If the template's first element has an id that is already used by a direct child inside the container targeted by dom_id, it is replaced instead of prepended.

### Replace

Replaces the element designated by the target dom id.

```html
<turbo-stream action="replace" target="dom_id">
  <template>
    Content to replace the element designated with the dom_id.
  </template>
</turbo-stream>
```

The `[method="morph"]` attribute can be added to the `turbo-stream` element to replace the element designated by the target dom id via morph.

```html
<turbo-stream action="replace" method="morph" target="dom_id">
  <template>
    Content to replace the element.
  </template>
</turbo-stream>
```

### Update

Updates the content within the template tag to the container designated by the target dom id.

```html
<turbo-stream action="update" target="dom_id">
  <template>
    Content to update to container designated with the dom_id.
  </template>
</turbo-stream>
```

The `[method="morph"]` attribute can be added to the `turbo-stream` element to morph only the children of the element designated by the target dom id.

```html
<turbo-stream action="update" method="morph" target="dom_id">
  <template>
    Content to replace the element.
  </template>
</turbo-stream>
```

### Remove

Removes the element designated by the target dom id.

```html
<turbo-stream action="remove" target="dom_id">
</turbo-stream>
```

### Before

Inserts the content within the template tag before the element designated by the target dom id.

```html
<turbo-stream action="before" target="dom_id">
  <template>
    Content to place before the element designated with the dom_id.
  </template>
</turbo-stream>
```

### After

Inserts the content within the template tag after the element designated by the target dom id.

```html
<turbo-stream action="after" target="dom_id">
  <template>
    Content to place after the element designated with the dom_id.
  </template>
</turbo-stream>
```

### Refresh

Initiates a [Page Refresh](/handbook/page_refreshes) to render new content with
morphing.

```html
<!-- without `[request-id]` -->
<turbo-stream action="refresh"></turbo-stream>

<!-- debounced with `[request-id]` -->
<turbo-stream action="refresh" request-id="abcd-1234"></turbo-stream>
```

## Targeting Multiple Elements

To target multiple elements with a single action, use the `targets` attribute with a CSS query selector instead of the `target` attribute.

```html
<turbo-stream action="remove" targets=".elementsWithClass">
</turbo-stream>

<turbo-stream action="after" targets=".elementsWithClass">
  <template>
    Content to place after the elements designated with the css query.
  </template>
</turbo-stream>
```

## Processing Stream Elements

Turbo can connect to any form of stream to receive and process stream actions. A stream source must dispatch [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent) messages that contain the stream action HTML in the `data` attribute of that event. It's then connected by `Turbo.session.connectStreamSource(source)` and disconnected via `Turbo.session.disconnectStreamSource(source)`. If you need to process stream actions from different source than something producing `MessageEvent`s, you can use `Turbo.renderStreamMessage(streamActionHTML)` to do so.

A good way to wrap all this together is by using a custom element, like turbo-rails does with [TurboCableStreamSourceElement](https://github.com/hotwired/turbo-rails/blob/main/app/javascript/turbo/cable_stream_source_element.js).

## Stream Elements inside HTML

Turbo streams are implemented as [a custom HTML element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements).
The element is interpreted as part of the `connectedCallback` function that the browser calls when the element is
connected to the page dom.

This means that any stream elements that are rendered into the dom will be interpreted. After being interpreted, Turbo
will remove the element from the dom. More specifically, it means that rendering stream actions inside the page or
frame content HTML will cause them to be executed. This can be used to execute additional sideffects beside the main content
loading.
