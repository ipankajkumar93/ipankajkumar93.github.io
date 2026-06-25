// ── Helpers ────────────────────────────────────────────────────────────────
function replaceFeather() {
    if (typeof feather !== 'undefined') feather.replace();
}

// ── Theme Toggle ────────────────────────────────────────────────────────────
// Runs early (outside DOMContentLoaded) so the icon matches the current theme
// without waiting for the full DOM to parse.
const themeToggle = document.querySelector('.theme-toggle');

if (themeToggle) {
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    if (activeTheme === 'dark') {
        themeToggle.innerHTML = '<i data-feather="sun"></i>';
    }

    themeToggle.addEventListener('click', function () {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const theme = isDark ? 'light' : 'dark';

        // Opt-in transition only during toggle
        document.body.classList.add('theme-transition');
        themeToggle.innerHTML = isDark
            ? '<i data-feather="moon"></i>'
            : '<i data-feather="sun"></i>';

        replaceFeather();
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
        localStorage.setItem('theme', theme);

        setTimeout(() => document.body.classList.remove('theme-transition'), 500);
    });
}

// ── DOM-dependent functionality ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

    // ── Lightbox Modal Setup ────────────────────────────────────────────────
    const lightboxModal = document.createElement('div');
    lightboxModal.className = 'lightbox-modal';
    lightboxModal.innerHTML = '<span class="lightbox-close">&times;</span><img src="" alt="">';
    document.body.appendChild(lightboxModal);

    const lightboxImg = lightboxModal.querySelector('img');
    const lightboxCloseBtn = lightboxModal.querySelector('.lightbox-close');

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    lightboxModal.addEventListener('click', function (e) {
        if (e.target === lightboxModal || e.target === lightboxCloseBtn) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Event delegation for lightbox links
    document.body.addEventListener('click', function (e) {
        const link = e.target.closest('a.lightbox-thumbnail');
        if (link) {
            e.preventDefault();
            lightboxImg.src = link.getAttribute('href');
            lightboxImg.alt = link.querySelector('img')?.getAttribute('alt') || '';
            lightboxModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    // ── Mobile Menu ─────────────────────────────────────────────────────────
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    const navItems = document.querySelector('.nav-items');
    const mobileBackdrop = document.querySelector('.mobile-menu-backdrop');

    function openMobileMenu() {
        navItems.classList.add('active');
        mobileBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        navItems.classList.remove('active');
        mobileBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
        mobileCloseBtn.addEventListener('click', closeMobileMenu);
        mobileBackdrop.addEventListener('click', closeMobileMenu);
    }

    // ── Back to Top ─────────────────────────────────────────────────────────
    const backToTop = document.getElementById('back-to-top');

    if (backToTop) {
        // RAF-throttled scroll listener — avoids layout thrashing
        let scrollTicking = false;
        window.addEventListener('scroll', function () {
            if (!scrollTicking) {
                requestAnimationFrame(function () {
                    backToTop.classList.toggle('visible', window.scrollY > 100);
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ── Re-initializable Content ────────────────────────────────────────────
    function initContent() {
        replaceFeather();

        // ── Responsive Tables ───────────────────────────────────────────────────
        document.querySelectorAll('main table').forEach(table => {
            if (table.parentNode.classList.contains('table-responsive-wrapper')) return;
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive-wrapper';
            table.style.marginBottom = '0';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });

        // ── Code Block Copy Button ──────────────────────────────────────────────
        document.querySelectorAll('main pre').forEach(block => {
            if (block.querySelector('.copy-code-btn') || !block.querySelector('code')) return;

            const button = document.createElement('button');
            button.className = 'copy-code-btn';
            button.setAttribute('aria-label', 'Copy to clipboard');
            button.setAttribute('title', 'Copy to clipboard');
            button.innerHTML = '<i data-feather="copy"></i>';

            button.addEventListener('click', () => {
                const code = block.querySelector('code');
                if (!code) return;

                navigator.clipboard.writeText(code.textContent.trimEnd()).then(() => {
                    button.innerHTML = '<i data-feather="check"></i>';
                    button.classList.add('copied');
                    replaceFeather();

                    setTimeout(() => {
                        button.innerHTML = '<i data-feather="copy"></i>';
                        button.classList.remove('copied');
                        replaceFeather();
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });

            block.appendChild(button);
        });

        replaceFeather();
    }

    initContent();

    // ── SPA Navigation ──────────────────────────────────────────────────────
    let currentPageController = null;

    async function loadPage(url, isPopState = false) {
        const mainEl = document.querySelector('main');
        if (!mainEl) return;

        if (currentPageController) {
            currentPageController.abort();
        }
        currentPageController = new AbortController();

        mainEl.classList.add('loading');

        try {
            const [response] = await Promise.all([
                fetch(url, { signal: currentPageController.signal }),
                new Promise(resolve => setTimeout(resolve, 250))
            ]);
            
            if (!response.ok) throw new Error('Network response was not ok');

            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const newMain = doc.querySelector('main');
            if (newMain) {
                mainEl.innerHTML = newMain.innerHTML;

                if (doc.title) {
                    document.title = doc.title;
                }

                // Update meta tags and canonical links for SEO/sharing extensions
                const metaSelector = 'meta[name]:not([name="viewport"]):not([name="theme-color"]):not([name="referrer"]), meta[property], link[rel="canonical"]';
                
                const headElementsToRemove = document.head.querySelectorAll(metaSelector);
                headElementsToRemove.forEach(el => el.remove());

                const newHeadElements = doc.head.querySelectorAll(metaSelector);
                newHeadElements.forEach(el => document.head.appendChild(el.cloneNode(true)));

                if (!isPopState) {
                    if (window.location.href !== url) {
                        window.history.pushState({ path: url }, '', url);
                    }
                }

                // Manually track ALL page views since we disabled auto-track
                if (typeof umami !== 'undefined') {
                    umami.track(props => ({ 
                        ...props, 
                        url: window.location.pathname + window.location.search, 
                        title: document.title 
                    }));
                }

                initContent();

                // Scroll to top or to hash
                const hash = new URL(url).hash;
                if (hash) {
                    const target = document.querySelector(hash);
                    if (target) {
                        const headerOffset = 80;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.scrollY - headerOffset;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                } else {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') return; // Intentional cancellation
            console.error('SPA fetch error:', error);
            window.location.href = url; // Fallback to full navigation
        } finally {
            mainEl.classList.remove('loading');
            currentPageController = null;
        }
    }

    function initSpaNavigation() {
        document.body.addEventListener('click', function (e) {
            const link = e.target.closest('a');
            if (!link || !link.href) return;

            // Let browser handle special link types natively
            if (link.target === '_blank' || link.hasAttribute('download') || link.rel === 'external') return;

            const url = new URL(link.href);

            // Only intercept same-origin HTTP(S) navigations
            if (url.origin !== window.location.origin) return;
            if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

            // Let browser handle hash-only navigation on the same page
            if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;

            // Let browser handle non-HTML assets natively
            const nonHtmlExts = ['pdf', 'zip', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'svg', 'txt', 'json', 'woff', 'woff2'];
            const ext = url.pathname.includes('.') ? url.pathname.split('.').pop().toLowerCase() : null;
            if (ext && nonHtmlExts.includes(ext)) return;

            // Open Atom/RSS feeds in a new tab instead of navigating
            if (ext === 'xml') {
                e.preventDefault();
                window.open(url.href, '_blank');
                return;
            }



            e.preventDefault();

            // Close mobile menu if open
            const navItems = document.querySelector('.nav-items');
            if (navItems && navItems.classList.contains('active')) {
                const closeBtn = document.querySelector('.mobile-close-btn');
                if (closeBtn) closeBtn.click();
            }

            loadPage(url.href);
        });

        // Handle back/forward buttons
        window.addEventListener('popstate', function (e) {
            loadPage(e.state?.path ?? window.location.href, true);
        });

        window.history.replaceState({ path: window.location.href }, '', window.location.href);
    }

    initSpaNavigation();

    // Initial page load tracking for Umami (since auto-track is false)
    const trackInitial = () => {
        if (typeof umami !== 'undefined') {
            umami.track(props => ({ 
                ...props, 
                url: window.location.pathname + window.location.search, 
                title: document.title 
            }));
        } else {
            setTimeout(trackInitial, 300);
        }
    };
    setTimeout(trackInitial, 300);
});