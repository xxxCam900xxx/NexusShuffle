![Banner](/app/public/assets/images/NexusShuffle%20-%20Banner.png)

# NexusShuffle

NexusShuffle is a lightweight, client-side web app that generates random League of Legends teams with sensible role distribution and optional rules. It helps you create balanced or chaotic team compositions instantly — ideal for custom games, scrims, and casual sessions with friends.

**Try it locally**
- Open [app/index.html](app/index.html) in your browser, or serve the `app/` folder with any static server.

Example (Python 3):
```
python -m http.server 8000
# then visit http://localhost:8000/app/
```

**Key features**
- Balanced team generation respecting player roles
- Configurable rules and role enforcement
- Toggle between fair or intentionally chaotic compositions
- No backend required — runs entirely in the browser

**Project layout**
- `app/` — main frontend files and public assets
- `app/public/scripts/` — JavaScript logic
- `app/public/styles/` — CSS styles
- `app/public/assets/` — images and other media

**Contributing**
- Pull requests welcome. Open an issue to discuss larger changes before implementing.

**Release notes**
- See [app/RELEASENOTES.md](app/RELEASENOTES.md) for recent changes.

**License**
- This project is licensed under the terms in the `LICENSE` file.
