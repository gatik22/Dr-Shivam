/* ============================================
   DR. SHIVAM KAUSHIK — WEBSITE SCRIPTS
   Scroll animations, navbar, counters, form
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollAnimations();
    initStatCounters();
    initMobileNav();
    initContactForm();
    initSmoothScroll();
    initHeroSpline();
    initServiceCards();
});

/* ── SERVICE CARD CLICK-TO-HIGHLIGHT ── */
function initServiceCards() {
    const cards = document.querySelectorAll('.service-card');

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't toggle if clicking the "Learn more" link
            if (e.target.closest('.service-link')) return;

            const isActive = card.classList.contains('active');

            // Remove active from all cards first
            cards.forEach(c => c.classList.remove('active'));

            // Toggle: if it wasn't active, make it active
            if (!isActive) {
                card.classList.add('active');
            }
        });
    });
}

/* ── HERO SPLINE 3D SCENE ── */
function initHeroSpline() {
    const wrapper = document.getElementById('heroSplineWrapper');
    const viewer = document.getElementById('heroSplineViewer');
    const fallback = document.querySelector('.hero-bg-fallback');

    if (!wrapper || !viewer) return;

    // Skip on mobile — the CSS hides the wrapper, but we also
    // avoid attaching listeners for cleanliness.
    if (window.innerWidth < 768) return;

    // The spline-viewer fires a 'load' event when the scene is ready
    viewer.addEventListener('load', () => {
        wrapper.classList.add('loaded');
        // Hide the static fallback image
        if (fallback) {
            fallback.classList.add('hidden');
        }
    });

    // Safety timeout: if scene takes too long (>12s), show it anyway
    setTimeout(() => {
        if (!wrapper.classList.contains('loaded')) {
            wrapper.classList.add('loaded');
            if (fallback) {
                fallback.classList.add('hidden');
            }
        }
    }, 12000);
}

/* ── NAVBAR SCROLL EFFECT ── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScrollY = 0;

    function handleScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
}

/* ── SCROLL REVEAL ANIMATIONS ── */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}

/* ── STAT COUNTER ANIMATION ── */
function initStatCounters() {
    const statNumbers = document.querySelectorAll('[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000; // ms
    const startTime = performance.now();
    const startValue = 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(startValue + (target - startValue) * eased);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }

    requestAnimationFrame(update);
}

/* ── MOBILE NAVIGATION ── */
function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* ── SMOOTH SCROLL ── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ── CONTACT FORM ── */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Visual feedback
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
            </svg>
            Scheduling...
        `;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        // Extract form data
        const formData = new FormData(form);
        const data = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            message: formData.get('message')
        };

        try {
            // Send request to Vercel Serverless Function
            const response = await fetch('/api/appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to request appointment');
            }

            // Success feedback
            submitBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Appointment Requested!
            `;
            submitBtn.style.background = 'hsl(145, 35%, 45%)';
            submitBtn.style.opacity = '1';

            setTimeout(() => {
                form.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);

        } catch (error) {
            console.error('Submission error details:', error.message);

            // Error feedback
            submitBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Error - Try Again
            `;
            submitBtn.style.background = '#e74c3c';
            submitBtn.style.opacity = '1';

            // Show exact error in console for debugging
            console.error('Full error:', error);

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        }
    });
}

/* ── PARALLAX EFFECT (subtle) ── */
(function initParallax() {
    const hero = document.querySelector('.hero-bg-image');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
            hero.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
    }, { passive: true });
})();

/* ── SPLINE 3D HELPER ──
   Utility function to load a Spline 3D scene into any container.
   Usage: 
     loadSplineScene('heroSpline', 'https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode');
   
   Make sure to uncomment the Spline viewer script tag in index.html first:
     <script type="module" src="https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js"></script>
*/
function loadSplineScene(containerId, sceneUrl, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Spline container #${containerId} not found.`);
        return;
    }

    const viewer = document.createElement('spline-viewer');
    viewer.setAttribute('url', sceneUrl);

    // Apply optional settings
    if (options.loading) viewer.setAttribute('loading-anim', options.loading);
    if (options.hint === false) viewer.setAttribute('hint', 'false');

    // Style overrides
    Object.assign(viewer.style, {
        width: '100%',
        height: '100%',
        ...(options.style || {})
    });

    container.appendChild(viewer);

    // Re-enable pointer events on the container
    container.style.pointerEvents = 'auto';

    return viewer;
}

/* ── EXAMPLE: Load Spline scenes on page load ──
   Uncomment and update URLs to activate 3D models:

   loadSplineScene('heroSpline', 'https://prod.spline.design/xxxxx/scene.splinecode');
   loadSplineScene('serviceSpline1', 'https://prod.spline.design/xxxxx/scene.splinecode');
   loadSplineScene('impactSpline', 'https://prod.spline.design/xxxxx/scene.splinecode', {
       style: { opacity: '0.15' }
   });
*/

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
