// datos de ejemplo para la demostración
const sampleTracks = [
    {
        id: 1,
        title: "midnight city",
        artist: "m83",
        genre: "electronic",
        duration: "4:03",
        artwork: "🎵",
        preview: null
    },
    {
        id: 2,
        title: "blinding lights",
        artist: "the weeknd",
        genre: "pop",
        duration: "3:20",
        artwork: "🎵",
        preview: null
    },
    {
        id: 3,
        title: "bohemian rhapsody",
        artist: "queen",
        genre: "rock",
        duration: "5:55",
        artwork: "🎵",
        preview: null
    },
    {
        id: 4,
        title: "take five",
        artist: "dave brubeck",
        genre: "jazz",
        duration: "5:24",
        artwork: "🎵",
        preview: null
    },
    {
        id: 5,
        title: "claire de lune",
        artist: "claude debussy",
        genre: "classical",
        duration: "4:56",
        artwork: "🎵",
        preview: null
    },
    {
        id: 6,
        title: "lose yourself",
        artist: "eminem",
        genre: "hip-hop",
        duration: "5:26",
        artwork: "🎵",
        preview: null
    }
];

// estado de la aplicación
let currentTracks = [];
let favorites = JSON.parse(localStorage.getItem('ethersound_favorites')) || [];
let currentTrack = null;
let isPlaying = false;

// elementos del dom
const musicSearch = document.getElementById('musicSearch');
const searchBtn = document.getElementById('searchBtn');
const resultsGrid = document.getElementById('resultsGrid');
const favoritesGrid = document.getElementById('favoritesGrid');
const genreTags = document.querySelectorAll('.genre-tag');
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const trackTitleEl = document.querySelector('.track-title');
const trackArtistEl = document.querySelector('.track-artist');

// inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadFavorites();
});

function initializeApp() {
    // mostrar tracks de ejemplo inicialmente
    currentTracks = [...sampleTracks];
    renderTracks(currentTracks);
    
    // ocultar sección de resultados inicialmente
    document.getElementById('results').style.display = 'none';
}

function setupEventListeners() {
    // búsqueda
    searchBtn.addEventListener('click', handleSearch);
    musicSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // géneros rápidos
    genreTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const genre = this.dataset.genre;
            searchByGenre(genre);
        });
    });
    
    // navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            scrollToSection(target);
            updateActiveNav(this);
        });
    });
    
    // controles del reproductor
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    
    // botones de descubrir
    document.querySelectorAll('.card-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.discover-card');
            const title = card.querySelector('h3').textContent;
            handleDiscoverAction(title);
        });
    });
}

function handleSearch() {
    const query = musicSearch.value.trim().toLowerCase();
    
    if (!query) {
        showNotification('por favor ingresa una búsqueda', 'warning');
        return;
    }
    
    // simular búsqueda con datos de ejemplo
    const results = sampleTracks.filter(track => 
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.genre.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        showNotification('no se encontraron resultados', 'info');
        return;
    }
    
    currentTracks = results;
    renderTracks(currentTracks);
    document.getElementById('results').style.display = 'block';
    scrollToSection('results');
    
    showNotification(`encontrados ${results.length} resultados`, 'success');
}

function searchByGenre(genre) {
    const results = sampleTracks.filter(track => 
        track.genre.toLowerCase() === genre.toLowerCase()
    );
    
    currentTracks = results;
    renderTracks(currentTracks);
    document.getElementById('results').style.display = 'block';
    scrollToSection('results');
    
    // actualizar el input de búsqueda
    musicSearch.value = genre;
    
    showNotification(`mostrando música ${genre}`, 'success');
}

