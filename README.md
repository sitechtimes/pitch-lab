This project is built with Electron + Vue.js + Vite.

# Project Setup

Every time you make a change and you want it to be reflected on the downloaded app, run:

```bash
npm run dist
```

This will create a new `dist` folder and `dist-frontend` folder with the latest changes while clearing any previous builds.

Then, open the dist folder and drag and drop the .exe file into Cloudflare's R2 Object Storage so the new version is available for download.
--> Contact me for permissions to upload to the R2 bucket for www.pitchlab.site or use your own R2 bucket and host the app on a local server or put the .exe file in public/downloads if using Netlify.

- convert the .exe file to .zip

Will make read.me more detailed later.

Website is hosted on: https://pitchlab.site/
