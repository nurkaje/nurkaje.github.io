# Nurkaje — Developer Portfolio

**Personal portfolio of Eldin Nurkic**  
Bacc. inf. tech. · Software Development · Web & Databases · Exploring Cybersecurity

🌐 **Live website:** [nurkaje.github.io](https://nurkaje.github.io/)

## About

Nurkaje is my personal developer portfolio, built to present my background, selected projects, and approach to creating practical software.

The website offers two ways to explore my work: a straightforward **Professional Mode** and an optional **Interactive Mode**. Both share the same design language, with a dark navy palette, warm orange accents, and responsive layouts.

## Features

### Professional Mode

- Introduction, background, and technical interests
- Featured projects with detailed project stories
- A short look at my development approach
- A photography section linking to **Nurka Productions**
- Direct links to GitHub, LinkedIn, and email

### Interactive Mode

- A draggable 3D star-map concept inspired by Asteriva
- A simulated portfolio terminal with commands such as `help`, `whoami`, `projects`, `skills`, and `contact`
- An interactive **Understand → Build → Verify** workflow
- Keyboard and touch interactions where supported

> **Note:** The interactive star map is a visual concept demo, not a scientifically accurate reconstruction of the sky. Actual Asteriva posters are generated separately using astronomical data.

## Featured Projects

### Asteriva

An Android application for generating personalized night-sky posters from a selected date, time, and location.

**Technologies:** Kotlin, Jetpack Compose, Python, FastAPI, and astronomy libraries.

### Ludo Club

A playable browser-based Ludo game with a responsive interface and client-side game logic.

**Technologies:** HTML, CSS, and JavaScript.

[Play Ludo Club](https://nurkaje.github.io/games/my_ludo_club.html)

## Built With

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas-based visual interactions
- GitHub Pages for static hosting

No frontend framework, build tool, or application backend is required to run this portfolio.

## Project Structure

```text
nurkaje.github.io/
├── assets/
│   ├── cursor-glow.js
│   ├── favicon.svg
│   ├── interactive.js
│   ├── main.js
│   ├── og-preview.png
│   ├── sky-globe.js
│   └── style.css
├── games/
│   ├── ludo-club/
│   │   ├── game.js
│   │   └── style.css
│   └── my_ludo_club.html
├── .gitignore
├── .nojekyll
├── index.html
├── README.md
├── robots.txt
└── sitemap.xml
```

## Run Locally

Clone or download the repository and open `index.html` in your browser.

For a local development server, you can use VS Code's **Live Server** extension or run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

This site is designed for GitHub Pages:

1. Publish the files to a repository named `nurkaje.github.io` under the `nurkaje` account.
2. In **Settings → Pages**, select **Deploy from a branch**.
3. Choose the `main` branch and `/ (root)` folder.
4. Visit [nurkaje.github.io](https://nurkaje.github.io/) after deployment completes.

The `.nojekyll` file prevents unnecessary Jekyll processing. The repository includes basic SEO metadata, an Open Graph preview image, `robots.txt`, and `sitemap.xml`.

## Privacy

This is a public portfolio repository. The `.gitignore` excludes common document formats and local configuration files to reduce the risk of accidentally committing sensitive files.

Before publishing changes, review the GitHub Desktop **Changes** list to confirm that no private or unintended files are included.

## Connect

- **Portfolio:** [nurkaje.github.io](https://nurkaje.github.io/)
- **GitHub:** [github.com/nurkaje](https://github.com/nurkaje)
- **LinkedIn:** [linkedin.com/in/nurkiceldin](https://www.linkedin.com/in/nurkiceldin/)
- **Photography:** [@nurkaproductions](https://www.instagram.com/nurkaproduction/)

---

**Designed and developed by Eldin Nurkic.**