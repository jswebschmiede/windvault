# apple-style-slider

A card slider in the style of the "Discover" sections on apple.com. It uses native CSS scroll-snap: slides line up with the edges of a centered content container, and the neighbouring slides run into the page margins.

- Vanilla JS class with a Swiper-like API (`new AppleStyleSlider(el, options)`)
- Styled with Tailwind CSS v4, using BEM class names
- Visual and layout settings are CSS custom properties; behaviour and elements are JS options
- Optional navigation and pagination (bullets or fraction), using your own elements or generated ones
- Mouse drag, touch scrolling, keyboard support, ResizeObserver, `destroy()`

## Installation

The package is part of the monorepo workspace:

```json
{
    "dependencies": {
        "@components/apple-style-slider": "workspace:*"
    }
}
```

Build the library output into `dist/`:

```bash
pnpm --filter @components/apple-style-slider build
```

| File                              | Format                                              |
| --------------------------------- | --------------------------------------------------- |
| `dist/apple-style-slider.js`      | ES module                                           |
| `dist/apple-style-slider.umd.cjs` | UMD (global: `AppleStyleSlider`)                    |
| `dist/apple-style-slider.css`     | Component CSS (no Tailwind preflight, no utilities) |

## Usage

### 1. Import JS and CSS

The JS bundle does not include the CSS, so import the stylesheet separately.

```js
import AppleStyleSlider from '@components/apple-style-slider';
import '@components/apple-style-slider/style.css';
```

If your project already runs Tailwind v4, you can import the source stylesheet instead. It only uses `@reference "tailwindcss"` and adds no utilities of its own:

```css
@import 'tailwindcss';
@import '../path/to/packages/apple-style-slider/src/apple-style-slider.css';
```

> Use a relative path here. The `exports` field of `package.json` only exposes `.` and `./style.css`, so `@components/apple-style-slider/src/...` may not resolve. `src/` is also not part of the published `files` list.

### 2. Markup

The viewport and the track are required. A `ul` / `li` list is recommended.

```html
<div id="discover-content" class="mx-auto flex w-[min(1000px,87.5%)] items-center justify-between">
    <h2>Discover.</h2>
    <div class="flex gap-2">
        <button id="discover-prev" type="button" aria-label="Previous">…</button>
        <button id="discover-next" type="button" aria-label="Next">…</button>
    </div>
</div>

<div id="discover-slider" class="apple-style-slider">
    <div class="apple-style-slider__viewport" tabindex="0" aria-label="Cards">
        <ul class="apple-style-slider__track">
            <li class="apple-style-slider__slide">…</li>
            <li class="apple-style-slider__slide">…</li>
            <li class="apple-style-slider__slide">…</li>
        </ul>
    </div>
</div>
```

The slider root always takes the full viewport width (`w-screen`), even when it sits inside a centered container. To avoid horizontal scrolling of the page, set `overflow-x: clip` on `html` and `body`:

```html
<html class="overflow-x-clip">
    <body class="overflow-x-clip"></body>
</html>
```

Style the slide content with Tailwind directly in the HTML. Each slide is a size container (`@container`), so `cqi` units and `@`-variants are relative to the slide.

### 3. Initialise

```js
const slider = new AppleStyleSlider('#discover-slider', {
    alignEl: '#discover-content',
    navigation: { prevEl: '#discover-prev', nextEl: '#discover-next' },
    pagination: true,
});
```

UMD in the browser:

```html
<link rel="stylesheet" href="dist/apple-style-slider.css" />
<script src="dist/apple-style-slider.umd.cjs"></script>
<script>
    new AppleStyleSlider('#discover-slider');
</script>
```

## Options