function renderTracks(tracks) {
    if (tracks.length === 0) {
        resultsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>no se encontraron resultados</p>
                <span>intenta con otros términos de búsqueda</span>
            </div>
        `;
        return;
    }
    
    resultsGrid.innerHTML = tracks.map(track => `
        <div class="track-card" data-track-id="${track.id}">
            <div class="track-artwork">
                <i class="fas fa-music"></i>
            </div>
            <div class="track-info">
                <h3>${track.title}</h3>
                <p>${track.artist}</p>
                <div class="track-meta">
                    <span>${track.genre}</span>
                    <span>${track.duration}</span>
                </div>
            </div>
            <div class="track-actions">
                <button class="action-btn play-track" data-track-id="${track.id}">
                    <i class="fas fa-play"></i>
                </button>
                <button class="action-btn add-favorite" data-track-id="${track.id}">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="action-btn share-track" data-track-id="${track.id}">
                    <i class="fas fa-share"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // agregar event listeners a los botones
    document.querySelectorAll('.play-track').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const trackId = parseInt(this.dataset.trackId);
            playTrack(trackId);
        });
    });
    
    document.querySelectorAll('.add-favorite').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const trackId = parseInt(this.dataset.trackId);
            toggleFavorite(trackId);
        });
    });
    
    document.querySelectorAll('.share-track').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const trackId = parseInt(this.dataset.trackId);
            shareTrack(trackId);
        });
    });
    
    // hacer clic en la tarjeta para reproducir
    document.querySelectorAll('.track-card').forEach(card => {
        card.addEventListener('click', function() {
            const trackId = parseInt(this.dataset.trackId);
            playTrack(trackId);
        });
    });
}

function playTrack(trackId) {
    const track = sampleTracks.find(t => t.id === trackId);
    if (!track) return;
    
    currentTrack = track;
    updatePlayerUI();
    showNotification(`reproduciendo: ${track.title}`, 'success');
    
    // simular reproducción (en una app real aquí se cargaría el audio)
    isPlaying = true;
    updatePlayButton();
    
    // simular progreso
    simulateProgress();
}

function updatePlayerUI() {
    if (!currentTrack) return;
    
    trackTitleEl.textContent = currentTrack.title;
    trackArtistEl.textContent = currentTrack.artist;
    totalTimeEl.textContent = currentTrack.duration;
    currentTimeEl.textContent = '0:00';
    progressFill.style.width = '0%';
}

function togglePlay() {
    if (!currentTrack) {
        showNotification('selecciona una canción primero', 'warning');
        return;
    }
    
    isPlaying = !isPlaying;
    updatePlayButton();
    
    if (isPlaying) {
        showNotification('reproduciendo', 'success');
        simulateProgress();
    } else {
        showNotification('pausado', 'info');
    }
}

function updatePlayButton() {
    const icon = playBtn.querySelector('i');
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function playPrevious() {
    if (!currentTrack) return;
    
    const currentIndex = currentTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentTracks.length - 1;
    const prevTrack = currentTracks[prevIndex];
    
    playTrack(prevTrack.id);
}

function playNext() {
    if (!currentTrack) return;
    
    const currentIndex = currentTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = currentIndex < currentTracks.length - 1 ? currentIndex + 1 : 0;
    const nextTrack = currentTracks[nextIndex];
    
    playTrack(nextTrack.id);
}

function simulateProgress() {
    if (!isPlaying || !currentTrack) return;
    
    let currentSeconds = 0;
    const totalSeconds = parseTimeToSeconds(currentTrack.duration);
    
    const interval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(interval);
            return;
        }
        
        currentSeconds += 1;
        const progress = (currentSeconds / totalSeconds) * 100;
        
        progressFill.style.width = `${Math.min(progress, 100)}%`;
        currentTimeEl.textContent = formatTime(currentSeconds);
        
        if (currentSeconds >= totalSeconds) {
            clearInterval(interval);
            isPlaying = false;
            updatePlayButton();
            playNext();
        }
    }, 1000);
}

