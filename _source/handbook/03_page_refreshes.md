---
permalink: /handbook/page_refreshes.html
description: "Turbo can perform smooth page refreshes with morphing and scroll preservation."
---

# Smooth page refreshes with morphing

[Turbo Drive](/handbook/drive.html) makes navigation faster by avoiding full-page reloads. But there is a scenario where Turbo can raise the fidelity bar further: loading the current page again (page refresh).

A typical scenario for page refreshes is submitting a form and getting redirected back. In such scenarios, sensations significantly improve if only the changed contents get updated instead of replacing the `<body>` of the page. Turbo can do this on your behalf with morphing and scroll preservation.

${toc}

## Page Refreshes

A "page refresh" is a [application visit](/handbook/drive#application-visits) with a `"replace"` action to a URL with a whose [pathname](https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname) matches the current URL [path](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_URL#path_to_resource). Page refreshes can be initiated by driving the page with a link, or by [redirecting after a form submission](/handbook/drive#redirecting-after-a-form-submission). In either case, the elements must have a `[data-turbo-action="replace"]` attribute:

```html
<a href="/" data-turbo-action="replace">Page refresh link</a>

<form action="/redirect_back" method="post" data-turbo-action="replace">
  <button>Page refresh form</button>
</form>
```

## Morphing

You can configure how Turbo handles page refresh with a `<meta name="turbo-refresh-method">` in the page's head.

```html
<head>
  ...
  <meta name="turbo-refresh-method" content="morph">
</head>
```

The possible values are `morph` or `replace` (the default). When the `<meta>` element is omitted or its `content` attribute is `replace`, Turbo will [replace the page's `<body>` element](/handbook/drive#page-navigation-basics). When the `content` attribute is `morph`, Turbo will handle [page refreshes](#page-refreshes) by updating *only* the DOM elements that have changed. This approach delivers better sensations because it keeps the screen state like element focus.

Under the hood, Turbo uses the fantastic [idiomorph library](https://github.com/bigskysoftware/idiomorph).

## Scroll preservation

You can configure how Turbo handles scrolling when handling with a `<meta name="turbo-refresh-scroll">` in the page's head.

```html
<head>
  ...
  <meta name="turbo-refresh-scroll" content="preserve">
</head>
```

The possible values are `preserve` or `reset` (the default). When the `<meta>` element is omitted or its `content` attribute is `reset`, Turbo will [reset the page's scroll position](/handbook/drive#application-visits). When the `content` attribute is `preserve`, Turbo will handle [page refreshes](#page-refreshes) by maintaining the page's vertical and horizontal scroll.

## Exclude sections from morphing

Sometimes, you want to ignore certain elements while morphing. For example, you might have a popover that you want to keep open when the page refreshes. You can flag such elements with `data-turbo-permanent`, and Turbo won't attempt to morph them.

```html
<div data-turbo-permanent>...</div>
```

## Turbo frames

You can use [turbo frames](/handbook/frames.html) to define regions in your screen that will get reloaded using morphing when a page refresh happens. To do so, you must flag those frames with `refresh="morph"`.

```html
<turbo-frame id="my-frame" refresh="morph">
  ...
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
