document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Calculator.js loaded");
    
    const form = document.getElementById('diabetesForm');
    
    if (!form) {
        console.error("❌ Form not found! Check if diabetesForm exists");
        return;
    }

    // Test backend connection on load
    testBackendConnection();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("✅ Form submitted");
        
        await calculateRisk();
    });
});

// Safe element getter function
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Element with id '${id}' not found`);
    }
    return element;
}

async function calculateRisk() {
    try {
        showLoadingState();
        
        // Get form values
        const formData = {
            pregnancies: document.getElementById('pregnancies').value,
            glucose: document.getElementById('glucose').value,
            bmi: document.getElementById('bmi').value,
            dpf: document.getElementById('dpf').value,
            age: document.getElementById('age').value
        };

        console.log("📤 Sending data:", formData);

        // Validate required fields
        if (!formData.glucose || !formData.bmi || !formData.age) {
            throw new Error('Please fill in Glucose, BMI, and Age fields');
        }

        // Send request to backend
        const response = await fetch('http://localhost:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        console.log("📥 Response status:", response.status);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log("📥 Response data:", result);

        if (result.success) {
            displayResults(result.risk_score, result.risk_level);
        } else {
            throw new Error(result.error || 'Unknown server error');
        }

    } catch (error) {
        console.error('❌ Calculation error:', error);
        displayErrorState(error.message);
    }
}

function showLoadingState() {
    const riskLevel = getElement('riskLevel');
    const riskScore = getElement('riskScore');
    const riskDescription = getElement('riskDescription');

    // Only update elements that exist
    if (riskLevel) riskLevel.textContent = 'Processing';
    if (riskScore) riskScore.textContent = 'Calculating...';
    
    if (riskLevel) riskLevel.style.color = '#2E86AB';
    
    if (riskDescription) {
        riskDescription.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Analyzing your health data...</p>';
    }
}

function displayResults(score, level) {
    const riskLevel = getElement('riskLevel');
    const riskScore = getElement('riskScore');
    const riskDescription = getElement('riskDescription');
    const recommendationContent = getElement('recommendationContent');

    // Only update elements that exist
    if (riskScore) riskScore.textContent = score + '%';
    if (riskLevel) riskLevel.textContent = level;

    // Set colors and messages based on risk level
    if (riskLevel) {
        switch(level) {
            case 'Low Risk':
                riskLevel.style.color = '#06D6A0';
                break;
            case 'Medium Risk':
                riskLevel.style.color = '#FFD166';
                break;
            case 'High Risk':
                riskLevel.style.color = '#EF476F';
                break;
        }
    }

    if (riskDescription) {
        switch(level) {
            case 'Low Risk':
                riskDescription.innerHTML = '<p>🎉 Your diabetes risk is low. Maintain your healthy lifestyle!</p>';
                break;
            case 'Medium Risk':
                riskDescription.innerHTML = '<p>⚠️ Moderate risk detected. Consider lifestyle improvements.</p>';
                break;
            case 'High Risk':
                riskDescription.innerHTML = '<p>🚨 High risk detected. Please consult a healthcare professional.</p>';
                break;
        }
    }

    updateRecommendations(score, level);
    
    // Show recommendations modal after successful calculation
    setTimeout(() => {
        showRecommendations(score, 'XGBoost');
    }, 1000);
}

function displayErrorState(message) {
    const riskLevel = getElement('riskLevel');
    const riskScore = getElement('riskScore');
    const riskDescription = getElement('riskDescription');

    // Only update elements that exist
    if (riskScore) riskScore.textContent = 'Error';
    if (riskLevel) riskLevel.textContent = 'System Error';
    
    if (riskLevel) riskLevel.style.color = '#EF476F';
    
    if (riskDescription) {
        riskDescription.innerHTML = `<p>❌ ${message}</p>`;
    }
}

function updateRecommendations(score, level) {
    const recommendationContent = getElement('recommendationContent');
    if (!recommendationContent) {
        console.warn('⚠️ Recommendation content element not found');
        return;
    }

    let recommendations = '';
    
    if (level === 'Low Risk') {
        recommendations = `
            <ul>
                <li>Continue regular exercise (150+ minutes/week)</li>
                <li>Maintain balanced diet with plenty of vegetables</li>
                <li>Annual health check-ups recommended</li>
                <li>Monitor family history changes</li>
            </ul>
        `;
    } else if (level === 'Medium Risk') {
        recommendations = `
            <ul>
                <li>Increase physical activity to 300 minutes/week</li>
                <li>Reduce sugar and refined carbohydrate intake</li>
                <li>Consider blood glucose monitoring</li>
                <li>Schedule appointment with healthcare provider</li>
            </ul>
        `;
    } else {
        recommendations = `
            <ul>
                <li><strong>Consult healthcare provider immediately</strong></li>
                <li>Comprehensive blood tests recommended</li>
                <li>Strict dietary modifications needed</li>
                <li>Regular glucose monitoring advised</li>
            </ul>
        `;
    }
    
    recommendationContent.innerHTML = recommendations;
}

async function testBackendConnection() {
    try {
        console.log("🔍 Testing backend connection...");
        const response = await fetch('http://localhost:5000/health');
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Backend connection successful:', data);
        } else {
            console.log('❌ Backend connection failed');
        }
    } catch (error) {
        console.log('❌ Backend not reachable:', error.message);
        console.log('💡 Run: python app.py in your terminal');
    }
}

// Make functions globally available for the recommendations modal
window.showRecommendations = function(riskScore, algorithm) {
    console.log("Showing recommendations for score:", riskScore);
    const modal = document.getElementById('recommendationsModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Update modal content based on risk score
        const riskLevelText = document.getElementById('riskLevelText');
        const riskBadge = document.getElementById('riskBadge');
        
        if (riskLevelText && riskBadge) {
            let riskCategory, categoryClass;
            
            if (riskScore >= 70) {
                riskCategory = 'High Risk';
                categoryClass = 'high-risk';
            } else if (riskScore >= 30) {
                riskCategory = 'Medium Risk';
                categoryClass = 'medium-risk';
            } else {
                riskCategory = 'Low Risk';
                categoryClass = 'low-risk';
            }
            
            riskLevelText.textContent = riskCategory;
            riskBadge.className = `risk-badge ${categoryClass}`;
            
            // Update risk scores in each category
            const highRiskScore = document.getElementById('highRiskScore');
            const mediumRiskScore = document.getElementById('mediumRiskScore');
            const lowRiskScore = document.getElementById('lowRiskScore');
            
            if (highRiskScore) highRiskScore.textContent = riskScore + '%';
            if (mediumRiskScore) mediumRiskScore.textContent = riskScore + '%';
            if (lowRiskScore) lowRiskScore.textContent = riskScore + '%';
            
            // Show only the relevant risk category
            document.getElementById('highRiskRecs').style.display = riskScore >= 70 ? 'block' : 'none';
            document.getElementById('mediumRiskRecs').style.display = (riskScore >= 30 && riskScore < 70) ? 'block' : 'none';
            document.getElementById('lowRiskRecs').style.display = riskScore < 30 ? 'block' : 'none';
        }
    } else {
        console.warn('⚠️ Recommendations modal not found');
    }
};

window.closeRecommendations = function() {
    const modal = document.getElementById('recommendationsModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('recommendationsModal');
    if (event.target === modal) {
        closeRecommendations();
    }
}
