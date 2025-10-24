document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('diabetesForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Show loading
            const riskLevel = document.getElementById('riskLevel');
            const riskScore = document.getElementById('riskScore');
            const riskDescription = document.getElementById('riskDescription');
            
            if (riskLevel) riskLevel.textContent = 'Calculating...';
            if (riskScore) riskScore.textContent = 'Processing';
            if (riskDescription) riskDescription.textContent = 'Please wait...';
            
            // Get form data
            const formData = {
                pregnancies: document.getElementById('pregnancies').value || 0,
                glucose: document.getElementById('glucose').value || 0,
                bmi: document.getElementById('bmi').value || 0,
                dpf: document.getElementById('dpf').value || 0,
                age: document.getElementById('age').value || 0
            };
            
            // Send to backend
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                if (riskLevel) riskLevel.textContent = result.risk_level;
                if (riskScore) riskScore.textContent = result.risk_score + '%';
                if (riskDescription) {
                    riskDescription.textContent = `Risk assessment complete (${result.model_used})`;
                }
                
                // Color code
                if (riskLevel) {
                    if (result.risk_level === 'Low Risk') riskLevel.style.color = 'green';
                    else if (result.risk_level === 'Medium Risk') riskLevel.style.color = 'orange';
                    else riskLevel.style.color = 'red';
                }
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Error:', error);
            const riskLevel = document.getElementById('riskLevel');
            const riskScore = document.getElementById('riskScore');
            if (riskLevel) riskLevel.textContent = 'Error';
            if (riskScore) riskScore.textContent = 'Failed';
        }
    });
});
