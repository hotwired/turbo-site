---
permalink: /reference/attributes.html
order: 05
title: "Attributes"
description: "A reference of everything you can do with element attributes and meta tags."
---

# Attributes and Meta Tags

## Data Attributes

The following data attributes can be applied to elements to customize Turbo's behaviour.

* `data-turbo="false"` disables Turbo Drive on links and forms including descendants. To reenable when an ancestor has opted out, use `data-turbo="true"`. Be careful: when Turbo Drive is disabled, browsers treat link clicks as normal, but [native adapters](/handbook/native) may exit the app. Note that if Turbo [ignores a path](/handbook/drive#ignored-paths), then setting `data-turbo="true"` will not force/override it to enable.
* `data-turbo-track="reload"` tracks the element's HTML and performs a full page reload when it changes. Typically used to [keep `script` and CSS `link` elements up-to-date](/handbook/drive#reloading-when-assets-change).
* `data-turbo-track="dynamic"` tracks the element's HTML and removes the element when it is absent from an HTML response. Typically used to [remove `style` and `link` elements](/handbook/drive#removing-assets-when-they-change) during navigation.
* `data-turbo-frame` identifies the Turbo Frame to navigate. Refer to the [Frames documentation](/reference/frames) for further details.
* `data-turbo-preload` signals to [Drive](/handbook/drive#preload-links-into-the-cache) to pre-fetch the next page's content
* `data-turbo-prefetch="false"` [disables prefetching links](/handbook/drive#prefetching-links-on-hover) when the element is hovered.
* `data-turbo-action` customizes the [Visit](/handbook/drive#page-navigation-basics) action. Valid values are `replace` or `advance`. Can also be used with Turbo Frames to [promote frame navigations to page visits](/handbook/frames#promoting-a-frame-navigation-to-a-page-visit).
* `data-turbo-permanent` [persists the element between page loads](/handbook/building#persisting-elements-across-page-loads). The element must have a unique `id` attribute. It also serves to exclude elements from being morphed when using [page refreshes with morphing](/handbook/page_refreshes.html)
* `data-turbo-temporary` removes the element before the document is cached, preventing it from reappearing when restored.
* `data-turbo-eval="false"` prevents inline `script` elements from being re-evaluated on Visits.
* `data-turbo-method` changes the link request type from the default `GET`. Ideally, non-`GET` requests should be triggered with forms, but `data-turbo-method` might be useful where a form is not possible.
* `data-turbo-stream` specifies that a link or form can accept a Turbo Streams response. Turbo [automatically requests stream responses](/handbook/streams#streaming-from-http-responses) for form submissions with non-`GET` methods; `data-turbo-stream` allows Turbo Streams to be used with `GET` requests as well.
* `data-turbo-confirm` presents a confirm dialog with the given value. Can be used on `form` elements or links with `data-turbo-method`.
* `data-turbo-submits-with` specifies text to display when submitting a form. Can be used on `input` or `button` elements. While the form is submitting the text of the element will show the value of `data-turbo-submits-with`. After the submission, the original text will be restored. Useful for giving user feedback by showing a message like "Saving..." while an operation is in progress.
* `download` opts out of Turbo since the link is for downloading files and not navigation.

## Automatically Added Attributes

The following attributes are automatically added by Turbo and are useful to determine the Visit state at a given moment.

* `disabled` is added to the form submitter while the form request is in progress, to prevent repeat submissions.
* `data-turbo-preview` is added to the `html` element when displaying a [preview](/handbook/building#detecting-when-a-preview-is-visible) during a Visit.
* `data-turbo-visit-direction` is added to the `html` element during a visit, with a value of `forward` or `back` or `none`, to indicate its direction.
* `aria-busy` is added to:
  * the `html` element when a visit is in progress
  * the `form` element when a submission is in progress.
  * the `turbo-frame` element when a visit or form submission is in progress within the frame.
* `busy` is added to the `turbo-frame` element when a navigation or form submission is in progress within the frame.

## Meta Tags

The following `meta` elements, added to the `head`, can be used to customize caching and Visit behavior.

* `<meta name="turbo-cache-control">` to [opt out of caching](/handbook/building#opting-out-of-caching).
* `<meta name="turbo-visit-control" content="reload">` will perform a full page reload whenever Turbo navigates to the page, including when the request originates from a `<turbo-frame>`.
* `<meta name="turbo-root">` to [scope Turbo Drive to a particular root location](/handbook/drive#setting-a-root-location).
* `<meta name="view-transition" content="same-origin">` to trigger view transitions on browsers that support the [View Transition API](https://caniuse.com/view-transitions).
* `<meta name="turbo-refresh-method" content="morph">` will configure [page refreshes with morphing](/handbook/page_refreshes.html).
* `<meta name="turbo-refresh-scroll" content="preserve">` will enable [scroll preservation during page refreshes](/handbook/page_refreshes.html).
* `<meta name="turbo-prefetch" content="false">` will disable [prefetching links on hover](/handbook/drive#prefetching-links-on-hover).
