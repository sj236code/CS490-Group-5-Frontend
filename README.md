# React + Vite Project

This project is built with [Vite](https://vitejs.dev/) for fast development and bundling, and uses [React](https://react.dev/) for the UI.

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/yourproject.git
cd cs490-group-5-frontend/
```
### 2. Install dependencies
```bash
npm install
```
This installs everything listed in package.json, including React, Vite, and any UI libraries like lucide-react.

### 3. Install additional libraries if needed
```bash
npm install lucide-react
```

### 4. Set up environment variables if not set up
Check for a ```.env.production``` file when you pulled from dev. 
If it's there, skip this step. 
If not,
Create a ```.env.production``` file in the root directory:
```bash
VITE_API_URL=https://jade-main.up.railway.app
```

### 5. Install Router
```bash
npm install react-router-dom
```

To check and confirm succesfully downloaded: 
```bash
npm list react-router-dom
```

### 6. Preview the Production build (locally)
```bash
npm run build
```
```bash
npm run preview
```

This runs the production build locally and connects to the Railway backend (no need to run local backend now!)

Notes-
You don’t need to install Vite globally (npm install -g vite) — it runs from the local project setup.
