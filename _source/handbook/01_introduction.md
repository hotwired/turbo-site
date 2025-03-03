---
permalink: /handbook/introduction.html
redirect_from: /handbook/
description: "Turbo bundles several techniques for creating fast, modern web applications without having to reach for a client-side JavaScript framework."
---

# Introduction

Turbo bundles several techniques for creating fast, modern, progressively enhanced web applications without using much JavaScript. It offers a simpler alternative to the prevailing client-side frameworks which put all the logic in the front-end and confine the server side of your app to being little more than a JSON API.

With Turbo, you let the server deliver HTML directly, which means all the logic for checking permissions, interacting directly with your domain model, and everything else that goes into programming an application can happen more or less exclusively within your favorite programming language. You're no longer mirroring logic on both sides of a JSON divide. All the logic lives on the server, and the browser deals just with the final HTML.

You can read more about the benefits of this HTML-over-the-wire approach on the <a href="https://hotwired.dev/">Hotwire site</a>. What follows are the techniques that Turbo brings to make this possible.

## Turbo Drive: Navigate within a persistent process

A key attraction with traditional single-page applications, when compared with the old-school, separate-pages approach, is the speed of navigation. SPAs get a lot of that speed from not constantly tearing down the application process, only to reinitialize it on the very next page.

Turbo Drive gives you that same speed by using the same persistent-process model, but without requiring you to craft your entire application around the paradigm. There's no client-side router to maintain, there's no state to carefully manage. The persistent process is managed by Turbo, and you write your server-side code as though you were living back in the early aughts – blissfully isolated from the complexities of today's SPA monstrosities!

This happens by intercepting all clicks on `<a href>` links to the same domain. When you click an eligible link, Turbo Drive prevents the browser from following it, changes the browser’s URL using the <a href="https://developer.mozilla.org/en-US/docs/Web/API/History">History API</a>, requests the new page using <a href="https://developer.mozilla.org/en-US/docs/Web/API/fetch">`fetch`</a>, and then renders the HTML response.

Same deal with forms. Their submissions are turned into `fetch` requests from which Turbo Drive will follow the redirect and render the HTML response.

During rendering, Turbo Drive replaces the contents of the `<body>` element and merges the contents of the `<head>` element. The JavaScript window and document objects, and the `<html>` element, persist from one rendering to the next.

While it's possible to interact directly with Turbo Drive to control how visits happen or hook into the lifecycle of the request, the majority of the time this is a drop-in replacement where the speed is free just by adopting a few conventions.


## Turbo Frames: Decompose complex pages

Most web applications present pages that contain several independent segments. For a discussion page, you might have a navigation bar on the top, a list of messages in the center, a form at the bottom to add a new message, and a sidebar with related topics. Generating this discussion page normally means generating each segment in a serialized manner, piecing them all together, then delivering the result as a single HTML response to the browser.

With Turbo Frames, you can place those independent segments inside frame elements that can scope their navigation and be lazily loaded. Scoped navigation means all interaction within a frame, like clicking links or submitting forms, happens within that frame, keeping the rest of the page from changing or reloading.

To wrap an independent segment in its own navigation context, enclose it in a `<turbo-frame>` tag. For example:

```html
<turbo-frame id="new_message">
  <form action="/messages" method="post">
    ...
  </form>
</turbo-frame>
```

When you submit the form above, Turbo extracts the matching `<turbo-frame id="new_message">` element from the redirected HTML response and swaps its content into the existing `new_message` frame element. The rest of the page stays just as it was.

Frames can also defer loading their contents in addition to scoping navigation. To defer loading a frame, add a `src` attribute whose value is the URL to be automatically loaded. As with scoped navigation, Turbo finds and extracts the matching frame from the resulting response and swaps its content into place:

```html
<turbo-frame id="messages" src="/messages">
  <p>This message will be replaced by the response from /messages.</p>
</turbo-frame>
```

This may sound a lot like old-school frames, or even `<iframe>`s, but Turbo Frames are part of the same DOM, so there's none of the weirdness or compromises associated with "real" frames. Turbo Frames are styled by the same CSS, part of the same JavaScript context, and are not placed under any additional content security restrictions.

In addition to turning your segments into independent contexts, Turbo Frames affords you:

1. **Efficient caching.** In the discussion page example above, the related topics sidebar needs to expire whenever a new related topic appears, but the list of messages in the center does not. When everything is just one page, the whole cache expires as soon as any of the individual segments do. With frames, each segment is cached independently, so you get longer-lived caches with fewer dependent keys.
1. **Parallelized execution.** Each defer-loaded frame is generated by its own HTTP request/response, which means it can be handled by a separate process. This allows for parallelized execution without having to manually manage the process. A complicated composite page that takes 400ms to complete end-to-end can be broken up with frames where the initial request might only take 50ms, and each of three defer-loaded frames each take 50ms. Now the whole page is done in 100ms because the three frames each taking 50ms run concurrently rather than sequentially.
1. **Ready for mobile.** In mobile apps, you usually can't have big, complicated composite pages. Each segment needs a dedicated screen. With an application built using Turbo Frames, you've already done this work of turning the composite page into segments. These segments can then appear in native sheets and screens without alteration (since they all have independent URLs).


