# Icons (SVG)

This folder stores SVG icon assets served statically by the client app.

- Place icon files as `.svg` here, e.g. `logo.svg`, `close.svg`.
- Reference them from code or HTML via `/icons/<name>.svg`.

Examples:

```html
<!-- In HTML -->
<img src="/icons/logo.svg" alt="Logo" />
```

```tsx
// In React/TSX
<img src="/icons/close.svg" alt="Close" />
```

Notes:

- Files in `public/` are copied to the web root by Vite.
- If you prefer importing SVGs as React components, add them under `src/assets/icons` and use an appropriate SVG loader/plugin.

