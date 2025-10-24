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

// Recommendation System
function showRecommendations(riskScore, algorithm) {
    const modal = document.getElementById('recommendationsModal');
    const riskLevelText = document.getElementById('riskLevelText');
    const riskBadge = document.getElementById('riskBadge');
    
    // Hide all recommendation categories first
    document.getElementById('highRiskRecs').style.display = 'none';
    document.getElementById('mediumRiskRecs').style.display = 'none';
    document.getElementById('lowRiskRecs').style.display = 'none';
    
    // Determine risk category and show appropriate recommendations
    let riskCategory, categoryElement;
    
    if (riskScore >= 70) {
        riskCategory = 'High Risk';
        categoryElement = document.getElementById('highRiskRecs');
        riskBadge.className = 'risk-badge high-risk';
    } else if (riskScore >= 30) {
        riskCategory = 'Medium Risk';
        categoryElement = document.getElementById('mediumRiskRecs');
        riskBadge.className = 'risk-badge medium-risk';
    } else {
        riskCategory = 'Low Risk';
        categoryElement = document.getElementById('lowRiskRecs');
        riskBadge.className = 'risk-badge low-risk';
    }
    
    // Update UI
    riskLevelText.textContent = riskCategory;
    categoryElement.style.display = 'block';
    
    // Update risk scores in each category
    document.getElementById('highRiskScore').textContent = riskScore + '%';
    document.getElementById('mediumRiskScore').textContent = riskScore + '%';
    document.getElementById('lowRiskScore').textContent = riskScore + '%';
    
    // Show modal
    modal.style.display = 'block';
    
    // Add algorithm info to recommendations
    addAlgorithmInfo(algorithm, riskScore);
}

function closeRecommendations() {
    document.getElementById('recommendationsModal').style.display = 'none';
}

function printRecommendations() {
    const modalContent = document.querySelector('.modal-content').cloneNode(true);
    const printWindow = window.open('', '_blank');
    
    // Remove action buttons for print
    const actionButtons = modalContent.querySelector('.action-buttons');
    if (actionButtons) actionButtons.remove();
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Diabetes Risk Recommendations</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .risk-header { text-align: center; margin-bottom: 30px; }
                    .risk-badge { padding: 10px 20px; border-radius: 20px; font-weight: bold; }
                    .risk-category { margin-bottom: 30px; padding: 20px; border-radius: 10px; }
                    .rec-item { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${modalContent.innerHTML}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function addAlgorithmInfo(algorithm, score) {
    // You can add algorithm-specific recommendations here
    console.log(`Algorithm: ${algorithm}, Score: ${score}%`);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('recommendationsModal');
    if (event.target === modal) {
        closeRecommendations();
    }
}

// Close modal with escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeRecommendations();
    }
});
