---
name: create-component
description: Scaffold a new standalone Windvault UI component under packages/ with Vite, Tailwind CSS v4, and a @components/ pnpm workspace. Use whenever the user asks to create or add a new component, add a new package in packages/, create a workspace package, or mentions scaffolding a hero-banner, card, widget, or any new UI component in this monorepo.
---

# Create Windvault Component

Scaffolds a new component workspace inside `packages/<kebab-name>/` and links it via `pnpm install`. This skill only creates the placeholder boilerplate — do not design or implement full component UI unless the user explicitly asks for that in a separate step.

## Naming Variants

Derive three naming forms from the requested component name:

- `<kebab-name>`: lowercase kebab-case matching `^[a-z0-9]+(-[a-z0-9]+)*$` (e.g., `Hero Banner` or `heroBanner` → `hero-banner`)
- `<PascalName>`: PascalCase for the init function (e.g., `HeroBanner`)
- `<Title Name>`: Title Case for the HTML `<title>` and `<h1>` (e.g., `Hero Banner`)

## Workflow

1. **Normalize and validate the name.** Convert input to `<kebab-name>`. If `packages/<kebab-name>/` already exists, stop and inform the user instead of overwriting files.
2. **Write the 5 boilerplate files** using the exact templates below (create files with file tools, not shell `mkdir` or redirection):
    - `packages/<kebab-name>/package.json`
    - `packages/<kebab-name>/vite.config.js`
    - `packages/<kebab-name>/src/style.css`
    - `packages/<kebab-name>/src/index.js`
    - `packages/<kebab-name>/index.html`
3. **Register the workspace.** Run `pnpm install` once from the repository root (`/home/develop/www/windvault`) so pnpm links `@components/<kebab-name>`.
4. **Never run `pnpm dev`, `pnpm build`, `npm run dev`, or `npm run build`.** The user manages dev servers and builds independently.
5. **Report back in German** with:
    - Created directory (`packages/<kebab-name>/`)
    - Workspace package name (`@components/<kebab-name>`)
    - Command for the user to start the dev server themselves: `pnpm --filter @components/<kebab-name> dev`

## File Templates

### 1. `packages/<kebab-name>/package.json`

```json
{
    "name": "@components/<kebab-name>",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build"
    }
}
```

### 2. `packages/<kebab-name>/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    base: './',
    plugins: [tailwindcss()],
    build: {
        emptyOutDir: true,
        rollupOptions: {
            input: 'index.html',
        },
    },
});
```

### 3. `packages/<kebab-name>/src/style.css`

```css
@import 'tailwindcss';
```

### 4. `packages/<kebab-name>/src/index.js`

Always include an English JSDoc block on the initialization function:

```javascript
import './style.css';

/**
 * Initializes the <Title Name lowercase> component
 * @returns {void}
 */
function init<PascalName>() {
    console.log('<Title Name> initialized');
}

init<PascalName>();
```

### 5. `packages/<kebab-name>/index.html`

Keep the placeholder markup minimal (`lang="de"` as used across the repository):

```html
<!DOCTYPE html>
<html lang="de">
    <head>
        <meta charset="UTF-8" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        />
        <title><Title Name></title>
    </head>
    <body class="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <section class="max-w-4xl mx-auto text-center">
            <h1 class="text-4xl font-bold text-gray-900"><Title Name></h1>
        </section>

        <script
            type="module"
            src="./src/index.js"
        ></script>
    </body>
</html>
```
