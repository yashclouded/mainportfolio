# Yash | Portfolio

A minimalist, highly interactive portfolio built with modern web technologies, featuring a custom GPU-accelerated fluid membrane interaction system.

## Tech Stack & Tools

### Core Framework
* **[Next.js](https://nextjs.org/)** (App Router) - React framework for production, handling routing and server/client component architecture.
* **[React 19](https://react.dev/)** - The underlying UI library.
* **[TypeScript](https://www.typescriptlang.org/)** - For type safety and better developer experience.

### Styling & Layout
* **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for rapid UI styling, layout structuring, and responsive design.
* **CSS Custom Properties & Blend Modes** - Utilizing `mix-blend-mode: difference` and `filter: invert(1)` to create dynamic, high-contrast typography that remains visible regardless of the fluid background color beneath it.

### Animation & Interaction
* **[Framer Motion](https://motion.dev/)** (`motion/react`) - Used for all DOM-based animations, scroll-driven effects (`useScroll`, `useTransform`), smooth inertial scrolling, and spring physics.

### Graphics & Shaders (The "Fluid" System)
* **WebGL / GLSL Shaders** - Custom fragment and vertex shaders powering the interactive liquid background. Uses a Navier-Stokes fluid simulation with ping-pong framebuffers for velocity, pressure, and density.
* **SVG Filters (`<filter>`)** - Advanced SVG filter primitives (`feTurbulence`, `feDisplacementMap`, `feColorMatrix`) are used to create the organic, "Apple water" refraction effect over the large typography when the fluid flows over it.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure Highlights

* `/app` - Next.js App Router pages and global layouts.
* `/components` - Reusable UI components (Landing, Identity, Highlights, Interactive sections).
* `/lib` - Core logic, including the `FluidSimulation.ts` engine and React context providers.
* `/public` - Static assets and icons.
