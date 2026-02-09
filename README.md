# MineFan 3D (Minecraft-Inspired Fan Project)

A lightweight browser-based 3D voxel sandbox inspired by classic Minecraft-style gameplay.

> **Disclaimer:** This is an unofficial fan project and is **not affiliated with, endorsed by, or associated with Mojang Studios or Minecraft**.

## Features

- 3D block world with terrain variation
- First-person controls (WASD + jump)
- Break blocks with left click
- Place blocks with right click
- Inventory + hotbar with block selection (keys 1-9)
- Basic roaming mobs you can fight
- Runs entirely in the browser (no installation)

## Run locally

Because this project uses ES modules, serve it with any static file server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, set:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch), folder `/ (root)`
4. Save and wait for deployment.
5. Your game will be live at:

```text
https://<your-username>.github.io/<your-repo-name>/
```

No installation is required for players — they only need a modern web browser.