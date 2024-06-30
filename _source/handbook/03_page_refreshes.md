---
permalink: /handbook/page_refreshes.html
description: "Turbo can perform smooth page refreshes with morphing and scroll preservation."
---

# Smooth page refreshes with morphing

[Turbo Drive](/handbook/drive.html) makes navigation faster by avoiding full-page reloads. But there is a scenario where Turbo can raise the fidelity bar further: loading the current page again (page refresh).

A typical scenario for page refreshes is submitting a form and getting redirected back. In such scenarios, sensations significantly improve if only the changed contents get updated instead of replacing the `<body>` of the page. Turbo can do this on your behalf with morphing and scroll preservation.

${toc}

## Morphing

You can configure how Turbo handles page refresh with a `<meta name="turbo-refresh-method">` in the page's head.

```html
<head>
  ...
  <meta name="turbo-refresh-method" content="morph">
</head>
```

The possible values are `morph` or `replace` (the default). When it is `morph,` when a page refresh happens, instead of replacing the page's `<body>` contents, Turbo will only update the DOM elements that have changed, keeping the rest untouched. This approach delivers better sensations because it keeps the screen state.

Under the hood, Turbo uses the fantastic [idiomorph library](https://github.com/bigskysoftware/idiomorph).

## Scroll preservation

You can configure how Turbo handles scrolling with a `<meta name="turbo-refresh-scroll">` in the page's head.

```html
<head>
  ...
  <meta name="turbo-refresh-scroll" content="preserve">
</head>
```

The possible values are `preserve` or `reset` (the default). When it is `preserve`, when a page refresh happens, Turbo will keep the page's vertical and horizontal scroll.

## Exclude sections from morphing

Sometimes, you want to ignore certain elements while morphing. For example, you might have a popover that you want to keep open when the page refreshes. You can flag such elements with `data-turbo-permanent`, and Turbo won't attempt to morph them.

```html
<div data-turbo-permanent>...</div>
```

## Turbo frames

You can use [turbo frames](/handbook/frames.html) to define regions in your screen that will get reloaded using morphing when a page refresh happens. To do so, you must flag those frames with `refresh="morph"`.

```html
<turbo-frame id="my-frame" refresh="morph" src="/my_frame">
</turbo-frame>
```

With this mechanism, you can load additional content that didn't arrive in the initial page load (e.g., pagination). When a page refresh happens, Turbo won't remove the frame contents; instead, it will reload the turbo frame and render its contents with morphing.

## Broadcasting page refreshes

There is a new [turbo stream action](/handbook/streams.html) called `refresh` that will trigger a page refresh:

```html
<turbo-stream action="refresh"></turbo-stream>
```

Server-side frameworks can leverage these streams to offer a simple but powerful broadcasting model: the server broadcasts a single general signal, and pages smoothly refresh with morphing. 

You can see how the  [`turbo-rails`](https://github.com/hotwired/turbo-rails) gem does it for Rails:

```ruby
# In the model
class Calendar < ApplicationRecord
  broadcasts_refreshes
end

# View
turbo_stream_from @calendar
```