function parseTimeToSeconds(timeString) {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function toggleFavorite(trackId) {
    const track = sampleTracks.find(t => t.id === trackId);
    if (!track) return;
    
    const isFavorite = favorites.some(f => f.id === trackId);
    
    if (isFavorite) {
        favorites = favorites.filter(f => f.id !== trackId);
        showNotification('removido de favoritos', 'info');
    } else {
        favorites.push(track);
        showNotification('agregado a favoritos', 'success');
    }
    
    localStorage.setItem('ethersound_favorites', JSON.stringify(favorites));
    loadFavorites();
    updateFavoriteButtons();
}

function loadFavorites() {
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <p>aún no tienes canciones favoritas</p>
                <span>busca música y marca tus favoritas para verlas aquí</span>
            </div>
        `;
        return;
    }
    
    favoritesGrid.innerHTML = favorites.map(track => `
        <div class="track-card" data-track-id="${track.id}">
            <div class="track-artwork">
                <i class="fas fa-music"></i>
            </div>
            <div class="track-info">
                <h3>${track.title}</h3>
                <p>${track.artist}</p>
                <div class="track-meta">
                    <span>${track.genre}</span>
                    <span>${track.duration}</span>
                </div>
            </div>
            <div class="track-actions">
                <button class="action-btn play-track" data-track-id="${track.id}">
                    <i class="fas fa-play"></i>
                </button>
                <button class="action-btn remove-favorite" data-track-id="${track.id}">
                    <i class="fas fa-heart-broken"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // agregar event listeners
    document.querySelectorAll('.play-track').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const trackId = parseInt(this.dataset.trackId);
            playTrack(trackId);
        });
    });
    
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const trackId = parseInt(this.dataset.trackId);
            toggleFavorite(trackId);
        });
    });
}

function updateFavoriteButtons() {
    document.querySelectorAll('.add-favorite').forEach(btn => {
        const trackId = parseInt(btn.dataset.trackId);
        const isFavorite = favorites.some(f => f.id === trackId);
        const icon = btn.querySelector('i');
        
        if (isFavorite) {
            icon.className = 'fas fa-heart';
            btn.style.color = 'var(--accent)';
        } else {
            icon.className = 'fas fa-heart';
            btn.style.color = 'var(--text-secondary)';
        }
    });
}

function shareTrack(trackId) {
    const track = sampleTracks.find(t => t.id === trackId);
    if (!track) return;
    
    const shareText = `mira esta canción: ${track.title} - ${track.artist}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'ethersound',
            text: shareText,
            url: window.location.href
        });
    } else {
        // fallback: copiar al portapapeles
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('enlace copiado al portapapeles', 'success');
        });
    }
}

function handleDiscoverAction(action) {
    switch (action) {
        case 'recomendaciones aleatorias':
            const randomTracks = [...sampleTracks].sort(() => Math.random() - 0.5).slice(0, 4);
            currentTracks = randomTracks;
            renderTracks(currentTracks);
            document.getElementById('results').style.display = 'block';
            scrollToSection('results');
            showNotification('recomendaciones aleatorias cargadas', 'success');
            break;
            
        case 'tendencias':
            const trendingTracks = sampleTracks.slice(0, 3);
            currentTracks = trendingTracks;
            renderTracks(currentTracks);
            document.getElementById('results').style.display = 'block';
            scrollToSection('results');
            showNotification('tendencias actuales', 'success');
            break;
            
        case 'comunidad':
            showNotification('función de comunidad próximamente', 'info');
            break;
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function updateActiveNav(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

function showNotification(message, type = 'info') {
    // crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // estilos de la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: '10000',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3'
    };
    return colors[type] || '#2196f3';
}

// efectos visuales adicionales
document.addEventListener('mousemove', function(e) {
    const cards = document.querySelectorAll('.track-card, .discover-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        }
    });
});

// resetear transformaciones cuando el mouse sale
document.addEventListener('mouseleave', function() {
    const cards = document.querySelectorAll('.track-card, .discover-card');
    cards.forEach(card => {
        card.style.transform = '';
    });
});
