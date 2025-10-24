document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('diabetesForm');
    const riskLevel = document.getElementById('riskLevel');
    const riskScore = document.getElementById('riskScore');
    const riskProbability = document.getElementById('riskProbability');
    const riskDescription = document.getElementById('riskDescription');
    const recommendationContent = document.getElementById('recommendationContent');
    
    // Test backend connection on load
    testBackendConnection();
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        showLoadingState();
        
        try {
            // Collect form data
            const formData = {
                pregnancies: document.getElementById('pregnancies').value,
                glucose: document.getElementById('glucose').value,
                bmi: document.getElementById('bmi').value,
                diabetespedigreefunction: document.getElementById('dpf').value, // Note: lowercase to match Python
                age: document.getElementById('age').value
            };
            
            console.log("📤 Sending data to server:", formData);
            
            // Send to Python backend
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`Server error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log("📥 Received result from server:", result);
            
            if (result.success) {
                // Display results
                displayResults(result.risk_score, result.risk_level);
                
                // Show recommendations modal
                setTimeout(() => {
                    showRecommendations(result.risk_score, result.model_used || 'XGBoost');
                }, 500);
                
            } else {
                throw new Error(result.error || 'Unknown error from server');
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            displayErrorState(error.message);
        }
    });
});

function validateForm() {
    const glucose = document.getElementById('glucose').value;
    const bmi = document.getElementById('bmi').value;
    const age = document.getElementById('age').value;
    
    if (!glucose || !bmi || !age) {
        alert('Please fill in all required fields: Glucose, BMI, and Age');
        return false;
    }
    
    if (glucose < 0 || glucose > 300) {
        alert('Please enter a valid glucose level between 0 and 300 mg/dL');
        return false;
    }
    
    if (bmi < 10 || bmi > 60) {
        alert('Please enter a valid BMI between 10 and 60');
        return false;
    }
    
    if (age < 21 || age > 100) {
        alert('Please enter a valid age between 21 and 100');
        return false;
    }
    
    return true;
}

function showLoadingState() {
    const riskLevel = document.getElementById('riskLevel');
    const riskScore = document.getElementById('riskScore');
    const riskProbability = document.getElementById('riskProbability');
    const riskDescription = document.getElementById('riskDescription');
    
    riskScore.textContent = 'Calculating...';
    riskLevel.textContent = 'Analyzing';
    riskProbability.textContent = 'Please wait';
    riskLevel.style.color = '#2E86AB'; // Primary blue
    riskDescription.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Processing your data with machine learning model...</p>';
}

function displayResults(score, level) {
    const riskLevel = document.getElementById('riskLevel');
    const riskScore = document.getElementById('riskScore');
    const riskProbability = document.getElementById('riskProbability');
    const riskDescription = document.getElementById('riskDescription');
    
    // Update main display
    riskScore.textContent = score + '%';
    riskLevel.textContent = level;
    riskProbability.textContent = score + '% probability';
    
    // Color coding and descriptions
    if (level === 'Low Risk') {
        riskLevel.style.color = '#06D6A0';
        riskDescription.innerHTML = `
            <p>🎉 <strong>Excellent!</strong> Your diabetes risk is relatively low based on the provided information.</p>
            <p>Continue maintaining a healthy lifestyle with regular exercise and balanced nutrition.</p>
        `;
    } else if (level === 'Medium Risk') {
        riskLevel.style.color = '#FFD166';
        riskDescription.innerHTML = `
            <p>⚠️ <strong>Moderate Risk</strong> - You have some risk factors for diabetes.</p>
            <p>Consider lifestyle modifications, regular monitoring, and consult with a healthcare provider.</p>
        `;
    } else {
        riskLevel.style.color = '#EF476F';
        riskDescription.innerHTML = `
            <p>🚨 <strong>High Risk</strong> - Your results indicate elevated diabetes risk.</p>
            <p>We strongly recommend consulting with a healthcare professional for comprehensive assessment and guidance.</p>
        `;
    }
    
    // Update recommendations
    updateRecommendations(score, level);
}

function displayErrorState(errorMessage) {
    const riskLevel = document.getElementById('riskLevel');
    const riskScore = document.getElementById('riskScore');
    const riskProbability = document.getElementById('riskProbability');
    const riskDescription = document.getElementById('riskDescription');
    
    riskScore.textContent = 'Error';
    riskLevel.textContent = 'System Error';
    riskProbability.textContent = 'Please try again';
    riskLevel.style.color = '#EF476F';
    riskDescription.innerHTML = `
        <p>❌ Unable to process your request.</p>
        <p><strong>Error:</strong> ${errorMessage}</p>
        <p>Please ensure the Python server is running on port 5000 and try again.</p>
    `;
}

function updateRecommendations(score, level) {
    const recommendationContent = document.getElementById('recommendationContent');
    
    let recommendations = '';
    
    if (level === 'Low Risk') {
        recommendations = `
            <div class="recommendation-item">
                <i class="fas fa-check-circle" style="color: #06D6A0;"></i>
                <strong>Maintain Healthy Lifestyle</strong>
                <p>Continue your current healthy habits including regular exercise and balanced diet.</p>
            </div>
            <div class="recommendation-item">
                <i class="fas fa-utensils" style="color: #06D6A0;"></i>
                <strong>Balanced Nutrition</strong>
                <p>Focus on whole foods, plenty of vegetables, and limit processed sugars.</p>
            </div>
            <div class="recommendation-item">
                <i class="fas fa-heartbeat" style="color: #06D6A0;"></i>
                <strong>Regular Check-ups</strong>
                <p>Continue with annual health screenings and monitor any family history changes.</p>
            </div>
        `;
    } else if (level === 'Medium Risk') {
        recommendations = `
            <div class="recommendation-item">
                <i class="fas fa-running" style="color: #FFD166;"></i>
                <strong>Increase Physical Activity</strong>
                <p>Aim for 150-300 minutes of moderate exercise per week.</p>
            </div>
            <div class="recommendation-item">
                <i class="fas fa-apple-alt" style="color: #FFD166;"></i>
                <strong>Dietary Improvements</strong>
                <p>Reduce sugar intake, increase fiber, and focus on portion control.</p>
            </div>
            <div class="recommendation-item">
                <i class="fas fa-user-md" style="color: #FFD166;"></i>
                <strong>Medical Consultation</strong>
                <p>Schedule an appointment with your healthcare provider for further assessment.</p>
            </div>
        `;
    } else {
        recommendations = `
            <div class="recommendation-item urgent">
                <i class="fas fa-exclamation-triangle" style="color: #EF476F;"></i>
                <strong>Immediate Medical Attention</strong>
                <p>Consult with a healthcare professional as soon as possible for comprehensive evaluation.</p>
            </div>
            <div class="recommendation-item">
                <i class="fas fa-file-medical" style="color: #EF476F;"></i>
                <strong>Comprehensive Testing</strong>
                <p>Request HbA1c, glucose tolerance tests, and lipid profile from your doctor.</p>
            </div>
            <div class="recommendation-item">
                <i class="fas fa-hand-holding-medical" style="color: #EF476F;"></i>
                <strong>Lifestyle Intervention</strong>
                <p>Consider joining a diabetes prevention program and work with a dietitian.</p>
            </div>
        `;
    }
    
    recommendationContent.innerHTML = recommendations;
}

async function testBackendConnection() {
    try {
        const response = await fetch('http://localhost:5000/health');
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Backend connection successful:', data);
            
            // Optional: Display model status
            if (data.model_loaded) {
                console.log('✅ ML Model is loaded and ready');
            } else {
                console.log('⚠️ Using fallback prediction method');
            }
        } else {
            console.log('❌ Backend connection failed');
        }
    } catch (error) {
        console.log('❌ Backend not reachable - make sure Flask server is running on port 5000');
        console.log('💡 Run: python app.py in your terminal');
    }
}

// Add some CSS for recommendation items
const style = document.createElement('style');
style.textContent = `
    .recommendation-item {
        padding: 1rem;
        margin: 0.5rem 0;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        border-left: 4px solid #2E86AB;
    }
    .recommendation-item.urgent {
        background: rgba(239, 71, 111, 0.1);
        border-left-color: #EF476F;
    }
    .recommendation-item i {
        margin-right: 0.5rem;
    }
`;
document.head.appendChild(style);
