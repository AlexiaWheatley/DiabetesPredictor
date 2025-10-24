document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('diabetesForm');
    const riskLevel = document.getElementById('riskLevel');
    const riskScore = document.getElementById('riskScore');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const glucose = parseFloat(document.getElementById('glucose').value);
        const bmi = parseFloat(document.getElementById('bmi').value);
        const age = parseFloat(document.getElementById('age').value);
        
        // Simple risk calculation
        let risk = 0;
        risk += (glucose - 70) / 130 * 0.5;
        risk += (bmi - 18) / 22 * 0.3;
        risk += (age - 21) / 59 * 0.2;
        
        risk = Math.min(1, Math.max(0, risk));
        
        // Display results
        riskScore.textContent = (risk * 100).toFixed(1) + '%';
        
        if (risk < 0.3) {
            riskLevel.textContent = 'Low Risk';
            riskLevel.style.color = '#06D6A0';
        } else if (risk < 0.7) {
            riskLevel.textContent = 'Medium Risk';
            riskLevel.style.color = '#FFD166';
        } else {
            riskLevel.textContent = 'High Risk';
            riskLevel.style.color = '#EF476F';
        }
    });
});
