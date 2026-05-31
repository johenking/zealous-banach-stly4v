# Grade Planner

Grade Planner is a mobile-first academic planning app for tracking degree progress, credits, GPA, and semester-by-semester course completion.

The project was originally built as a personal curriculum tracker and is being prepared as a reusable open-source template for students who need a lightweight way to understand graduation requirements and academic progress.

## Features

- Semester-based curriculum checklist
- Credit and GPA progress dashboard
- Required/elective course grouping
- Firebase-backed sync with anonymous and Google sign-in
- Offline-friendly Firestore persistence
- Mobile-first interface with animated interactions

## Why this project matters

Many students manage graduation requirements in spreadsheets, screenshots, or disconnected school portals. Grade Planner provides an open, customizable implementation that can be adapted to different university programs without requiring a full student information system.

## Tech stack

- React 18
- Create React App
- Firebase Authentication
- Cloud Firestore
- Framer Motion
- Lucide React

## Getting started

```bash
npm install
cp .env.example .env.local
npm start
```

Create a Firebase web app and fill in the `REACT_APP_FIREBASE_*` values in `.env.local`.

## Configuration

The app reads Firebase configuration from environment variables first. For backward compatibility with hosted demos, it can still fall back to the demo configuration in `src/App.js`.

## Scripts

```bash
npm start   # run locally
npm test    # run tests in jsdom
npm run build
```

## Roadmap

- Extract curriculum data into JSON files
- Add import/export for custom degree plans
- Add test coverage for GPA and credit calculations
- Add i18n support for English and Chinese interfaces
- Publish versioned releases and demo screenshots

## Maintainer

Maintained by [@johenking](https://github.com/johenking). Contributions, bug reports, and curriculum adaptation ideas are welcome.

## License

MIT License. See [LICENSE](LICENSE).
