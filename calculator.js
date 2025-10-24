document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('diabetesForm');
    const riskLevel = document.getElementById('riskLevel');
    const riskScore = document.getElementById('riskScore');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        loadingSpinner.style.display = 'block';
        riskScore.textContent = 'Calculating...';
        riskLevel.textContent = '';
        
        try {
            // Collect form data
            const formData = {
                pregnancies: document.getElementById('pregnancies').value,
                glucose: document.getElementById('glucose').value,
                bmi: document.getElementById('bmi').value,
                dpf: document.getElementById('dpf').value,
                age: document.getElementById('age').value
            };
            
            // Send to Python backend
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Display results
                riskScore.textContent = result.risk_score + '%';
                riskLevel.textContent = result.risk_level;
                
                // Color coding
                if (result.risk_level === 'Low Risk') {
                    riskLevel.style.color = '#06D6A0';
                } else if (result.risk_level === 'Medium Risk') {
                    riskLevel.style.color = '#FFD166';
                } else {
                    riskLevel.style.color = '#EF476F';
                }
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Error:', error);
            riskScore.textContent = 'Error';
            riskLevel.textContent = 'Please try again';
            riskLevel.style.color = '#EF476F';
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });
});
