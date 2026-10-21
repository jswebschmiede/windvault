# Windvault Components Monorepo

A lightweight monorepo setup powered by **pnpm Workspaces**, **Vite**, and **Tailwind CSS v4** for developing standalone UI components using plain HTML, CSS, and JavaScript.

Each component inside `packages/` acts as an isolated mini-project while sharing centralized tooling dependencies from the root workspace. When built, each component exports clean, self-contained static artifacts (`index.html`, CSS, and JS bundles) into its own `dist/` directory.

---

## Project Structure

```text
windvault/
├── package.json                 # Root scripts & shared devDependencies
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── node_modules/                # Centralized dependencies (Vite, Tailwind CSS v4)
└── packages/
    ├── sample-buttons/          # Demo component: Interactive Button
    │   ├── package.json         # Component scripts & @components/sample-buttons scope
    │   ├── vite.config.js       # Vite + Tailwind v4 configuration
    │   ├── index.html           # Component HTML entry point
    │   └── src/
    │       ├── index.js         # Component JavaScript (ES Module)
    │       └── style.css        # Tailwind CSS v4 import
    │
    └── responsive-card/         # Demo component: Responsive Card
        ├── package.json
        ├── vite.config.js
        ├── index.html
        └── src/
            ├── index.js
            └── style.css
```

---

## Prerequisites: Installing pnpm

This repository uses [pnpm](https://pnpm.io/) for workspace management. If `pnpm` is not installed on your system yet, you can install or enable it using one of the following methods:

### Option A: Using Corepack (recommended, included with Node.js 16.13+)

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### Option B: Using npm

```bash
npm install -g pnpm
```

### Option C: Standalone script (Linux / macOS)

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

_(For Windows or additional installation methods, see the [official pnpm installation guide](https://pnpm.io/installation).)_

---

## Getting Started

### 1. Install Dependencies

Run the following command in the root directory to install all shared dependencies and link the workspaces:

```bash
pnpm install
```

### 2. Development & Build Commands

You can run commands either from the root directory targeting a specific workspace via `--filter` (or `-F`) or directly inside a component's folder.

#### Option A: Run from the root directory (recommended)

```bash
# Start the Vite dev server for a single component
pnpm --filter @components/sample-buttons dev

# Build a single component into its dist/ folder
pnpm --filter @components/responsive-card build

# Build all components across all workspaces
pnpm build
```

#### Option B: Run inside a component directory

```bash
cd packages/sample-buttons
pnpm dev
pnpm build
```

### 3. Linting & Formatting

Linting and formatting are configured centrally in the root, so they apply to every package:

- **ESLint** (`eslint.config.mjs`) checks JavaScript, including JSDoc.
- **Prettier** (`.prettierrc.json`) formats JS, CSS, HTML, JSON and Markdown, and sorts Tailwind classes with `prettier-plugin-tailwindcss`.
- `.editorconfig` sets the basics for editors: 4 spaces, LF, UTF-8.

```bash
pnpm check         # Check only, change nothing (Prettier + ESLint)
pnpm fix           # Auto-fix everything that can be fixed (Prettier + ESLint)

pnpm lint          # ESLint only
pnpm lint:fix
pnpm format        # Prettier only
pnpm format:check
```

Some issues cannot be fixed automatically. `pnpm fix` leaves them in place, and the next `pnpm check` reports them.

For VS Code, the extensions `dbaeumer.vscode-eslint` and `esbenp.prettier-vscode` are recommended. Set Prettier as the default formatter, so that formatting on save matches `pnpm format`.

---

## Creating a New Component

To add a new component (e.g., `hero-banner`), follow these steps:

### Step 1: Create the component directory

```bash
mkdir -p packages/hero-banner/src
```

### Step 2: Create `packages/hero-banner/package.json`

Use the `@components/` namespace so you can easily target it via pnpm workspaces:

```json
{
    "name": "@components/hero-banner",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build"
    }
}
```

### Step 3: Create `packages/hero-banner/vite.config.js`

Configure Vite with `base: './'` and the official `@tailwindcss/vite` plugin:

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

### Step 4: Create `packages/hero-banner/src/style.css`

Import Tailwind CSS v4:

```css
@import 'tailwindcss';
```

### Step 5: Create `packages/hero-banner/src/index.js`

Import the stylesheet and add your component's JavaScript logic:

```javascript
import './style.css';

/**
 * Initializes the hero banner component
 * @returns {void}
 */
function initHeroBanner() {
    console.log('Hero banner initialized');
}

initHeroBanner();
```

### Step 6: Create `packages/hero-banner/index.html`

Write your component markup using Tailwind utility classes and reference `./src/index.js`:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Hero Banner</title>
    </head>
    <body class="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <section class="mx-auto max-w-4xl text-center">
            <h1 class="text-4xl font-bold text-gray-900">Hero Banner</h1>
        </section>

        <script type="module" src="./src/index.js"></script>
    </body>
</html>
```

### Step 7: Register the new workspace

Run `pnpm install` once from the repository root so pnpm links the new workspace package:

```bash
pnpm install
```
