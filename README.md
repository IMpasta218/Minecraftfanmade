# MineFan 3D (Minecraft-Inspired Fan Project)

A lightweight browser-based 3D voxel sandbox inspired by classic Minecraft-style gameplay.

> **Disclaimer:** This is an unofficial fan project and is **not affiliated with, endorsed by, or associated with Mojang Studios or Minecraft**.

## Features

- 3D block world with terrain variation
- First-person controls (WASD + jump)
- Minecraft-style start menu on web
- App mode now opens with a Prism-style launcher UI (instances + account manager + Play flow)
- Break blocks with left click
- Place blocks with right click
- Inventory + hotbar with block selection (keys 1-9)
- Basic roaming mobs you can fight
- Runs entirely in the browser (no installation)
- Installable as a PWA app (desktop/mobile) via browser install prompt
- Account options in launcher: Microsoft sign-in placeholder + offline local account

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


## App + Website support

Yes — this project now works as **both**:

- **Website**: host on GitHub Pages and play in browser
- **App**: install it from supported browsers (Chrome/Edge on desktop, Chrome on Android)

How to install as an app after deployment:

1. Open the hosted site.
2. Use the browser's **Install app** option (or open **Settings** in-game and use the install prompt when available).
3. Open the installed app to use the new launcher-style app home and press **PLAY**.
4. Launch it like a standalone app from your home screen/app launcher.


## Account policy

- Microsoft account login is exposed as a launcher option (UI placeholder; OAuth backend not yet configured).
- Offline local account profiles are supported for local play naming.
- Cracked/Ely.by account support is intentionally not provided.