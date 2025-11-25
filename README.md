# 🐦 Twitter Video Downloader

A simple and minimal web application to download Twitter videos in different quality options.

## Features

- ✨ Clean and minimal user interface
- 🎥 Download videos in multiple quality options
- 📱 Responsive design for mobile and desktop
- ⚡ Fast video extraction
- 🎯 No external API keys required

## Technology Stack

- **Backend**: Node.js + Express
- **Video Extraction**: twitter-downloader npm package
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: Custom CSS with modern design

## Installation

1. Clone or navigate to this directory:
```bash
cd Tweater
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. Copy a Twitter video URL (e.g., `https://twitter.com/username/status/123456789`)
2. Paste it into the input field
3. Click "Get Video"
4. Select your desired quality and click download

## Development

To run the server with auto-reload during development:

```bash
npm run dev
```

## Notes

- This application uses web scraping to extract video URLs
- Twitter/X may change their structure, which could affect functionality
- For production use, consider using official APIs or more robust solutions

## License

MIT
