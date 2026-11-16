# DevOps Adventure - Node.js Single-Tier Application

## Project Overview

DevOps Adventure is an original 2D platformer game built with Node.js,
Express.js, HTML, CSS, JavaScript and HTML Canvas.

The frontend static files and Node.js server are deployed together
as one application.

## Technology Stack

- Node.js
- Express.js
- HTML5
- CSS3
- JavaScript
- HTML Canvas
- AWS EC2 (deployment target)

## Architecture

Browser
  |
  v
Node.js + Express server
  |
  v
Static frontend files in public/
  |
  +-- index.html
  +-- css/style.css
  +-- js/game.js

## Project Structure

```text
DevOps-Adventure/
├── server.js
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
├── logs/
└── public/
    ├── index.html
    ├── css/style.css
    ├── js/game.js
    └── assets/
```

## Prerequisites

- Node.js and npm installed
- A modern web browser

Check versions:

```bash
node --version
npm --version
```

## Installation

Install project dependencies:

```bash
npm install
```

## Run the application

```bash
npm start
```

Open the game:

http://localhost:3000

Health-check endpoint:

http://localhost:3000/health

## Controls

- Left Arrow or A: move left
- Right Arrow or D: move right
- Up Arrow, W or Space: jump
- On touch devices: use the on-screen controls

Collect coins, avoid enemies and reach the finish flag.

## Execution Flow

1. `npm start` runs the `start` script in `package.json`.
2. Node.js executes `server.js`.
3. Express starts an HTTP server on the configured port (3000 by default).
4. The browser requests the application.
5. Express serves static files from `public/`.
6. The browser loads HTML, CSS and JavaScript.
7. `game.js` renders and runs the game using Canvas.

## DevOps Learning Roadmap

1. Local development and testing
2. Foreground and background execution
3. Process management
4. Log redirection and troubleshooting
5. `nohup` execution
6. systemd service configuration
7. AWS EC2 deployment on Amazon Linux 2023
8. Security group configuration
9. Monitoring and operational troubleshooting

## GitHub Notes

Commit `package.json` and `package-lock.json`.
Do not commit `node_modules/`, runtime logs or `.env` files.
