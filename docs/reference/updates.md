---
permalink: /reference/updates
order: 03
---

# Updates

## Append

Appends the content within the template tag to the container designated by the dom id following the # in the `data-turbo-update` attribute.

```html
<template data-turbo-update="append#dom_id">
  Content to append to container designated with the dom_id.
</template>
```

## Prepend

Prepends the content within the template tag to the container designated by the dom id following the # in the `data-turbo-update` attribute.

```html
<template data-turbo-update="prepend#dom_id">
  Content to prepend to container designated with the dom_id.
</template>
```

## Replace

Replaces the element designated by the dom id following the # in the `data-turbo-update` attribute with the content within the template tag.

```html
<template data-turbo-update="replace#dom_id">
  Content to replace the element designated with the dom_id.
</template>
```

## Remove

Removes the element designated by the dom id following the # in the `data-turbo-update` attribute.

```html
<template data-turbo-update="remove#dom_id">
</template>
```
