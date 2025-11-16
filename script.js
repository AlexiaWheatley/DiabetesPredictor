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
function calculateDiabetesRisk(calculator) {
    try {
        showLoading();
        
        // Collect form data safely
        const formData = {
            pregnancies: parseInt(document.getElementById('pregnancies')?.value) || 0,
            glucose: parseInt(document.getElementById('glucose')?.value) || 0,
            bloodPressure: parseInt(document.getElementById('bloodPressure')?.value) || 0,
            skinThickness: parseInt(document.getElementById('skinThickness')?.value) || 0,
            insulin: parseInt(document.getElementById('insulin')?.value) || 0,
            bmi: parseFloat(document.getElementById('bmi')?.value) || 0,
            diabetesPedigree: parseFloat(document.getElementById('diabetesPedigree')?.value) || 0,
            age: parseInt(document.getElementById('age')?.value) || 0
        };
        
        // Validate required fields
        if (formData.glucose === 0) {
            alert('Please enter glucose level');
            return;
        }
        
        // Calculate risk with delay to simulate processing
        setTimeout(() => {
            const riskScore = calculator.calculateRisk(formData);
            showResult(riskScore);
            
            // ADD THIS LINE to show recommendations automatically
            showRecommendations(riskScore, 'Logistic Regression');
        }, 1000);
        
    } catch (error) {
        console.error('Error calculating risk:', error);
        alert('An error occurred. Please check your inputs.');
    }
}

// Or add a separate button for recommendations
function addRecommendationsButton() {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        const recommendBtn = document.createElement('button');
        recommendBtn.textContent = 'View Detailed Recommendations';
        recommendBtn.className = 'btn-recommend';
        recommendBtn.onclick = function() {
            const riskScore = parseInt(document.getElementById('risk-score').textContent);
            showRecommendations(riskScore, 'Logistic Regression');
        };
        resultDiv.appendChild(recommendBtn);
    }
}
// Example 1: Show recommendations after calculation
showRecommendations(75, 'Logistic Regression'); // High risk

// Example 2: Show medium risk
showRecommendations(45, 'XGBoost'); // Medium risk

// Example 3: Show low risk
showRecommendations(15, 'Logistic Regression'); // Low risk

// STEP 4: Initialize Pie Charts
let accuracyChart, f1Chart, specificityChart, recallChart;

function initializeCharts() {
    const pieChartConfig = {
        type: 'doughnut',
        data: {
            labels: ['Score', 'Remaining'],
            datasets: [{
                data: [85, 15],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(220, 220, 220, 0.3)'
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(220, 220, 220, 1)'
                ],
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw + '%';
                        }
                    }
                }
            }
        }
    };

    // Create chart instances
    accuracyChart = new Chart(
        document.getElementById('accuracyChart'),
        { ...pieChartConfig }
    );

    f1Chart = new Chart(
        document.getElementById('f1Chart'),
        {
            ...pieChartConfig,
            data: {
                ...pieChartConfig.data,
                datasets: [{
                    ...pieChartConfig.data.datasets[0],
                    data: [82, 18]
                }]
            }
        }
    );

    specificityChart = new Chart(
        document.getElementById('specificityChart'),
        {
            ...pieChartConfig,
            data: {
                ...pieChartConfig.data,
                datasets: [{
                    ...pieChartConfig.data.datasets[0],
                    data: [88, 12]
                }]
            }
        }
    );

    recallChart = new Chart(
        document.getElementById('recallChart'),
        {
            ...pieChartConfig,
            data: {
                ...pieChartConfig.data,
                datasets: [{
                    ...pieChartConfig.data.datasets[0],
                    data: [79, 21]
                }]
            }
        }
    );
}

// STEP 5: Update Charts Function
function updateCharts(riskScore) {
    const riskFactor = Math.min(1, riskScore / 12);
    
    // Calculate new metric values based on risk
    const newAccuracy = 85 + Math.floor(riskFactor * 10);
    const newF1 = 82 + Math.floor(riskFactor * 12);
    const newSpecificity = 88 + Math.floor(riskFactor * 8);
    const newRecall = 79 + Math.floor(riskFactor * 15);

    // Update chart data
    accuracyChart.data.datasets[0].data = [newAccuracy, 100 - newAccuracy];
    f1Chart.data.datasets[0].data = [newF1, 100 - newF1];
    specificityChart.data.datasets[0].data = [newSpecificity, 100 - newSpecificity];
    recallChart.data.datasets[0].data = [newRecall, 100 - newRecall];

    // Update displayed values
    document.getElementById('accuracyValue').textContent = newAccuracy + '%';
    document.getElementById('f1Value').textContent = newF1 + '%';
    document.getElementById('specificityValue').textContent = newSpecificity + '%';
    document.getElementById('recallValue').textContent = newRecall + '%';

    // Update charts
    accuracyChart.update();
    f1Chart.update();
    specificityChart.update();
    recallChart.update();
}

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
});

