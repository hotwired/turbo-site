---
permalink: /handbook/installing
---

# Installing Turbo in Your Application

Turbo can either be installed in compiled form by simply reference the Turbo distribution library directly in the `<head>` of your application or through npm via a bundler like Webpack.

## In compiled form

You can download the latest distribution library from the GitHub releases page, then reference that in your `<script>` tag on your page. Or you can float on the latest release of Turbo using a CDN bundler like Skypack, see <a href="https://cdn.skypack.dev/@hotwired/turbo">https://cdn.skypack.dev/@hotwired/turbo</a>.

## As a npm package

You can install Turbo from npm via the `npm` or `yarn` packaging tools. Then require or import that in your code and manually start the Turbo process:

```javascript
import Turbo from "hotwired/turbo"
Turbo.start()
```
