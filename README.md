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
    ├── sample-button/           # Demo component: Interactive Button
    │   ├── package.json         # Component scripts & @components/sample-button scope
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
pnpm --filter @components/sample-button dev

# Build a single component into its dist/ folder
pnpm --filter @components/responsive-card build

# Build all components across all workspaces
pnpm build
```

#### Option B: Run inside a component directory

```bash
cd packages/sample-button
pnpm dev
pnpm build
```

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
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        />
        <title>Hero Banner</title>
    </head>
    <body class="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <section class="max-w-4xl mx-auto text-center">
            <h1 class="text-4xl font-bold text-gray-900">Hero Banner</h1>
        </section>

        <script
            type="module"
            src="./src/index.js"
        ></script>
    </body>
</html>
```

### Step 7: Register the new workspace

Run `pnpm install` once from the repository root so pnpm links the new workspace package:

```bash
pnpm install
```