| Option          | Type                               | Default                         | Description                                                                                                                                                  |
| --------------- | ---------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `alignEl`       | `string \| HTMLElement \| null`    | `null`                          | Element whose inner edges (minus its padding) the first and last slide line up with. Without it, the slider centers on `--apple-style-slider-content-width`. |
| `navigation`    | `boolean \| object`                | `true`                          | Prev/next buttons. `false` disables them. See [navigation](#navigation).                                                                                     |
| `pagination`    | `boolean \| object`                | `true`                          | Bullets or fraction. `false` disables it. See [pagination](#pagination).                                                                                     |
| `slideLabel`    | `(index, total) => string \| null` | `` `${index + 1} / ${total}` `` | `aria-label` of each slide. `null` disables it.                                                                                                              |
| `drag`          | `boolean`                          | `true`                          | Drag with the mouse. Touch input always scrolls natively.                                                                                                    |
| `dragThreshold` | `number`                           | `50`                            | Minimum drag distance in px that moves to the next or previous position, even if the drag ends closer to the start.                                          |
| `keyboard`      | `boolean`                          | `true`                          | `ArrowLeft` / `ArrowRight` while the viewport has focus.                                                                                                     |
| `on`            | `object`                           | `{}`                            | Callbacks: `init`, `slideChange`, `resize`. See [Events](#events).                                                                                           |

### navigation

| Key         | Type                            | Default           | Description                                                                                  |
| ----------- | ------------------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| `prevEl`    | `string \| HTMLElement \| null` | `null`            | Your own "previous" button.                                                                  |
| `nextEl`    | `string \| HTMLElement \| null` | `null`            | Your own "next" button.                                                                      |
| `container` | `string \| HTMLElement \| null` | `null`            | Where the generated buttons are appended. Without it, they are inserted before the viewport. |
| `prevLabel` | `string`                        | `'Zurück'`        | `aria-label` of the generated "previous" button.                                             |
| `nextLabel` | `string`                        | `'Weiter'`        | `aria-label` of the generated "next" button.                                                 |
| `prevIcon`  | `string` (HTML)                 | Arrow SVG (left)  | Inner HTML of the generated "previous" button.                                               |
| `nextIcon`  | `string` (HTML)                 | Arrow SVG (right) | Inner HTML of the generated "next" button.                                                   |

If `prevEl` or `nextEl` is missing, the slider creates both missing buttons in a `.apple-style-slider__nav` wrapper. Buttons you pass in keep their own markup and get the BEM classes on top. At the start and end of the slider the buttons get the `disabled` attribute.

`prevIcon` / `nextIcon` are written with `innerHTML`, so pass only trusted markup, never user input.

### pagination

| Key                 | Type                            | Default                    | Description                                                                                                                           |
| ------------------- | ------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `el`                | `string \| HTMLElement \| null` | `null`                     | Your own container. Without it, the slider appends one (`ul` for bullets, `div` for fraction).                                        |
| `type`              | `'bullets' \| 'fraction'`       | `'bullets'`                | Clickable bullets, or a text counter like `4 / 9`.                                                                                    |
| `variant`           | `'expand' \| 'dot'`             | `'expand'`                 | Bullets only. `expand`: the active bullet grows into a pill. `dot`: plain dots; the active one only changes color, opacity and scale. |
| `bulletLabel`       | `(index) => string`             | `` `Slide ${index + 1}` `` | `aria-label` of each bullet.                                                                                                          |
| `fractionSeparator` | `string`                        | `' / '`                    | Fraction only. Text between the current and the total number.                                                                         |

If `el` is a `ul` or `ol`, each bullet is wrapped in an `li`. The pagination is hidden (`hidden`) when there are fewer than two positions or slides.

**Bullets vs. fraction:** bullets stand for snap positions, while the fraction counts slides. At the end of the slider several slides can be visible at once, so their snap positions merge into one. The fraction then jumps from e.g. `4 / 7` straight to `7 / 7`.

### Examples

```js
// Generated buttons and bullets
new AppleStyleSlider('.apple-style-slider');

// No navigation, plain dots
new AppleStyleSlider('#slider', {
    navigation: false,
    pagination: { variant: 'dot' },
});

// Fraction in your own header element
new AppleStyleSlider('#more-slider', {
    alignEl: '#more-content',
    navigation: { prevEl: '#more-prev', nextEl: '#more-next' },
    pagination: { el: '#more-fraction', type: 'fraction' },
});

// Generated buttons inside a custom container, English labels
new AppleStyleSlider('#slider', {
    navigation: { container: '#slider-controls', prevLabel: 'Previous', nextLabel: 'Next' },
    pagination: { bulletLabel: (i) => `Go to slide ${i + 1}` },
    slideLabel: (i, total) => `Slide ${i + 1} of ${total}`,
});
```

## API

### Properties

| Property           | Type                       | Description                                                  |
| ------------------ | -------------------------- | ------------------------------------------------------------ |
| `el`               | `HTMLElement`              | Root element                                                 |
| `viewport`         | `HTMLElement`              | `.apple-style-slider__viewport`                              |
| `track`            | `HTMLElement`              | `.apple-style-slider__track`                                 |
| `slides`           | `HTMLElement[]`            | All `.apple-style-slider__slide` elements (read-only getter) |
| `activeIndex`      | `number`                   | Index of the current snap position (read-only getter)        |
| `activeSlideIndex` | `number`                   | Index of the active slide (read-only getter)                 |
| `prevEl`, `nextEl` | `HTMLElement \| undefined` | Navigation buttons                                           |
| `paginationEl`     | `HTMLElement \| undefined` | Pagination container                                         |
| `options`          | `object`                   | Merged options                                               |

### Methods

| Method                          | Description                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `slideTo(index, smooth = true)` | Scrolls to a snap position. The index is clamped to the valid range.                                   |
| `slideNext()`                   | Next snap position                                                                                     |
| `slidePrev()`                   | Previous snap position                                                                                 |
| `update()`                      | Recalculates the layout, e.g. after changing CSS custom properties or adding or removing slides.       |
| `destroy()`                     | Removes listeners, observers, generated elements, added classes, ARIA attributes and inline variables. |

Resizing the viewport or `alignEl` triggers a recalculation automatically, and so does loading web fonts (`document.fonts.ready`).

## Events

Callbacks passed in `on` and DOM events on the root element receive the same payload.

| Name          | DOM event                        | Payload (`detail`)                             |
| ------------- | -------------------------------- | ---------------------------------------------- |
| `init`        | `apple-style-slider:init`        | `{ slider, index }`                            |
| `slideChange` | `apple-style-slider:slideChange` | `{ slider, index, previousIndex, slideIndex }` |
| `resize`      | `apple-style-slider:resize`      | `{ slider, index }`                            |

`index` is the snap position index and `slideIndex` the index of the active slide.

The `init` callback runs inside the constructor, so it fires before `new` returns. A DOM listener added after `new` misses the `init` event; register it on the root element first.

```js
const slider = new AppleStyleSlider('#slider', {
    on: {
        slideChange: ({ index, slideIndex }) => console.log(index, slideIndex),
    },
});

slider.el.addEventListener('apple-style-slider:resize', (e) => console.log(e.detail.index));
```

## CSS custom properties

The defaults are set on `:where(:root)` inside `@layer base`, which gives them zero specificity. You can override them on `:root`, on the slider root, on a pagination element, or with Tailwind arbitrary properties:

```html
<div class="apple-style-slider [--apple-style-slider-gap:16px] [--apple-style-slider-slide-max:360px]"></div>
```

```css
#more-slider {
    --apple-style-slider-slide-h-max: 320px;
}
```

Changes to colors, bullets and fraction show up immediately. After changing a variable that affects layout (width, gap, offsets), call `slider.update()`.

All variables use the prefix `--apple-style-slider-`; the tables below leave it out.

### Layout

| Variable        | Default                    | Description                                        |
| --------------- | -------------------------- | -------------------------------------------------- |
| `content-width` | `min(1000px, 87.5vw)`      | Width of the content area when no `alignEl` is set |
| `gap`           | `24px` (`12px` at ≤ 734px) | Space between slides                               |

### Slide size

The slide width is `min(clamp(slide-min, slide-fluid, slide-max), <content width>)`, and the height is `clamp(slide-h-min, <slide width>, slide-h-max)`.

| Variable      | Default | Description     |
| ------------- | ------- | --------------- |
| `slide-min`   | `280px` | Minimum width   |
| `slide-fluid` | `25vw`  | Preferred width |
| `slide-max`   | `640px` | Maximum width   |
| `slide-h-min` | `300px` | Minimum height  |
| `slide-h-max` | `460px` | Maximum height  |

### Slide appearance

Even-numbered slides use the `alt` colors.

| Variable        | Default (light / dark)                   |
| --------------- | ---------------------------------------- |
| `slide-radius`  | `28px`                                   |
| `slide-padding` | `clamp(14px, 8cqi, 40px)`                |
| `slide-bg`      | `#ffffff` / `#1c1c1e`                    |
| `slide-fg`      | `#1d1d1f` / `#f5f5f7`                    |
| `slide-alt-bg`  | `#1d1d1f` / `#f5f5f7`                    |
| `slide-alt-fg`  | `#f5f5f7` / `#1d1d1f`                    |
| `slide-shadow`  | `0 4px 20px rgb(0 0 0 / 0.05)` / `… 0.4` |

### Navigation buttons

| Variable                  | Default (light / dark) |
| ------------------------- | ---------------------- |
| `button-size`             | `40px`                 |
| `button-icon-size`        | `24px`                 |
| `button-gap`              | `8px`                  |
| `button-bg`               | `#e8e8ed` / `#2c2c2e`  |
| `button-hover-bg`         | `#dcdce1` / `#3a3a3c`  |
| `button-fg`               | `#1d1d1f` / `#f5f5f7`  |
| `button-disabled-opacity` | `0.35`                 |

These styles apply to every element with `.apple-style-slider__button`, including buttons you pass in. Override them with your own classes or utilities if needed.

### Pagination: bullets

| Variable                | Default (light / dark) | Description                                           |
| ----------------------- | ---------------------- | ----------------------------------------------------- |
| `bullet-size`           | `8px`                  | Width and height of an inactive bullet                |
| `bullet-gap`            | `10px`                 | Space between bullets                                 |
| `bullet-radius`         | `999px`                | Corner radius                                         |
| `bullet-color`          | `#6e6e73` / `#a1a1a6`  | Inactive color                                        |
| `bullet-active-color`   | `#1d1d1f` / `#f5f5f7`  | Active color                                          |
| `bullet-opacity`        | `0.4`                  | Inactive opacity                                      |
| `bullet-active-opacity` | `1`                    | Active opacity                                        |
| `bullet-active-width`   | `28px`                 | Width of the active bullet (variant `expand`)         |
| `bullet-active-scale`   | `1.25`                 | Scale of the active bullet (variant `dot`)            |
| `bullet-duration`       | `0.3s`                 | Transition duration                                   |
| `pagination-margin`     | `4px 0 24px`           | Outer margin of the pagination (bullets and fraction) |

### Pagination: fraction

| Variable                 | Default        | Description                            |
| ------------------------ | -------------- | -------------------------------------- |
| `fraction-color`         | `currentColor` | Text color                             |
| `fraction-font-size`     | `0.875rem`     | Font size                              |
| `fraction-total-opacity` | `0.6`          | Opacity of the separator and the total |

### Other

| Variable | Default (light / dark) | Description         |
| -------- | ---------------------- | ------------------- |
| `accent` | `#0071e3` / `#2997ff`  | Focus outline color |

### Set by JS (do not set manually)

When you use `alignEl`, JS sets `offset-start`, `offset-end` and `inner` on the root element. `destroy()` removes them.

### Dark mode

The dark values apply with `prefers-color-scheme: dark`, unless `<html data-theme="light">` is set. `<html data-theme="dark">` forces them.

## BEM classes

| Class                                                     | Element / state                                                                           |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `.apple-style-slider`                                     | Root                                                                                      |
| `.apple-style-slider--dragging`                           | While dragging with the mouse (snap is turned off)                                        |
| `.apple-style-slider__viewport`                           | Scroll container (required)                                                               |
| `.apple-style-slider__track`                              | Flex row of slides (required)                                                             |
| `.apple-style-slider__slide`                              | Slide                                                                                     |
| `.apple-style-slider__slide--active`                      | Active slide. This class has no styles of its own; use it as a hook for your own styling. |
| `.apple-style-slider__nav`                                | Wrapper of the generated buttons                                                          |
| `.apple-style-slider__button`                             | Navigation button                                                                         |
| `.apple-style-slider__button--prev` / `--next`            | Direction                                                                                 |
| `.apple-style-slider__pagination`                         | Pagination container                                                                      |
| `.apple-style-slider__pagination--bullets` / `--fraction` | Type                                                                                      |
| `.apple-style-slider__pagination--expand` / `--dot`       | Bullet variant                                                                            |
| `.apple-style-slider__bullet`                             | Bullet button                                                                             |
| `.apple-style-slider__bullet--active`                     | Active bullet (also gets `aria-current="true"`)                                           |
| `.apple-style-slider__fraction-current`                   | Current number                                                                            |
| `.apple-style-slider__fraction-separator`                 | Separator                                                                                 |
| `.apple-style-slider__fraction-total`                     | Total                                                                                     |

Example of styling the active slide with Tailwind:

```html
<li class="apple-style-slider__slide opacity-60 transition-opacity [&.apple-style-slider__slide--active]:opacity-100">
    …
</li>
```

## Accessibility

- Give the viewport `tabindex="0"` and an `aria-label` so that it can be focused and navigated with the arrow keys.
- Each slide gets `aria-label="n / total"` (option `slideLabel`). An `li` keeps its native list item role. Other elements get `role="group"` and `aria-roledescription="slide"`, unless they already have a `role`.
- Bullets are `button` elements with `aria-label` and `aria-current`.
- With `prefers-reduced-motion: reduce`, the viewport's CSS `scroll-behavior` is set to `auto`. `slideTo()` still requests `behavior: 'smooth'` unless you pass `smooth = false`, so buttons, bullets and arrow keys still scroll smoothly.

## Development

```bash
pnpm --filter @components/apple-style-slider dev     # demo (index.html)
pnpm --filter @components/apple-style-slider build   # library build to dist/
```

| File                                         | Purpose                                   |
| -------------------------------------------- | ----------------------------------------- |
| `src/apple-style-slider.js`                  | Class                                     |
| `src/apple-style-slider.css`                 | Component CSS (Tailwind v4, `@reference`) |
| `src/index.js`                               | Library entry (JS + CSS)                  |
| `src/demo.js`, `src/style.css`, `index.html` | Demo page                                 |
| `Entdecken-Slider.html`                      | Original reference implementation         |
