# Enhanced Vite React TypeScript Template

This template includes built-in detection for missing CSS variables between your Tailwind config and CSS files.

## Features

- **CSS Variable Detection**: Automatically detects if CSS variables referenced in `tailwind.config.cjs` are defined in `src/index.css`
- **Enhanced Linting**: Includes ESLint, Stylelint, and custom CSS variable validation
- **Shadcn/ui**: Pre-configured with all Shadcn components
- **Modern Stack**: Vite + React + TypeScript + Tailwind CSS

## Available Scripts

```bash
# Run all linting (includes CSS variable check)
npm run lint

# Check only CSS variables
npm run check:css-vars

# Individual linting
npm run lint:js    # ESLint
npm run lint:css   # Stylelint
```

## CSS Variable Detection

The template includes a custom script that:

1. **Parses `tailwind.config.cjs`** to find all `var(--variable)` references
2. **Parses `src/index.css`** to find all defined CSS variables (`--variable:`)
3. **Cross-references** them to find missing definitions
4. **Reports undefined variables** with clear error messages

### Example Output

When CSS variables are missing:
```
❌ Undefined CSS variables found in tailwind.config.cjs:
   --sidebar-background
   --sidebar-foreground
   --sidebar-primary

Add these variables to src/index.css
```

When all variables are defined:
```
✅ All CSS variables in tailwind.config.cjs are defined
```

## How It Works

The detection happens during the `npm run lint` command, which will:
- Exit with error code 1 if undefined variables are found
- Show exactly which variables need to be added to your CSS file
- Integrate seamlessly with your development workflow

This prevents runtime CSS issues where Tailwind classes reference undefined CSS variables.

## Backend (Node.js) Setup

The repo now includes a simple Node.js backend under `server/`.
The API proxies WordPress.org plugin endpoints and exposes:

- `GET /api/plugins/search?q=...&page=...` – search plugins
- `GET /api/plugins/:slug` – fetch plugin details

You can start both frontend and backend together with:

```bash
npm run dev
```

The frontend runs on port 5173 and proxies `/api` requests to `http://localhost:3000`.
Use `/api` in your fetch helpers rather than calling WordPress directly.

If you prefer running servers separately:

```bash
cd server && npm run dev   # backend
npm run dev:ui             # frontend
```

Make sure you have Node 18+ and run `npm install` in both the root and the `server/` subfolder.

This pattern lets you hide API keys, control caching, and add authentication without exposing logic to the browser.