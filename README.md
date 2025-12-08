# Diff Viewer

A simple difference checker built with Next.js and Monaco Editor. Compare text files side-by-side or inline.

## Features

- **Side-by-Side & Inline Views**: Toggle between split view and unified view.
- **Syntax Highlighting**: Automatically detects language from file extensions.
- **Drag & Drop**: Drag files anywhere on the screen to load them.
- **Easy Uploads**: Upload buttons for both original and modified panes.
- **Clipboard Support**: Paste content directly into the editor or use the paste buttons.
- **Real-time Comparison**: See differences instantly as you type or paste.
- **State Persistence**: Your work is saved automatically to your browser's local storage.
- **Identical Detection**: Clear visual indicator when files match exactly.
- **Secure**: All processing happens client-side in your browser.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technologies

- [Next.js](https://nextjs.org/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [React Dropzone](https://react-dropzone.js.org/)