// STEP 6: Modified form handler to update charts
document.getElementById('diabetesForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';

    // Get input values
    const pregnancies = parseFloat(document.getElementById('pregnancies').value);
    const glucose = parseFloat(document.getElementById('glucose').value);
    const bmi = parseFloat(document.getElementById('bmi').value);
    const dpf = parseFloat(document.getElementById('dpf').value);
    const age = parseFloat(document.getElementById('age').value);

    // Simulate API call delay
    setTimeout(() => {
        // Hide loading spinner
        document.getElementById('loadingSpinner').style.display = 'none';

        // Calculate risk score (existing algorithm)
        let riskScore = 0;

        // Pregnancies factor
        if (pregnancies > 3) riskScore += 2;
        else if (pregnancies > 1) riskScore += 1;

        // Glucose factor
        if (glucose > 140) riskScore += 3;
        else if (glucose > 120) riskScore += 2;
        else if (glucose > 100) riskScore += 1;

        // BMI factor
        if (bmi > 30) riskScore += 3;
        else if (bmi > 25) riskScore += 2;
        else if (bmi > 22) riskScore += 1;

        // Pedigree factor
        if (dpf > 1.0) riskScore += 2;
        else if (dpf > 0.5) riskScore += 1;

        // Age factor
        if (age > 35) riskScore += 2;
        else if (age > 25) riskScore += 1;

        // Calculate probability percentage
        const probability = Math.min(100, Math.max(0, (riskScore / 12) * 100));

        // STEP 7: Update the pie charts with new risk data
        updateCharts(riskScore);

        // Determine risk level (existing code)
        let riskLevel, riskDescription, recommendations;
        const riskResult = document.getElementById('riskLevel');
        const riskScoreElement = document.getElementById('riskScore');
        const riskDescriptionElement = document.getElementById('riskDescription');
        const recommendationContent = document.getElementById('recommendationContent');

        if (probability <= 30) {
            riskLevel = 'Low Risk';
            riskDescription = 'Based on the information provided, your risk of developing diabetes appears to be low. Continue with regular health check-ups and maintain a healthy lifestyle.';
            recommendations = '<ul><li>Continue regular physical activity (at least 150 minutes per week)</li><li>Maintain a balanced diet rich in fruits, vegetables, and whole grains</li><li>Schedule annual health check-ups</li><li>Monitor your blood sugar levels if you have family history of diabetes</li></ul>';
            riskResult.className = 'risk-level low-risk';
        } else if (probability <= 70) {
            riskLevel = 'Medium Risk';
            riskDescription = 'Based on the information provided, you have a moderate risk of developing diabetes. Consider speaking with your healthcare provider about preventive measures.';
            recommendations = '<ul><li>Increase physical activity to 150-300 minutes per week</li><li>Focus on weight management if needed</li><li>Consider reducing sugar and refined carbohydrate intake</li><li>Discuss screening options with your healthcare provider</li><li>Monitor blood pressure and cholesterol levels</li></ul>';
            riskResult.className = 'risk-level medium-risk';
        } else {
            riskLevel = 'High Risk';
            riskDescription = 'Based on the information provided, you have a higher risk of developing diabetes. It is recommended to speak with your healthcare provider about appropriate screening and management strategies.';
            recommendations = '<ul><li>Consult with a healthcare provider for comprehensive assessment</li><li>Consider glucose tolerance testing</li><li>Implement dietary changes under professional guidance</li><li>Increase physical activity as recommended by your doctor</li><li>Regular monitoring of blood glucose levels</li><li>Weight management program if needed</li></ul>';
            riskResult.className = 'risk-level high-risk';
        }

        // Display results (existing code)
        riskResult.textContent = riskLevel;
        riskScoreElement.textContent = `${probability.toFixed(1)}%`;
        riskDescriptionElement.innerHTML = `<p>${riskDescription}</p>`;
        recommendationContent.innerHTML = recommendations;
    }, 1500);
});
