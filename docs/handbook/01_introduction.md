---
permalink: /handbook/introduction
redirect_from: /handbook/
---

# Introduction

Turbo bundles several techniques for creating fast, modern web applications, without having to reach for a client-side JavaScript framework, confine your server-side to being an API, and use JSON to talk between the two.

With Turbo, you can let the server deliver HTML directly, which means letting all the logic for checking permissions, interacting directly with your domain model, and everything else that goes into programming an application, happen more or less exclusively within your favorite programming language. You're no longer mirroring logic on both sides of a JSON divide. All the logic lives on the server, and the browser deals just with the final HTML.

You can read more about the benefits of this HTML-over-the-wire approach on the <a href="https://hotwire.dev/">Hotwire site</a>, so on to the actual techniques that Turbo brings to make this possible.

## Turbo Drive: Navigate within a persistent process

A key attraction with traditional single-page applications, when compared old-school separate pages, is the speed of the navigation. SPAs get a lot of that speed from not constantly tearing down the application process, only to reinitialize it on the very next page. 

Turbo Drive gives you that same speed by using the same persistent-process model, but without requiring you to craft your entire application around the paradigm. There's no client-side router to maintain, there's no state to carefully manage. The persistent process is managed by Turbo, and you write your server-side code as though you were living back in the early aughts – blissfully isolated from the complexities of today's SPA monstrosities!

This happens by intercepting all clicks on `<a href>` links to the same domain. When you click an eligible link, Turbo Drive prevents the browser from following it. Instead, Turbo Drive changes the browser’s URL using the <a href="https://developer.mozilla.org/en-US/docs/Web/API/History">History API</a>, requests the new page using <a href="https://developer.mozilla.org/en-US/docs/Web/API/fetch">`fetch`</a>, and then renders the HTML response.

Same deal with forms. Their submissions are turned into `fetch` requests from which Turbo Drive will follow the redirect and render the HTML response.

During rendering, Turbo Drive replaces the current `<body>` element outright and merges the contents of the `<head>` element. The JavaScript window and document objects, and the HTML <html> element, persist from one rendering to the next.

While its possible to interact directly with Turbo Drive to control how visits happen or hook into the lifecycle of the request, the majority of the time this is a drop-in replacement where the speed is free.


## Turbo Frames: Decompose complex pages

Most web applications present pages that contain several independent segments. For a discussion page, you might have a navigation bar on the top, a list of messages in the center, a form at the bottom to add a new message, and a sidebar with related topics. Generating this discussion page normally means generating each segment in a serialized manner, then piecing them all together, then delivering the result as a single HTML response to the browser.

With Turbo Frames, you can take those independent segments and turn them into frames that can scope their navigation and be lazy loaded. When you scope the navigation of a frame, you force all future interaction within a frame (such as clicking links or submitting forms) to stay within that frame, keeping the rest of the page from changing or reloading.

To wrap a segment in its own context, you enclose it in a `<turbo-frame>` tag:

```html
<turbo-frame id="new_message">
  <form action="/messages/new">
    ...
  </form>
</turbo-frame>
```

When that form is submitted, the response will have the matching `<turbo-frame id="new_message">` tag extracted, and its content inserted into place. The rest of the page stays as it were. If you want to lazy-load the content, rather than just scope the navigation, you add a `src` attribute, which is automatically loaded, the same match finding is done on the id, and the result inserted:

```html
<turbo-frame id="messages" src="/messages">
  <p>This message will be replaced by the response from /messages.</p>
</turbo-frame>
```

This sounds a lot like old-school frames or even iframes, but Turbo Frames are part of the same DOM, so there's none of the weirdness or compromises associated with "real" frames. The Turbo Frames are styled by the same CSS, part of the same persistent process of JavaScript, and not under any additional content security restrictions.

In addition to turning your segments into independent contexts, Turbo Frames affords you:

1. **Efficient caching**: In the discussion page example above, the related topics sidebar needs to expire whenever a new related topic appears, but the list of messages in the center does not. When everything is just one page, the whole cache expires as soon as any of the individual segments do. With frames, each segment is cached independently, so you get longer-lived caches with fewer dependent keys.
1. **Parallelized execution**: Each lazy-loaded frame is generated by its own HTTP request/response, which means it can be handled by a separate process. This allows for parallelized execution without having to manually manage the process. A complicated composite page that takes 400ms to complete end-to-end can be broken up with frames where the initial request might only take 50ms, and each of three lazy-loaded frames each take 50ms. Now the whole page is done in 100ms because the three frames each taking 50ms run concurrently rather than sequentially.
1. **Ready for mobile**: In mobile apps, you usually can't have big, complicated composite pages. Each segment needs a dedicated screen. With an application built using Turbo Frames, you've already done this work of turning the composite page into segments. These segments can then appear in native sheets and screens without alteration (since they all have independent URLs).


