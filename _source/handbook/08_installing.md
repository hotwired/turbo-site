---
permalink: /handbook/installing.html
description: "Learn how to install Turbo in your application."
---

# Installing Turbo in Your Application

Turbo can either be referenced in compiled form via the Turbo distributable script directly in the `<head>` of your application or through npm via a bundler like esbuild.

## In Compiled Form

You can float on the latest release of Turbo using a CDN bundler like jsDelivr. Just include a `<script>` tag in the `<head>` of your application:

```html
<head>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@hotwired/turbo@latest/dist/turbo.es2017-esm.min.js"></script>
</head>
```

Or <a href="https://unpkg.com/browse/@hotwired/turbo@latest/dist/">download the compiled packages from unpkg</a>.

## As An npm Package

You can install Turbo from npm via the `npm` or `yarn` packaging tools. 

If you using any Turbo functions such as `Turbo.visit()` import the `Turbo` functions into your code:

```javascript
import * as Turbo from "@hotwired/turbo"
```

If you're *not* using any Turbo functions such as `Turbo.visit()` import the library. This avoids issues with tree-shaking and unused variables in some bundlers. See [Import a module for its side effects only](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/import#import_a_module_for_its_side_effects_only) on MDN.

```javascript
import "@hotwired/turbo";
```

## In a Ruby on Rails application

The Turbo JavaScript framework is included with [the turbo-rails gem](https://github.com/hotwired/turbo-rails) for direct use with the asset pipeline.
