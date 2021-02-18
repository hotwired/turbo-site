---
permalink: /reference/frames.html
order: 02
description: "A reference of everything you can do with Turbo Frames."
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
<turbo-frame id="messages" target="_top">
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

  <a href="/messages/1" data-turbo-frame="_top">
    Following link will replace the whole page, not this frame.
  </a>

  <form action="/messages" data-turbo-frame="navigation">
    Submitting form will replace the navigation frame.
  </form>
</turbo-frame>
```

# Attributes and properties

The `<turbo-frame>` element is a [custom element][] with its own set of HTML
attributes and JavaScript properties.

[custom element]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements

## HTML Attributes

* `src` accepts a URL or path value that controls navigation
  of the element

* `loading` has two valid [enumerated][] values: "eager" and "lazy". When
  `loading="eager"`, changes to the `src` attribute will immediately navigate
  the element. When `loading="lazy"`, changes to the `src` attribute will defer
  navigation until the element is visible in the viewport.

* `busy` is a [boolean attribute][] toggled to be present when a
  `<turbo-frame>`-initiated request starts, and toggled false when the request
  ends

* `disabled` is a [boolean attribute][] that prevents any navigation when
  present

* `target` refers to another `<turbo-frame>` element by ID to be navigated when
  a descendant `<a>` is clicked. When `target="_top"`, navigate the window.

* `autoscroll` is a [boolean attribute][] that controls whether or not to scroll
  a `<turbo-frame>` element (and its descendant `<turbo-frame>` elements) into
  view when after loading. Control the scroll's vertical alignment by setting the
  `data-autoscroll-block` attribute to a valid [Element.scrollIntoView({ block:
  "..." })][Element.scrollIntoView] value: one of `"end"`, `"start"`, `"center"`,
  or `"nearest"`. When `data-autoscroll-block` is absent, the default value is
  `"end"`.

[boolean attribute]: https://www.w3.org/TR/html52/infrastructure.html#sec-boolean-attributes
[enumerated]: https://www.w3.org/TR/html52/infrastructure.html#keywords-and-enumerated-attributes
[Element.scrollIntoView]: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#parameters

# Properties

All `<turbo-frame>` elements can be controlled in JavaScript environments
through instances of the `FrameElement` class.

* `FrameElement.src` controls the pathname or URL to be loaded

* `FrameElement.disabled` is a boolean property that controls whether or not the
  element will load

* `FrameElement.loading` controls the style (either `"eager"` or `"lazy"`) that
  the frame will loading its content.

* `FrameElement.loaded` references a [Promise][] instance that resolves once the
  `FrameElement`'s current navigation has completed.

* `FrameElement.complete` is a read-only boolean property set to `true` when the
  `FrameElement` has finished navigating and `false` otherwise.

* `FrameElement.autoscroll` controls whether or not to scroll the element into
  view once loaded

* `FrameElement.isActive` is a read-only boolean property that indicates whether
  or not the frame is loaded and ready to be interacted with

* `FrameElement.isPreview` is a read-only boolean property that returns `true`
  when the `document` that contains the element is a [preview][].

[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[preview]: https://turbo.hotwire.dev/handbook/building#detecting-when-a-preview-is-visible