## Turbo Updates: Make live page changes

Making partial page updates in response to asynchronous actions is how we make the application feel alive. While Turbo Frames gives us such updates in response to direct interactions within a single frame, Turbo Updates let us change any part of the page in response to updates sent over WebSocket (or in response to a form submission). Think an <a href="http://itsnotatypo.com">imbox</a> that automatically updates when a new email arrives. 

Turbo Updates take the shape of four different commands: `append`, `prepend`, `replace`, and `remove`. With these four simple commands, you can do all the mutations needed to change the page. You can even combine several commands in a single update. You simply wrap the HTML you're interested in inserting or replacing in the command <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template">template tag</a> and Turbo does the rest:

```html
<template data-turbo-update="append#messages">
  <div id="message_1">My new message!</div>
</template>
```

That update will take the `div` with the new message and append it to the container with the id `messages`. It's just as simple to update an existing element:

```html
<template data-turbo-update="replace#message_1">
  <div id="message_1">This changes the existing message!</div>
</template>
```

This is a conceptual continuation of what in the Rails world was first called <a href="https://weblog.rubyonrails.org/2006/3/28/rails-1-1-rjs-active-record-respond_to-integration-tests-and-500-other-things/">RJS</a> and then called <a href="https://signalvnoise.com/posts/3697-server-generated-javascript-responses">SJR</a>, but realized without any need for JavaScript. The benefits remain the same:

1. **Reuse the server-side templates**: Live page updates are generated using the same server-side templates that were used to create the first-load page.
1. **HTML over the wire**: Since all we're sending is HTML, you don't need any client-side JavaScript (beyond Turbo, of course) to process the update. Yes, the HTML payload might be a tad larger than a comparable JSON, but with gzip, the difference is usually negligible, and you save all the client-side computation it takes to turn JSON into HTML.
1. **Simpler control flow**: It's really clear to follow what happens when messages arrive on the WebSocket or in response to form submissions. There's no routing, event bubbling, or other indirection required. It's just the HTML to be changed, wrapped in a single tag that tells us how.

Now, unlike RJS and SJR, it's not possible to call custom JavaScript functions as part of a Turbo Update. But this is a feature, not a bug. Those techniques easily end up producing a tangled mess because way too much JavaScript was sent along with the response. Turbo focuses squarely on just updating the dom, and then assumes you'll tie any additional behavior onto that using <a href="https://stimulusjs.org">Stimulus</a>.


## Turbo Native: Hybrid apps for iOS & Android

Turbo Native is ideal for building hybrid apps for iOS and Android. You can let your existing server-side rendered HTML power all the screens that don't need that last bit of high fidelity. Then do spend all the time you saved on making the few screens that really benefit from native controls even better.

An application like Basecamp has hundreds of screens. Rewriting every single one of those screens would be an enormous task with very little benefit. Better to reserve the native firepower to high-traffic interactions that really demand the highest fidelity UI. That would be something like the New For You inbox in Basecamp, where we use swipe controls that need to feel just right. But a page like the one showing a single message would be no better if it was all native.

Going hybrid doesn't just speed up your development process, it also gives you more freedom to upgrade your app without going through the slow and onerous app store release processes. Anything that's done in HTML can be changed in your web application, and instantly be available to all users. No waiting for Big Tech to approve your changes, no waiting for users to upgrade.

Turbo Native assumes you're using the recommended development practices available for iOS and Android. This is not a framework that abstracts native APIs away or even tries to let your native code be shareable between platforms. The part that's shareable is the HTML that's rendered server side. But the native controls are written in the recommended native APIs.

See the <a href="https://github.com/hotwired/turbo-ios">Turbo Native: iOS</a> and <a href="https://github.com/hotwired/turbo-android">Turbo Native: Android</a> repositories for more documentation. See the native apps for HEY on <a href="https://apps.apple.com/us/app/hey-email/id1506603805">iOS</a> and <a href="https://play.google.com/store/apps/details?id=com.basecamp.hey&hl=en_US&gl=US">Android</a> to get a feel for just how good you can make a hybrid app powered by Turbo.