const express = require('express');
const cors = require('cors');
const path = require('path');
const { TwitterDL } = require('twitter-downloader');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API endpoint to extract Twitter video data
app.post('/api/extract', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Twitter URL is required'
      });
    }

    // Validate Twitter URL
    const twitterUrlPattern = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+\/status\/\d+/;
    if (!twitterUrlPattern.test(url)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Twitter URL. Please provide a valid tweet URL with video.'
      });
    }

    // Extract video data using twitter-downloader
    const result = await TwitterDL(url);

    if (result.status === 'error') {
      return res.status(500).json({
        success: false,
        message: result.message || 'Failed to extract video data'
      });
    }

    if (!result.result || !result.result.media || result.result.media.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No media found in this tweet. Please ensure the tweet contains a video.'
      });
    }

    // Filter only video and animated_gif media
    const videos = result.result.media.filter(item =>
      item.type === 'video' || item.type === 'animated_gif'
    );

    if (videos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No video found in this tweet.'
      });
    }

    // Get the first video (tweets usually have one video)
    const video = videos[0];

    // Prepare response with different quality options
    const qualityOptions = video.videos
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
      .map((variant, index) => ({
        quality: variant.quality || `Quality ${index + 1} `,
        url: variant.url,
        bitrate: variant.bitrate || 0
      }));

    res.json({
      success: true,
      data: {
        thumbnail: video.cover || '',
        title: result.result.description || 'Twitter Video',
        author: result.result.author?.username || 'Unknown',
        qualities: qualityOptions
      }
    });

  } catch (error) {
    console.error('Error extracting video:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to extract video. Please try again or check if the URL is correct.'
    });
  }
});

// Download proxy endpoint
app.get('/api/download', async (req, res) => {
  try {
    const { url, quality } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Video URL is required'
      });
    }

    // Fetch the video from Twitter
    const https = require('https');
    const http = require('http');
    const urlModule = require('url');

    const parsedUrl = urlModule.parse(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    protocol.get(url, (videoStream) => {
      // Sanitize quality for filename (remove special characters)
      const safeQuality = (quality || 'download').replace(/[^a-zA-Z0-9-_]/g, '-');

      // Set headers for download
      res.setHeader('Content-Disposition', `attachment; filename="twitter-video-${safeQuality}.mp4"`);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Transfer-Encoding', 'binary');

      // Pipe the video stream to response
      videoStream.pipe(res);
    }).on('error', (error) => {
      console.error('Download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download video'
      });
    });

  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download video'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export for testing or other uses
module.exports = app;
