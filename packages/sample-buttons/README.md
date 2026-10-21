# Sample Button

DaisyUI-like button utilities for Tailwind CSS v4, written as `@utility` classes. Combine a base class with color, style, size and shape modifiers:

```html
<button type="button" class="btn btn-primary btn-outline btn-lg">Save</button>
```

## Usage

The utilities must be compiled by the consuming project's Tailwind build (a prebuilt CSS file would only contain the classes used in this demo). Import the sources after Tailwind:

```css
@import 'tailwindcss';
@import '@components/sample-buttons/theme.css';
@import '@components/sample-buttons/button.css';
```

`theme.css` registers the semantic colors (`primary`, `secondary`, …) via `@theme`, so `bg-primary`, `text-error` etc. work as regular utilities too. Skip it if your project already defines these colors.

## Classes

| Group  | Classes                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------ |
| Base   | `btn`                                                                                                              |
| Colors | `btn-neutral`, `btn-primary`, `btn-secondary`, `btn-accent`, `btn-info`, `btn-success`, `btn-warning`, `btn-error` |
| Styles | `btn-outline`, `btn-dash`, `btn-soft`, `btn-ghost`, `btn-link`                                                     |
| Sizes  | `btn-xs`, `btn-sm`, `btn-md`, `btn-lg`, `btn-xl`                                                                   |
| Shapes | `btn-wide`, `btn-block`, `btn-square`, `btn-circle`                                                                |
| States | `btn-active` / `aria-pressed="true"`, `btn-disabled` / `disabled` / `aria-disabled="true"`                         |

Only `btn` sets CSS properties. All modifiers only set custom properties that `btn` reads, so modifiers never conflict with each other and their order in the class list does not matter. Regular Tailwind utilities (e.g. `rounded-none`, `w-40`) are emitted after `btn` and override it.

## Tokens

Defaults live on `:where(:root)` (zero specificity). Override them globally or per element.

| Token                | Default                         | Description                                                                                   |
| -------------------- | ------------------------------- | --------------------------------------------------------------------------------------------- |
| `--btn-height`       | `2.5rem`                        | Height at `btn-md`                                                                            |
| `--btn-padding-x`    | `1rem`                          | Horizontal padding at `btn-md`                                                                |
| `--btn-radius`       | `0.5rem`                        | Border radius                                                                                 |
| `--btn-border-width` | `1px`                           | Border width                                                                                  |
| `--btn-font-size`    | `0.875rem`                      | Font size at `btn-md`                                                                         |
| `--btn-gap`          | `0.5rem`                        | Gap between icon and label                                                                    |
| `--btn-icon-size`    | `1.2em`                         | Size of direct `<svg>` children (scales with the font size; `size-*` on the svg overrides it) |
| `--btn-shadow`       | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Shadow of solid buttons                                                                       |
| `--btn-color`        | `--color-base-200`              | Fill color (solid style)                                                                      |
| `--btn-content`      | `--color-base-content`          | Text color on the fill                                                                        |
| `--btn-tint`         | `--color-base-content`          | Color for outline, dash, soft, ghost and link                                                 |
| `--btn-tint-content` | `--color-base-100`              | Text color on `--btn-tint` (hover fill)                                                       |

Size modifiers scale height, padding and font size relative to these tokens (`btn-xs` 0.6× … `btn-xl` 1.4×), so a changed `--btn-height` applies to every size.

```css
/* Global */
:root {
    --btn-radius: 9999px;
    --btn-border-width: 2px;
}
```

```html
<!-- Per element -->
<button type="button" class="btn btn-primary [--btn-height:3.5rem] [--btn-padding-x:2rem]">Tall</button>
<button type="button" class="btn btn-primary" style="--btn-radius: 0">Square corners</button>

<!-- Custom color without a modifier -->
<button type="button" class="btn [--btn-color:#7c3aed] [--btn-content:white]">Custom</button>
```

Note: `btn-circle` sets `--btn-radius` itself, so a radius override on the same element is not reliable there.

## Development

```bash
pnpm -F @components/sample-buttons dev
pnpm -F @components/sample-buttons build
```
