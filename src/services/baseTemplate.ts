const baseTemplate: Record<string, string> = {
  // ---------------------------------------------------------------------------
  // Root files
  // ---------------------------------------------------------------------------

  "/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,

  "/package.json": `{
  "name": "app",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.26.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.34",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.2",
    "vite": "^5.0.0"
  }
}
`,

  "/vite.config.ts": `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.e2b.app']
  }
});
`,

  "/tsconfig.json": `{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "jsx": "react-jsx",
    "strict": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
`,

  "/tailwind.config.js": `export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: []
};
`,

  "/postcss.config.js": `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
`,

  // ---------------------------------------------------------------------------
  // Src files
  // ---------------------------------------------------------------------------

  "/src/main.tsx": `import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(<App />);
`,

  "/src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;
`,

// Temporary placeholder; CodegenAgent will replace this:
  "/src/App.tsx": `export function App() {
  return <div className="p-6 text-center text-xl">Loading...</div>;
}
`
};

export default baseTemplate;