// Theme Toggle
feather.replace();
const themeToggle = document.querySelector('.theme-toggle');
const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';

if (activeTheme === 'dark') {
    themeToggle.innerHTML = '<i data-feather="sun"></i>';
    feather.replace();
}

themeToggle.addEventListener('click', function () {
    let theme = 'light';

    // Add the transition class
    document.body.classList.add('theme-transition');

    if (document.documentElement.getAttribute('data-theme') !== 'dark') {
        theme = 'dark';
        themeToggle.innerHTML = '<i data-feather="sun"></i>';
    } else {
        themeToggle.innerHTML = '<i data-feather="moon"></i>';
    }
    feather.replace();
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('theme', theme);

    // Remove the transition class after 0.5s
    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 500);
});

// Lightbox functionality
document.addEventListener('DOMContentLoaded', function () {
    // Create lightbox modal element
    const lightboxModal = document.createElement('div');
    lightboxModal.className = 'lightbox-modal';
    lightboxModal.innerHTML = '<span class="lightbox-close">&times;</span><img src="" alt="">';
    document.body.appendChild(lightboxModal);

    const lightboxImg = lightboxModal.querySelector('img');
    const closeBtn = lightboxModal.querySelector('.lightbox-close');

    // Find all images wrapped in links with class 'lightbox-thumbnail'
    const thumbnails = document.querySelectorAll('a.lightbox-thumbnail');

    thumbnails.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const imgSrc = this.getAttribute('href');
            const imgAlt = this.querySelector('img')?.getAttribute('alt') || '';

            lightboxImg.src = imgSrc;
            lightboxImg.alt = imgAlt;
            lightboxModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close lightbox when clicking on background or close button
    lightboxModal.addEventListener('click', function (e) {
        if (e.target === lightboxModal || e.target === closeBtn) {
            closeLightbox();
        }
    });

    // Close lightbox with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    // Mobile Menu
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

    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
        mobileCloseBtn.addEventListener('click', closeMobileMenu);
        mobileBackdrop.addEventListener('click', closeMobileMenu);
    }

    // Back to Top
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Responsive Tables
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive-wrapper';
        wrapper.style.overflowX = 'auto';
        wrapper.style.marginBottom = 'var(--space-lg)';

        
        table.style.marginBottom = '0';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });

    // Code Block Copy Button
    const codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach(block => {
        // Ignore if it's already processed or doesn't have a code tag
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
                if (typeof feather !== 'undefined') feather.replace();
                
                setTimeout(() => {
                    button.innerHTML = '<i data-feather="copy"></i>';
                    button.classList.remove('copied');
                    if (typeof feather !== 'undefined') feather.replace();
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });

        block.appendChild(button);
    });

    // AJAX Pagination
    function initAjaxPagination() {
        const container = document.getElementById('pagination-container');
        if (!container) return;

        container.addEventListener('click', function(e) {
            // Find closest link
            const link = e.target.closest('a');
            
            // If there's no link, or it's disabled, or it's NOT inside the pagination nav, ignore it
            if (!link || !link.href || link.classList.contains('disabled') || !link.closest('.pagination')) return;

            // Only intercept internal pagination links
            const url = new URL(link.href);
            if (url.origin !== window.location.origin) return;

            e.preventDefault();
            loadPage(url.href);
        });
    }

    async function loadPage(url, isPopState = false) {
        const container = document.getElementById('pagination-container');
        if (!container) return;

        container.classList.add('loading');

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const text = await response.text();
            
            // Parse the new HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            const newContainer = doc.getElementById('pagination-container');
            if (newContainer) {
                container.innerHTML = newContainer.innerHTML;
                
                // Update history if not triggered by back/forward button
                if (!isPopState) {
                    window.history.pushState({ path: url }, '', url);
                }
                
                // Re-initialize feather icons
                if (typeof feather !== 'undefined') feather.replace();
                
                // Scroll to top of container
                const headerOffset = 80;
                const elementPosition = container.parentElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        } catch (error) {
            console.error('Pagination fetch error:', error);
            // Fallback to standard navigation on error
            window.location.href = url;
        } finally {
            container.classList.remove('loading');
        }
    }

    // Handle back/forward buttons
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.path) {
            loadPage(e.state.path, true);
        } else {
            loadPage(window.location.href, true);
        }
    });

    // Initialize initial state in history
    if (document.getElementById('pagination-container')) {
        window.history.replaceState({ path: window.location.href }, '', window.location.href);
        initAjaxPagination();
    }

    if (typeof feather !== 'undefined') feather.replace();
});
