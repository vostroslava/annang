/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NEW YEAR GIFT WEBSITE - MAIN APPLICATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * HOW TO CUSTOMIZE:
 * 
 * 1. PHOTOS - Edit the PHOTOS array below. Each item has:
 *    - src: path to image file (place images in ./assets/photos/)
 *    - caption: text shown when photo is clicked
 * 
 * 2. TEXTS - Edit the CONFIG object below to change:
 *    - title: main greeting text
 *    - subtitle: secondary message
 *    - finalMessage: shown after all photos land
 *    - name: girlfriend's name (for personalization)
 * 
 * 3. MUSIC - Place your audio file as ./assets/music.mp3
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════ CONFIGURATION ═══════════
const CONFIG = {
    title: 'С Новым годом, любимая ❤️',
    subtitle: 'Пусть этот год принесёт нам ещё больше моментов вместе ✨',
    finalMessage: 'Теперь ёлка хранит наши моменты 🎄✨',
    name: 'Любимая',
    autoStartDelay: 2000,  // ms before auto-start (if button not clicked)
    dropInterval: 600,      // ms between each photo drop
};

// ═══════════ PHOTOS DATA ═══════════
const PHOTOS = [
    { src: './assets/photos/01.jpg', caption: 'Наши вечера полны магии 💜' },
    { src: './assets/photos/02.jpg', caption: 'Каждый поцелуй с тобой — счастье 💕' },
    { src: './assets/photos/03.jpg', caption: 'Вместе — значит дома 🥰' },
    { src: './assets/photos/04.jpg', caption: 'Наши маленькие приключения 🚇✨' },
    { src: './assets/photos/05.jpg', caption: 'Люблю тебя бесконечно 💖' },
];

// ═══════════ ORNAMENT SLOTS ═══════════
// Normalized positions (0-1) relative to tree container
// Carefully positioned to look like they're hanging on branches
const ORNAMENT_SLOTS = [
    { x: 0.50, y: 0.15 },  // Top center
    { x: 0.32, y: 0.25 },  // Upper left
    { x: 0.68, y: 0.25 },  // Upper right
    { x: 0.22, y: 0.38 },  // Mid-upper left
    { x: 0.50, y: 0.35 },  // Mid center
    { x: 0.78, y: 0.38 },  // Mid-upper right
    { x: 0.15, y: 0.52 },  // Mid-lower left
    { x: 0.42, y: 0.50 },  // Mid-lower center-left
    { x: 0.60, y: 0.52 },  // Mid-lower center-right
    { x: 0.85, y: 0.52 },  // Mid-lower right
    { x: 0.25, y: 0.68 },  // Lower left
    { x: 0.50, y: 0.67 },  // Lower center
    { x: 0.75, y: 0.68 },  // Lower right
    { x: 0.35, y: 0.80 },  // Bottom left
];

// ═══════════ STATE ═══════════
const state = {
    magicStarted: false,
    currentPhotoIndex: 0,
    landedPhotos: 0,
    musicPlaying: false,
    prefersReducedMotion: false,
    starRadiantTimeout: null,
    starHoldTimer: null,
};

// ═══════════ DOM ELEMENTS ═══════════
const elements = {};

// ═══════════ INITIALIZATION ═══════════
document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    checkReducedMotion();
    initSnow();
    initEventListeners();
    setupAutoStart();
});

function cacheElements() {
    elements.snowCanvas = document.getElementById('snow-canvas');
    elements.confettiCanvas = document.getElementById('confetti-canvas');
    elements.treeContainer = document.getElementById('tree-container');
    elements.ornamentsLayer = document.getElementById('ornaments-layer');
    elements.magicBtn = document.getElementById('magic-btn');
    elements.musicBtn = document.getElementById('music-btn');
    elements.star = document.getElementById('star');
    elements.modalOverlay = document.getElementById('modal-overlay');
    elements.modalImage = document.getElementById('modal-image');
    elements.modalCaption = document.getElementById('modal-caption');
    elements.modalClose = document.getElementById('modal-close');
    elements.finalMessage = document.getElementById('final-message');
    elements.music = document.getElementById('background-music');
}

function checkReducedMotion() {
    state.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initEventListeners() {
    // Magic button
    elements.magicBtn.addEventListener('click', startMagic);

    // Music button
    elements.musicBtn.addEventListener('click', toggleMusic);

    // Modal
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) closeModal();
    });

    // Star easter egg (long press)
    let touchStart = 0;
    elements.star.addEventListener('mousedown', () => startStarHold());
    elements.star.addEventListener('mouseup', () => cancelStarHold());
    elements.star.addEventListener('mouseleave', () => cancelStarHold());
    elements.star.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startStarHold();
    });
    elements.star.addEventListener('touchend', () => cancelStarHold());

    // Parallax on desktop
    if (!state.prefersReducedMotion) {
        document.addEventListener('mousemove', handleParallax);
    }

    // Device orientation for mobile parallax
    if (!state.prefersReducedMotion && window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleGyroParallax);
    }
}

