document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('diabetesForm');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (!form) {
        console.error('Calculator form not found');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Show loading spinner and set interim messages
            if (loadingSpinner) loadingSpinner.style.display = 'block';
            
            const riskLevel = document.getElementById('riskLevel');
            const riskScore = document.getElementById('riskScore');
            const riskDescription = document.getElementById('riskDescription');
            const recommendationContent = document.getElementById('recommendationContent');
            
            // Clear previous results and set loading state
            if (riskLevel) {
                riskLevel.textContent = 'Analyzing...';
                riskLevel.className = 'risk-level';
            }
            if (riskScore) riskScore.textContent = '--';
            if (riskDescription) {
                riskDescription.innerHTML = '<p>Processing your health data...</p>';
            }
            if (recommendationContent) {
                recommendationContent.innerHTML = '<p>Generating personalized recommendations...</p>';
            }
            
            // Get and validate form data
            const formData = {
                pregnancies: parseFloat(document.getElementById('pregnancies').value) || 0,
                glucose: parseFloat(document.getElementById('glucose').value) || 0,
                bmi: parseFloat(document.getElementById('bmi').value) || 0,
                dpf: parseFloat(document.getElementById('dpf').value) || 0,
                age: parseFloat(document.getElementById('age').value) || 0
            };
            
            console.log('Sending data to backend:', formData);
            
            // Send to backend
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Backend response:', result);
            
            if (result.success) {
                // Update UI with real results
                if (riskLevel) {
                    riskLevel.textContent = result.risk_level || 'Unknown Risk';
                    
                    // Apply appropriate styling
                    riskLevel.className = 'risk-level ';
                    if (result.risk_level === 'Low Risk') {
                        riskLevel.classList.add('low-risk');
                    } else if (result.risk_level === 'Medium Risk') {
                        riskLevel.classList.add('medium-risk');
                    } else if (result.risk_level === 'High Risk') {
                        riskLevel.classList.add('high-risk');
                    }
                }
                
                if (riskScore) {
                    riskScore.textContent = result.risk_score ? `${result.risk_score}%` : '--';
                }
                
                if (riskDescription) {
                    riskDescription.innerHTML = `<p>${result.description || 'Risk assessment completed.'} ${result.model_used ? `(Model: ${result.model_used})` : ''}</p>`;
                }
                
                if (recommendationContent) {
                    let recommendations = '<p>No specific recommendations available.</p>';
                    
                    if (result.risk_level === 'Low Risk') {
                        recommendations = `
                            <ul>
                                <li>Continue regular physical activity (at least 150 minutes per week)</li>
                                <li>Maintain a balanced diet rich in fruits, vegetables, and whole grains</li>
                                <li>Schedule annual health check-ups</li>
                                <li>Monitor your blood sugar levels if you have family history of diabetes</li>
                            </ul>
                        `;
                    } else if (result.risk_level === 'Medium Risk') {
                        recommendations = `
                            <ul>
                                <li>Increase physical activity to 150-300 minutes per week</li>
                                <li>Focus on weight management if needed</li>
                                <li>Consider reducing sugar and refined carbohydrate intake</li>
                                <li>Discuss screening options with your healthcare provider</li>
                                <li>Monitor blood pressure and cholesterol levels</li>
                            </ul>
                        `;
                    } else if (result.risk_level === 'High Risk') {
                        recommendations = `
                            <ul>
                                <li>Consult with a healthcare provider for comprehensive assessment</li>
                                <li>Consider glucose tolerance testing</li>
                                <li>Implement dietary changes under professional guidance</li>
                                <li>Increase physical activity as recommended by your doctor</li>
                                <li>Regular monitoring of blood glucose levels</li>
                                <li>Weight management program if needed</li>
                            </ul>
                        `;
                    }
                    
                    recommendationContent.innerHTML = recommendations;
                }
                
            } else {
                throw new Error(result.error || 'Unknown error from server');
            }
            
        } catch (error) {
            console.error('Error calculating risk:', error);
            
            // Update UI with error message
            const riskLevel = document.getElementById('riskLevel');
            const riskScore = document.getElementById('riskScore');
            const riskDescription = document.getElementById('riskDescription');
            const recommendationContent = document.getElementById('recommendationContent');
            
            if (riskLevel) {
                riskLevel.textContent = 'Error';
                riskLevel.className = 'risk-level';
            }
            if (riskScore) riskScore.textContent = '--';
            if (riskDescription) {
                riskDescription.innerHTML = `<p>Unable to calculate risk at this time. Please try again later.</p>`;
            }
            if (recommendationContent) {
                recommendationContent.innerHTML = '<p>Please check your connection and try again.</p>';
            }
            
        } finally {
            // Always hide loading spinner
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    });
});
