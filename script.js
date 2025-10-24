// Navigation and Page Management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    
    // Initialize calculator
    if (typeof DiabetesCalculator !== 'undefined') {
        window.calculator = new DiabetesCalculator();
    }
});

function initNavigation() {
    // Handle navigation clicks
    const navLinks = document.querySelectorAll('.nav-link, .nav-button');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('href').replace('#', '');
            showPage(targetPage);
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(nav => {
                nav.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Show home page by default
    showPage('home');
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Mobile menu toggle (optional enhancement)
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
});
