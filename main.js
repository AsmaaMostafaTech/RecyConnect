document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    const body = document.body;
    const header = document.querySelector('.header');

    // Toggle mobile menu
    function toggleMenu() {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        body.classList.toggle('no-scroll');
        
        // Toggle aria-expanded attribute for accessibility
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
        menuToggle.setAttribute('aria-expanded', !isExpanded);
    }

    // Close mobile menu when clicking outside
    function closeMenu(event) {
        if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            body.classList.remove('no-scroll');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    }

    // Add event listeners
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            body.classList.remove('no-scroll');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', closeMenu);

    // Add scroll effect for header
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scrolled');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scrolled-down')) {
            // Scroll down
            header.classList.add('scrolled-down');
            header.classList.remove('scrolled-up');
        } else if (currentScroll < lastScroll && header.classList.contains('scrolled-down')) {
            // Scroll up
            header.classList.add('scrolled-up');
            header.classList.remove('scrolled-down');
        }
        
        header.classList.add('scrolled');
        lastScroll = currentScroll;
    });
});

// Sidebar toggle (mobile) and collapse (desktop)
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const collapseBtn = document.getElementById('sidebar-collapse-btn');
    const body = document.body;

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
            const expanded = sidebar.classList.contains('active');
            sidebarToggle.setAttribute('aria-expanded', expanded);
            body.classList.toggle('no-scroll', expanded);
        });
    }

    if (collapseBtn) {
        collapseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            body.classList.toggle('sidebar-collapsed');
            const icon = collapseBtn.querySelector('i');
            if (icon) icon.classList.toggle('fa-angle-right');
            // Toggle direction for visual feedback
            if (icon) icon.classList.toggle('fa-angle-left');
        });
    }

    // Close mobile sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar) return;
        if (sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !e.target.closest('#sidebar-toggle')) {
                sidebar.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        }
    });
});

// Animate stats counter
function animateCounter(element, start, end, duration = 2000) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('stat-number')) {
                const count = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, 0, count);
                observer.unobserve(entry.target); // Only animate once
            } else {
                entry.target.classList.add('animate');
            }
        }
    });
}, observerOptions);

// Observe all elements with data-animate attribute
document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
});

// Observe all stat numbers
document.querySelectorAll('.stat-number').forEach(stat => {
    observer.observe(stat);
});

// Header scroll effect
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scrolled-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scrolled-down')) {
        // Scroll down
        header.classList.remove('scrolled-up');
        header.classList.add('scrolled-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scrolled-down')) {
        // Scroll up
        header.classList.remove('scrolled-down');
        header.classList.add('scrolled-up');
    }
    
    lastScroll = currentScroll;
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Initialize AOS (Animate On Scroll) for other elements
document.addEventListener('DOMContentLoaded', () => {
    // Add any initialization code here
    console.log('RecyConnect website initialized');
});

// Observe all elements that need animation
document.querySelectorAll('.stat-number, .stat-card, .hero-content, .hero-image').forEach(el => {
    observer.observe(el);
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});

// Add animation classes on scroll
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const heroSection = document.querySelector('.hero');
    
    if (scrollPosition > 100) {
        document.querySelector('.header').classList.add('scrolled');
    } else {
        document.querySelector('.header').classList.remove('scrolled');
    }
});

// Initialize AOS (Animate On Scroll) for future animations
document.addEventListener('DOMContentLoaded', () => {
    // Add any initialization code here
});

// Page transition handling (fade out on internal navigation)
document.addEventListener('DOMContentLoaded', () => {
    // start hidden then fade in
    document.body.classList.add('page-transition', 'page-hidden');
    setTimeout(() => {
        document.body.classList.remove('page-hidden');
    }, 40);

    // Intercept same-origin link clicks and animate
    document.addEventListener('click', (e) => {
        const a = e.target.closest && e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href');
        const target = a.getAttribute('target');
        if (!href) return;
        // ignore anchors, mailto, tel, external links, or links with target
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || target === '_blank') return;
        // only same-origin / relative links
        try {
            const url = new URL(href, window.location.href);
            if (url.origin !== window.location.origin) return;
        } catch (err) {
            return; // malformed or JS link
        }

        // allow JavaScript handlers to run if they call preventDefault
        if (e.defaultPrevented) return;

        e.preventDefault();
        const navigate = () => { window.location.href = href; };
        document.body.classList.add('page-hidden');
        setTimeout(navigate, 260);
    });
});
