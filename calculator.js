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
        
        // Show loading state
        showLoadingState();
        
        try {
            // Collect form data
            const formData = {
                pregnancies: document.getElementById('pregnancies').value,
                glucose: document.getElementById('glucose').value,
                bmi: document.getElementById('bmi').value,
                dpf: document.getElementById('dpf').value,
                age: document.getElementById('age').value
            };
            
            console.log("Sending data:", formData); // Debug log
            
            // Send to Python backend
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log("Received result:", result); // Debug log
            
            if (result.success) {
                // Display results
                displayResults(result.risk_score, result.risk_level);
                
                // Show recommendations modal
                showRecommendations(result.risk_score, 'XGBoost');
            } else {
                throw new Error(result.error || 'Unknown error from server');
            }
            
        } catch (error) {
            console.error('Error:', error);
            displayErrorState();
        }
    });
});

function showLoadingState() {
    const riskLevel = document.getElementById('riskLevel');
    const riskScore = document.getElementById('riskScore');
    const riskProbability = document.getElementById('riskProbability');
    
    riskScore.textContent = 'Calculating...';
    riskLevel.textContent = 'Processing';
    riskProbability.textContent = '';
    riskLevel.style.color = '#6C757D';
}

function displayResults(score, level) {
    const riskLevel = document.getElementById('riskLevel');
    const riskScore = document.getElementById('riskScore');
    const riskProbability = document.getElementById('riskProbability');
    const riskDescription = document.getElementById('riskDescription');
    const recommendationContent = document.getElementById('recommendationContent');
    
    // Update main display
    riskScore.textContent = score + '%';
    riskLevel.textContent = level;
    riskProbability.textContent = score + '% probability';
    
    // Color coding
    if (level === 'Low Risk') {
        riskLevel.style.color = '#06D6A0';
        riskDescription.innerHTML = '<p>Your diabetes risk is relatively low based on the provided information. Continue maintaining a healthy lifestyle.</p>';
    } else if (level === 'Medium Risk') {
        riskLevel.style.color = '#FFD166';
        riskDescription.innerHTML = '<p>You have a moderate risk of diabetes. Consider lifestyle modifications and regular monitoring.</p>';
    } else {
        riskLevel.style.color = '#EF476F';
        riskDescription.innerHTML = '<p>Your diabetes risk is elevated. We recommend consulting with a healthcare professional.</p>';
    }
    
    // Update recommendations
    updateRecommendations(score, level);
}

function displayErrorState() {
    const riskLevel = document.getElementById('riskLevel');
    const riskScore = document.getElementById('riskScore');
    const riskProbability = document.getElementById('riskProbability');
    const riskDescription = document.getElementById('riskDescription');
    
    riskScore.textContent = 'Error';
    riskLevel.textContent = 'Connection Failed';
    riskProbability.textContent = 'Please try again';
    riskLevel.style.color = '#EF476F';
    riskDescription.innerHTML = '<p>Unable to connect to the prediction service. Please check if the Python server is running on port 5000.</p>';
}

function updateRecommendations(score, level) {
    const recommendationContent = document.getElementById('recommendationContent');
    
    let recommendations = '';
    
    if (level === 'Low Risk') {
        recommendations = `
            <ul>
                <li>Continue regular physical activity (150 mins/week)</li>
                <li>Maintain balanced diet with plenty of vegetables</li>
                <li>Annual health check-ups recommended</li>
                <li>Monitor family history changes</li>
            </ul>
        `;
    } else if (level === 'Medium Risk') {
        recommendations = `
            <ul>
                <li>Increase physical activity to 300 mins/week</li>
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
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
            console.log('✅ Backend connection successful');
        } else {
            console.log('❌ Backend connection failed');
        }
    } catch (error) {
        console.log('❌ Backend not reachable - make sure Flask server is running');
    }
}
