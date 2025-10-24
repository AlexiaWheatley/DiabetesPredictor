class DiabetesCalculator {
    constructor() {
        this.features = [
            'pregnancies', 'glucose', 'bloodPressure', 
            'skinThickness', 'insulin', 'bmi', 
            'diabetesPedigree', 'age'
        ];
    }

    calculateRisk(formData) {
        // Simple risk calculation (replace with actual ML model)
        let score = 0;
        
        // Glucose level weighting
        if (formData.glucose > 140) score += 30;
        else if (formData.glucose > 100) score += 15;
        
        // BMI weighting
        if (formData.bmi > 30) score += 25;
        else if (formData.bmi > 25) score += 15;
        
        // Age weighting
        if (formData.age > 45) score += 20;
        else if (formData.age > 35) score += 10;
        
        // Other factors
        if (formData.bloodPressure > 130) score += 15;
        if (formData.diabetesPedigree > 0.5) score += 10;
        
        return Math.min(score, 100);
    }

    getRiskLevel(score) {
        if (score < 30) return 'Low';
        if (score < 60) return 'Medium';
        return 'High';
    }
}
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
    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.querySelector('.hamburger-menu');
    const closeMenu = document.querySelector('.close-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mainContent = document.querySelector('.main-content');

    // Toggle sidebar
    hamburger.addEventListener('click', function() {
        sidebar.classList.add('active');
    });

    closeMenu.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('href').replace('#', '');
            
            // Update active nav link
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            showPage(targetPage);
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // Close sidebar when clicking on main content
    mainContent.addEventListener('click', function() {
        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
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