## Turbo Streams: Deliver live page changes

Making partial page changes in response to asynchronous actions is how we make the application feel alive. While Turbo Frames give us such updates in response to direct interactions within a single frame, Turbo Streams let us change any part of the page in response to updates sent over a WebSocket connection, SSE or other transport. (Think an <a href="http://itsnotatypo.com">imbox</a> that automatically updates when a new email arrives.)

Turbo Streams introduces a `<turbo-stream>` element with nine basic actions: `append`, `prepend`, `replace`, `update`, `remove`, `before`, `after`, `morph`, and `refresh`. With these actions, along with the `target` attribute specifying the ID of the element you want to operate on, you can encode all the mutations needed to refresh the page. You can even combine several stream elements in a single stream message. Simply include the HTML you're interested in inserting or replacing in a <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template">template tag</a> and Turbo does the rest:

```html
<turbo-stream action="append" target="messages">
  <template>
    <div id="message_1">My new message!</div>
  </template>
</turbo-stream>
```

This stream element will take the `div` with the new message and append it to the container with the ID `messages`. It's just as simple to replace an existing element:

```html
<turbo-stream action="replace" target="message_1">
  <template>
    <div id="message_1">This changes the existing message!</div>
  </template>
</turbo-stream>
```

This is a conceptual continuation of what in the Rails world was first called <a href="https://weblog.rubyonrails.org/2006/3/28/rails-1-1-rjs-active-record-respond_to-integration-tests-and-500-other-things/">RJS</a> and then called <a href="https://signalvnoise.com/posts/3697-server-generated-javascript-responses">SJR</a>, but realized without any need for JavaScript. The benefits remain the same:

1. **Reuse the server-side templates**: Live page changes are generated using the same server-side templates that were used to create the first-load page.
1. **HTML over the wire**: Since all we're sending is HTML, you don't need any client-side JavaScript (beyond Turbo, of course) to process the update. Yes, the HTML payload might be a tad larger than a comparable JSON, but with gzip, the difference is usually negligible, and you save all the client-side effort it takes to fetch JSON and turn it into HTML.
1. **Simpler control flow**: It's really clear to follow what happens when messages arrive on the WebSocket, SSE or in response to form submissions. There's no routing, event bubbling, or other indirection required. It's just the HTML to be changed, wrapped in a single tag that tells us how.

Now, unlike RJS and SJR, it's not possible to call custom JavaScript functions as part of a Turbo Streams action. But this is a feature, not a bug. Those techniques can easily end up producing a tangled mess when way too much JavaScript is sent along with the response. Turbo focuses squarely on just updating the DOM, and then assumes you'll connect any additional behavior using <a href="https://stimulus.hotwired.dev">Stimulus</a> actions and lifecycle callbacks.


## Turbo Native: Hybrid apps for iOS & Android

Turbo Native is ideal for building hybrid apps for iOS and Android. You can use your existing server-rendered HTML to get baseline coverage of your app's functionality in a native wrapper. Then you can spend all the time you saved on making the few screens that really benefit from high-fidelity native controls even better.

An application like Basecamp has hundreds of screens. Rewriting every single one of those screens would be an enormous task with very little benefit. Better to reserve the native firepower for high-touch interactions that really demand the highest fidelity. Something like the "New For You" inbox in Basecamp, for example, where we use swipe controls that need to feel just right. But most pages, like the one showing a single message, wouldn't really be any better if they were completely native.

Going hybrid doesn't just speed up your development process, it also gives you more freedom to upgrade your app without going through the slow and onerous app store release processes. Anything that's done in HTML can be changed in your web application, and instantly be available to all users. No waiting for Big Tech to approve your changes, no waiting for users to upgrade.

Turbo Native assumes you're using the recommended development practices available for iOS and Android. This is not a framework that abstracts native APIs away or even tries to let your native code be shareable between platforms. The part that's shareable is the HTML that's rendered server-side. But the native controls are written in the recommended native APIs.

See the <a href="https://github.com/hotwired/turbo-ios">Turbo Native: iOS</a> and <a href="https://github.com/hotwired/turbo-android">Turbo Native: Android</a> repositories for more documentation. See the native apps for HEY on <a href="https://apps.apple.com/us/app/hey-email/id1506603805">iOS</a> and <a href="https://play.google.com/store/apps/details?id=com.basecamp.hey&hl=en_US&gl=US">Android</a> to get a feel for just how good you can make a hybrid app powered by Turbo.


## Integrate with backend frameworks

You don't need any backend framework to use Turbo. All the features are built to be used directly, without further abstractions. But if you have the opportunity to use a backend framework that's integrated with Turbo, you'll find life a lot simpler. [We've created a reference implementation for such an integration for Ruby on Rails](https://github.com/hotwired/turbo-rails).
