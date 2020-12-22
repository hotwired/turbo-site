---
permalink: /reference/streams
order: 03
description: "A reference of everything you can do with Turbo Streams."
---

# Streams

## Append

Appends the content within the `<turbo-stream>` tag to the element designated by the DOM id assigned to the `target` attribute.

```html
<turbo-stream action="append" target="dom_id">
  Content to append to container designated with the dom_id.
</turbo-stream>
```

## Prepend

Prepends the content within the `<turbo-stream>` tag to the element designated by the DOM id assigned to the `target` attribute.

```html
<turbo-stream action="prepend" target="dom_id">
  Content to prepend to container designated with the dom_id.
</turbo-stream>
```

## Replace

Replaces the element designated by the DOM id assigned to the `target` attribute with the content within the `<turbo-stream>` tag.

```html
<turbo-stream action="replace" target="dom_id">
  Content to replace the element designated with the dom_id.
</turbo-stream>
```

## Remove

Removes the element designated by the DOM id assigned to the `target` attribute.

```html
<turbo-stream action="remove" target="dom_id">
</turbo-stream>
```
