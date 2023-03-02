---
permalink: /handbook/installing.html
description: "Learn how to install Turbo in your application."
---

# Installing Turbo in Your Application

Turbo can either be installed in compiled form by referencing the Turbo distributable script directly in the `<head>` of your application or through npm via a bundler like Webpack.

## In a Ruby on Rails application

Turbo is included by default in new Rails apps, when using Rails 7 or newer. You can also add it to an app using the [the turbo-rails gem](https://github.com/hotwired/turbo-rails).

## In Compiled Form

You can download the latest distributable script from the [GitHub releases page](https://github.com/hotwired/turbo/releases), then reference that in your `<script>` tag on your page. Or you can float on the latest release of Turbo using a CDN bundler like Skypack. See <a href="https://cdn.skypack.dev/@hotwired/turbo">https://cdn.skypack.dev/@hotwired/turbo</a> for more details.

## As An npm Package

You can install Turbo from npm via the `npm` or `yarn` packaging tools. Then require or import that in your code:

```javascript
import * as Turbo from "@hotwired/turbo"
```
