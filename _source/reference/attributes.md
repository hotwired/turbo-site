---
permalink: /reference/attributes.html
order: 05
title: "Attributes"
description: "A reference of everything you can do with element attributes and meta tags."
---

# Attributes and Meta Tags

## Data Attributes

The following data attributes can be applied to elements to customize Turbo's behaviour.

* `data-turbo="false"` disables Turbo Drive on links and forms including descendants. To reenable when an ancestor has opted out, use `data-turbo="true"`. Be careful: when Turbo Drive is disabled, browsers treat link clicks as normal, but [native adapters](/handbook/native) may exit the app.
* `data-turbo-track="reload"` tracks the element's HTML and performs a full page reload when it changes. Typically used to [keep `script` and CSS `link` elements up-to-date](/handbook/drive#reloading-when-assets-change).
* `data-turbo-frame` identifies the Turbo Frame to navigate. Refer to the [Frames documentation](/reference/frames) for further details.
* `data-turbo-action` customizes the [Visit](/handbook/drive#page-navigation-basics) action. Valid values are `replace` or `advance`. Can also be used with Turbo Frames to [promote frame navigations to page visits](/handbook/frames#promoting-a-frame-navigation-to-a-page-visit).
* `data-turbo-permanent` [persists the element between page loads](/handbook/building#persisting-elements-across-page-loads). The element must have a unique `id` attribute. It also serves to exclude elements from being morphed when using [page refreshes with morphing](/handbook/page_refreshes.html)
* `data-turbo-temporary` removes the element before the document is cached, preventing it from reappearing when restored.
* `data-turbo-eval="false"` prevents inline `script` elements from being re-evaluated on Visits.
* `data-turbo-method` changes the link request type from the default `GET`. Ideally, non-`GET` requests should be triggered with forms, but `data-turbo-method` might be useful where a form is not possible.
* `data-turbo-stream` specifies that a link or form can accept a Turbo Streams response. Turbo [automatically requests stream responses](/handbook/streams#streaming-from-http-responses) for form submissions with non-`GET` methods; `data-turbo-stream` allows Turbo Streams to be used with `GET` requests as well.
* `data-turbo-confirm` presents a confirm dialog with the given value. Can be used on `form` elements or links with `data-turbo-method`.
* `data-turbo-submits-with` specifies text to display when submitting a form. Can be used on `input` or `button` elements. While the form is submitting the text of the element will show the value of `data-turbo-submits-with`. After the submission, the original text will be restored. Useful for giving user feedback by showing a message like "Saving..." while an operation is in progress.

## Automatically Added Attributes

The following attributes are automatically added by Turbo and are useful to determine the Visit state at a given moment.

* `disabled` is added to the form submitter while the form request is in progress, to prevent repeat submissions.
* `data-turbo-preview` is added to the `html` element when displaying a [preview](/handbook/building#detecting-when-a-preview-is-visible) during a Visit.
* `aria-busy` is added to `html` and `turbo-frame` elements when a navigation is in progress.

## Meta Tags

The following `meta` elements, added to the `head`, can be used to customize caching and Visit behavior.

* `<meta name="turbo-cache-control">` to [opt out of caching](/handbook/building#opting-out-of-caching).
* `<meta name="turbo-visit-control" content="reload">` will perform a full page reload whenever Turbo navigates to the page, including when the request originates from a `<turbo-frame>`.
* `<meta name="turbo-root">` to [scope Turbo Drive to a particular root location](/handbook/drive#setting-a-root-location).
* `<meta name="turbo-refresh-method" content="morph">` will configure [page refreshes with morphing](/handbook/page_refreshes.html).
* `<meta name="turbo-refresh-scroll" content="preserve">` will enable [scroll preservation during page refreshes](/handbook/page_refreshes.html).
