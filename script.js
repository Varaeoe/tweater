const form = document.getElementById('videoForm');
const urlInput = document.getElementById('videoUrl');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const errorMessage = document.getElementById('errorMessage');
const videoResult = document.getElementById('videoResult');
const videoThumbnail = document.getElementById('videoThumbnail');
const videoTitle = document.getElementById('videoTitle');
const videoAuthor = document.getElementById('videoAuthor');
const qualityButtons = document.getElementById('qualityButtons');

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = urlInput.value.trim();
    if (!url) return;

    // Reset UI
    hideError();
    hideResult();
    setLoading(true);

    try {
        const response = await fetch('/api/extract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (!data.success) {
            showError(data.message || 'Failed to extract video');
            return;
        }

        displayVideoResult(data.data);
    } catch (error) {
        showError('Network error. Please check your connection and try again.');
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
});

// Display video result with quality options
function displayVideoResult(data) {
    videoThumbnail.src = data.thumbnail || 'https://via.placeholder.com/120?text=No+Preview';
    videoTitle.textContent = data.title;
    videoAuthor.textContent = `By ${data.author}`;

    // Clear previous quality buttons
    qualityButtons.innerHTML = '';

    // Create quality buttons
    data.qualities.forEach((quality, index) => {
        const btn = document.createElement('button');
        btn.className = 'quality-btn';
        btn.textContent = `Download ${quality.quality}`;

        // Add badge for highest quality
        if (index === 0) {
            btn.textContent += ' ⭐ (Best)';
        }

        // Add click handler for download
        btn.addEventListener('click', (e) => {
            downloadVideo(quality.url, quality.quality, e.target);
        });

        qualityButtons.appendChild(btn);
    });

    videoResult.classList.remove('hidden');
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Hide video result
function hideResult() {
    videoResult.classList.add('hidden');
}

// Download video through backend proxy using fetch + blob
async function downloadVideo(videoUrl, quality, buttonElement) {
    try {
        // Show loading state on the button
        const originalText = buttonElement.textContent;
        buttonElement.disabled = true;
        buttonElement.textContent = 'Downloading...';

        // Use the proxy endpoint
        const downloadUrl = `/api/download?url=${encodeURIComponent(videoUrl)}&quality=${encodeURIComponent(quality)}`;

        // Fetch the video as a blob
        const response = await fetch(downloadUrl);

        if (!response.ok) {
            throw new Error('Download failed');
        }

        const blob = await response.blob();

        // Create blob URL and trigger download
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `twitter-video-${quality}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL
        window.URL.revokeObjectURL(blobUrl);

        // Reset button state
        setTimeout(() => {
            buttonElement.disabled = false;
            buttonElement.textContent = originalText;
        }, 1000);

    } catch (error) {
        console.error('Download failed:', error);
        showError('Download failed. Please try again.');
        buttonElement.disabled = false;
        buttonElement.textContent = buttonElement.textContent.replace('Downloading...', 'Download');
    }
}

// Set loading state
function setLoading(isLoading) {
    submitBtn.disabled = isLoading;

    if (isLoading) {
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    } else {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}
