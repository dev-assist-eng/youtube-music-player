class YouTubeMusicPlayer {
    constructor() {
        this.playlist = [];
        this.currentVideo = null;
        this.searchResults = [];
        this.initElements();
        this.attachEventListeners();
        this.loadPlaylistFromStorage();
    }

    initElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultsList = document.getElementById('resultsList');
        this.playerContainer = document.getElementById('playerContainer');
        this.playlistContainer = document.getElementById('playlist');
    }

    attachEventListeners() {
        this.searchBtn.addEventListener('click', () => this.search());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });
    }

    async search() {
        const query = this.searchInput.value.trim();
        if (!query) return;

        try {
            this.resultsList.innerHTML = '<p style="text-align: center; color: #666;">Searching...</p>';
            
            // Use YouTube Data API
            const apiKey = 'AIzaSyDTRo_8Bx-1YTa5H5PSEuI5hE3h5MU1QCo'; // Demo key
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=12&key=${apiKey}`
            );

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            this.searchResults = data.items || [];
            this.displayResults();
        } catch (error) {
            console.error('Search error:', error);
            this.resultsList.innerHTML = '<p style="text-align: center; color: #ff6b6b;">Error searching. Try again!</p>';
        }
    }

    displayResults() {
        this.resultsList.innerHTML = '';

        if (this.searchResults.length === 0) {
            this.resultsList.innerHTML = '<p style="text-align: center; color: #666;">No results found</p>';
            return;
        }

        this.searchResults.forEach((item) => {
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const channel = item.snippet.channelTitle;

            const resultElement = document.createElement('div');
            resultElement.className = 'result-item';
            resultElement.innerHTML = `
                <div class="result-title">${this.escapeHtml(title)}</div>
                <div class="result-channel">${this.escapeHtml(channel)}</div>
            `;

            resultElement.addEventListener('click', () => {
                this.addToPlaylist(videoId, title, channel);
            });

            this.resultsList.appendChild(resultElement);
        });
    }

    addToPlaylist(videoId, title, channel) {
        const song = { videoId, title, channel };
        
        // Check if already in playlist
        if (!this.playlist.some(s => s.videoId === videoId)) {
            this.playlist.push(song);
            this.savePlaylistToStorage();
            this.updatePlaylist();
        }
    }

    playVideo(videoId) {
        this.currentVideo = this.playlist.find(s => s.videoId === videoId);
        
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        this.playerContainer.innerHTML = `
            <iframe 
                src="${embedUrl}" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    }

    removeFromPlaylist(videoId) {
        this.playlist = this.playlist.filter(s => s.videoId !== videoId);
        this.savePlaylistToStorage();
        this.updatePlaylist();

        if (this.currentVideo?.videoId === videoId) {
            this.playerContainer.innerHTML = '<p class="empty-state">Select a song to play</p>';
            this.currentVideo = null;
        }
    }

    updatePlaylist() {
        this.playlistContainer.innerHTML = '';

        if (this.playlist.length === 0) {
            this.playlistContainer.innerHTML = '<p style="color: #999; font-style: italic;">No songs in playlist</p>';
            return;
        }

        this.playlist.forEach((song) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            item.innerHTML = `
                <div>
                    <div class="playlist-item-title">${this.escapeHtml(song.title)}</div>
                    <div class="playlist-item-channel">${this.escapeHtml(song.channel)}</div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-play">▶ Play</button>
                    <button class="btn btn-remove">Remove</button>
                </div>
            `;

            const playBtn = item.querySelector('.btn-play');
            const removeBtn = item.querySelector('.btn-remove');

            playBtn.addEventListener('click', () => this.playVideo(song.videoId));
            removeBtn.addEventListener('click', () => this.removeFromPlaylist(song.videoId));

            this.playlistContainer.appendChild(item);
        });
    }

    savePlaylistToStorage() {
        localStorage.setItem('youtubePlaylist', JSON.stringify(this.playlist));
    }

    loadPlaylistFromStorage() {
        const stored = localStorage.getItem('youtubePlaylist');
        if (stored) {
            this.playlist = JSON.parse(stored);
            this.updatePlaylist();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.player = new YouTubeMusicPlayer();
});