function setupAutoStart() {
    setTimeout(() => {
        if (!state.magicStarted) {
            startMagic();
        }
    }, CONFIG.autoStartDelay);
}

// ═══════════ STAR EASTER EGG ═══════════
function startStarHold() {
    state.starHoldTimer = setTimeout(() => {
        activateStarRadiance();
    }, 800); // 800ms hold to activate
}

function cancelStarHold() {
    if (state.starHoldTimer) {
        clearTimeout(state.starHoldTimer);
        state.starHoldTimer = null;
    }
}

function activateStarRadiance() {
    elements.star.classList.add('radiant');

    // Increase snow intensity
    snowConfig.count = 200;
    initSnow();

    // Clear previous timeout
    if (state.starRadiantTimeout) {
        clearTimeout(state.starRadiantTimeout);
    }

    // Reset after 5 seconds
    state.starRadiantTimeout = setTimeout(() => {
        elements.star.classList.remove('radiant');
        snowConfig.count = 80;
        initSnow();
    }, 5000);

    // Launch confetti
    launchConfetti();
}

// ═══════════ MAGIC / PHOTO DROP ═══════════
function startMagic() {
    if (state.magicStarted) return;
    state.magicStarted = true;

    elements.magicBtn.disabled = true;
    elements.magicBtn.innerHTML = '<span class="magic-icon">🎄</span><span>Магия началась!</span>';

    // Launch initial confetti
    launchConfetti();

    // Start dropping photos
    dropNextPhoto();
}

function dropNextPhoto() {
    if (state.currentPhotoIndex >= PHOTOS.length ||
        state.currentPhotoIndex >= ORNAMENT_SLOTS.length) {
        showFinalMessage();
        return;
    }

    const photo = PHOTOS[state.currentPhotoIndex];
    const slot = ORNAMENT_SLOTS[state.currentPhotoIndex];

    createOrnament(photo, slot, state.currentPhotoIndex);
    state.currentPhotoIndex++;

    setTimeout(dropNextPhoto, CONFIG.dropInterval);
}

function createOrnament(photo, slot, index) {
    const container = elements.treeContainer;
    const containerRect = container.getBoundingClientRect();

    // Calculate final position
    const ornamentSize = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--ornament-size'));
    const finalX = (slot.x * containerRect.width) - (ornamentSize / 2);
    const finalY = (slot.y * containerRect.height) - (ornamentSize / 2);

    // Create ornament element
    const ornament = document.createElement('div');
    ornament.className = 'ornament';
    ornament.dataset.index = index;
    ornament.innerHTML = `
        <div class="ornament-hook"></div>
        <div class="ornament-thread"></div>
        <div class="ornament-frame">
            <img src="${photo.src}" 
                 alt="Фото ${index + 1}" 
                 class="ornament-image"
                 onerror="this.parentElement.innerHTML='<div class=\\'ornament-placeholder\\'>💝</div>'"
            >
        </div>
    `;

    // Initial position (above the tree)
    ornament.style.left = `${finalX}px`;
    ornament.style.top = '-100px';
    ornament.style.opacity = '0';

    elements.ornamentsLayer.appendChild(ornament);

    // Add click handler
    ornament.addEventListener('click', () => openModal(photo));

    // Animate falling
    if (state.prefersReducedMotion) {
        // Simple fade in for reduced motion
        requestAnimationFrame(() => {
            ornament.style.transition = 'opacity 0.5s ease, top 0.5s ease';
            ornament.style.opacity = '1';
            ornament.style.top = `${finalY}px`;

            setTimeout(() => {
                ornament.classList.add('landed');
                state.landedPhotos++;
            }, 500);
        });
    } else {
        // Full physics animation
        animateFalling(ornament, finalX, finalY);
    }
}

function animateFalling(ornament, finalX, finalY) {
    const duration = 1200;
    const startTime = performance.now();
    const startY = -100;
    const startRotation = (Math.random() - 0.5) * 30;
    const rotationDrift = (Math.random() - 0.5) * 20;
    const xDrift = (Math.random() - 0.5) * 30;

    ornament.style.opacity = '1';

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing with bounce
        const easeOutBounce = (t) => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) return n1 * t * t;
            if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
            if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        };

        const easedProgress = easeOutBounce(progress);
        const currentY = startY + (finalY - startY) * easedProgress;

        // Add drift and rotation
        const driftProgress = Math.sin(progress * Math.PI);
        const currentX = finalX + (xDrift * driftProgress);
        const currentRotation = startRotation + (rotationDrift * (1 - progress));

        ornament.style.top = `${currentY}px`;
        ornament.style.left = `${currentX}px`;
        ornament.style.transform = `rotate(${currentRotation}deg)`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Landing complete
            ornament.style.left = `${finalX}px`;
            ornament.style.transform = 'rotate(0deg)';
            ornament.classList.add('landed');
            state.landedPhotos++;
        }
    }

    requestAnimationFrame(animate);
}

