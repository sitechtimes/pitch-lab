# Pitch Lab

Pitch Lab is an all-in-one tuner, metronome, and simple audio recorder. The website is hosted on [https://pitchlab.site/](https://pitchlab.site/), and this repository packages both the Electron desktop app and a standalone web build.

This project is built with **Electron**, **Vue.js**, and **Vite**.

## Project Structure

```
/                 - Configuration files and Electron entry points
├─ public/        - Images and other assets copied directly into the build
├─ src/           - All Vue source code
│  ├─ assets/     - Fonts, icons, button pictures and global styles
│  ├─ components/ - Reusable Vue UI pieces
│  ├─ composables/ - Shared logic like `useTuner.js`
│  ├─ constants/   - Data such as `NoteFrequencies.js` mapping notes to frequencies
│  ├─ router/      - Route definitions for the app (includes paths that are only available in the web build and not in the Electron app)
│  ├─ stores/      - Pinia stores mainly for devices, tuning preferences, and saved audio
│  └─ views/       - Page level components for each screen
├─ electron-main.mjs - Starts Electron and loads the correct URL
├─ preload.js     - Defines the secure API for the renderer
└─ index.html     - HTML template used for the web build
```

## Local Development

After installing dependencies, run `npm run dev` to start the Vite dev server and launch the Electron shell. Use `npm run dist` to package the desktop build and drag and drop the .exe file from the `dist` folder into an object storage platform (like Cloudflare's R2 Buckets) if you want to create a web downloadable version.

### Distribution

`npm run dist` creates the installer inside the `dist` folder using **electron-builder**. Official releases are uploaded to a private Cloudflare R2 bucket referenced in `package.json`. Forks will not have access to that bucket, so update the `publish.url` field or host the generated `.exe` wherever you prefer.

`npm run build:web` produces the static files in `dist-frontend` for standard web hosting.

## How It Works

- During development Electron loads `http://localhost:5173`; in production it opens the built files from `dist-frontend`.
- `electron-main.mjs` sets up the Electron window and picks the right URL.
- `preload.js` exposes a tiny API via `window.electronAPI` so the Vue code can talk to the main process safely.
- The router waits for the audio system to finish initializing before you can enter the main screens.
- Pinia stores in `src/stores` hold device information and build the Web Audio graph (`initialize.js`). `devices.js` tracks available microphones and speakers.
- The tuner logic in `src/composables/useTuner.js` reads microphone input, runs the YIN algorithm to detect the current pitch, and looks up the matching entry in `src/constants/NoteFrequencies.js` so the UI can display the closest note.
- Visual components live in `src/components` and the page layouts are in `src/views`.

## Tuner

1. On mount `useTuner.js` creates an `AudioContext` and connects the selected
   microphone to a gain node and `AnalyserNode` so we can read live samples.
2. `calibrateSilence()` collects RMS values from the analyser for a short time
   and multiplies the quietest reading by three to set a `silenceThreshold`.
3. `trackFrequency()` runs every animation frame. It ignores data while the RMS
   falls below the threshold, then applies a YIN pitch detector to estimate the
   current frequency.
4. Detected pitches are smoothed with an exponential moving average and only
   updated once several readings agree, reducing jitter when switching notes.
5. The nearest note from `src/constants/NoteFrequencies.js` is chosen and the
   cent difference sets `isFlat`, `isSharp`, or `isInTune`, which the UI uses to
   position the indicator.
