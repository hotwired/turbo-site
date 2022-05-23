---
permalink: /handbook/installing.html
description: "Learn how to install Turbo in your application."
---

# Installing Turbo in Your Application

Turbo can either be installed in compiled form by referencing the Turbo distributable script directly in the `<head>` of your application or through npm via a bundler like Webpack.

## In Compiled Form

You can download the latest distributable script from the GitHub releases page, then reference that in your `<script>` tag on your page. Or you can float on the latest release of Turbo using a CDN bundler like Skypack. See <a href="https://cdn.skypack.dev/@hotwired/turbo">https://cdn.skypack.dev/@hotwired/turbo</a> for more details.

## As An npm Package

You can install Turbo from npm via the `npm` or `yarn` packaging tools. Then require or import that in your code:

```javascript
import * as Turbo from "@hotwired/turbo"
```

## In a Ruby on Rails application

The Turbo JavaScript framework is included with [the turbo-rails gem](https://github.com/hotwired/turbo-rails) for direct use with the asset pipeline and [importmap-rails](https://github.com/rails/importmap-rails).
