// Main JavaScript for website functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the diabetes calculator
    const calculator = new DiabetesCalculator();
    
    // Smooth scrolling for navigation links
    initSmoothScrolling();
    
    // Mobile menu functionality
    initMobileMenu();
    
    // Form submission handler
    initFormHandler();
    
    // Initialize feature bars
    calculator.generateFeatureBars();
});

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

function initFormHandler() {
    const form = document.getElementById('diabetesForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // The actual calculation is handled in calculator.js
        });
    }
}

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'var(--white)';
        navbar.style.backdropFilter = 'none';
    }
});