function showFinalMessage() {
    setTimeout(() => {
        elements.finalMessage.classList.remove('hidden');
        elements.magicBtn.innerHTML = '<span class="magic-icon">✅</span><span>Готово!</span>';
    }, 500);
}

// ═══════════ MODAL ═══════════
function openModal(photo) {
    elements.modalImage.src = photo.src;
    elements.modalImage.alt = photo.caption;
    elements.modalCaption.textContent = photo.caption;
    elements.modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// ═══════════ MUSIC ═══════════
function toggleMusic() {
    if (state.musicPlaying) {
        elements.music.pause();
        elements.musicBtn.classList.remove('playing');
    } else {
        elements.music.play().catch(e => {
            console.log('Audio play prevented:', e);
        });
        elements.musicBtn.classList.add('playing');
    }
    state.musicPlaying = !state.musicPlaying;
}

// ═══════════ SNOW EFFECT ═══════════
const snowConfig = {
    count: 80,
    minSize: 1,
    maxSize: 4,
    speed: 0.5,
};

let snowflakes = [];
let snowAnimationId = null;

function initSnow() {
    const canvas = elements.snowCanvas;
    const ctx = canvas.getContext('2d');

    // Cancel previous animation
    if (snowAnimationId) {
        cancelAnimationFrame(snowAnimationId);
    }

    // Set canvas size
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create snowflakes
    snowflakes = [];
    for (let i = 0; i < snowConfig.count; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: snowConfig.minSize + Math.random() * (snowConfig.maxSize - snowConfig.minSize),
            speedY: snowConfig.speed + Math.random() * snowConfig.speed,
            speedX: (Math.random() - 0.5) * 0.5,
            opacity: 0.3 + Math.random() * 0.7,
        });
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        snowflakes.forEach(flake => {
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            ctx.fill();

            // Move
            flake.y += flake.speedY;
            flake.x += flake.speedX + Math.sin(flake.y * 0.01) * 0.3;

            // Reset if off screen
            if (flake.y > canvas.height + 10) {
                flake.y = -10;
                flake.x = Math.random() * canvas.width;
            }
            if (flake.x > canvas.width + 10) flake.x = -10;
            if (flake.x < -10) flake.x = canvas.width + 10;
        });

        snowAnimationId = requestAnimationFrame(animate);
    }

    if (!state.prefersReducedMotion) {
        animate();
    }
}

// ═══════════ CONFETTI EFFECT ═══════════
let confettiParticles = [];
let confettiAnimationId = null;

function launchConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const colors = ['#FFD700', '#FF6B9D', '#00D4FF', '#FF4757', '#7BED9F', '#FFA502'];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
        confettiParticles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height / 2,
            size: 4 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: (Math.random() - 0.5) * 15,
            speedY: -8 - Math.random() * 10,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            gravity: 0.3,
            opacity: 1,
            type: Math.random() > 0.5 ? 'circle' : 'rect',
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confettiParticles = confettiParticles.filter(p => p.opacity > 0);

        confettiParticles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;

            if (p.type === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            }

            ctx.restore();

            // Physics
            p.x += p.speedX;
            p.y += p.speedY;
            p.speedY += p.gravity;
            p.speedX *= 0.99;
            p.rotation += p.rotationSpeed;

            // Fade out when below screen
            if (p.y > canvas.height - 100) {
                p.opacity -= 0.02;
            }
        });

        if (confettiParticles.length > 0) {
            confettiAnimationId = requestAnimationFrame(animate);
        }
    }

    if (!state.prefersReducedMotion) {
        animate();
    }
}

// ═══════════ PARALLAX EFFECTS ═══════════
function handleParallax(e) {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    elements.treeContainer.style.transform = `
        perspective(1000px)
        rotateY(${x * 2}deg)
        rotateX(${-y * 2}deg)
    `;
}

function handleGyroParallax(e) {
    if (e.gamma === null || e.beta === null) return;

    const x = Math.max(-15, Math.min(15, e.gamma)) / 15;
    const y = Math.max(-15, Math.min(15, e.beta - 45)) / 15;

    elements.treeContainer.style.transform = `
        perspective(1000px)
        rotateY(${x * 3}deg)
        rotateX(${-y * 3}deg)
    `;
}

// ═══════════ KEYBOARD NAVIGATION ═══════════
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
    if (e.key === ' ' || e.key === 'Enter') {
        if (!state.magicStarted && document.activeElement === elements.magicBtn) {
            startMagic();
        }
    }
});
