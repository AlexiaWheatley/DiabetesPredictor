// Diabetes Risk Prediction Calculator
class DiabetesCalculator {
    constructor() {
        this.featureWeights = {
            'Glucose': 0.25,
            'BMI': 0.18,
            'Age': 0.15,
            'DiabetesPedigreeFunction': 0.12,
            'Pregnancies': 0.10,
            'BloodPressure': 0.08,
            'SkinThickness': 0.07,
            'Insulin': 0.05
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateFeatureBars();
    }
    
    setupEventListeners() {
        const form = document.getElementById('diabetesForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateRisk();
            });
        }
        
        // Real-time updates as user inputs data
        const inputs = document.querySelectorAll('#diabetesForm input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateFeatureBars();
            });
        });
    }
    
    calculateRisk() {
        const formData = this.getFormData();
        const riskScore = this.computeRiskScore(formData);
        const riskLevel = this.determineRiskLevel(riskScore);
        
        this.displayResults(riskScore, riskLevel, formData);
    }
    
    getFormData() {
        return {
            pregnancies: parseInt(document.getElementById('pregnancies').value) || 0,
            glucose: parseInt(document.getElementById('glucose').value) || 120,
            bloodPressure: parseInt(document.getElementById('bloodPressure').value) || 70,
            skinThickness: parseInt(document.getElementById('skinThickness').value) || 20,
            insulin: parseInt(document.getElementById('insulin').value) || 80,
            bmi: parseFloat(document.getElementById('bmi').value) || 25.0,
            diabetesPedigree: parseFloat(document.getElementById('diabetesPedigree').value) || 0.5,
            age: parseInt(document.getElementById('age').value) || 35
        };
    }
    
    computeRiskScore(data) {
        // Enhanced risk calculation based on clinical research
        let score = 0;
        
        // Glucose (most important factor)
        if (data.glucose >= 126) score += 0.3; // Diabetic range
        else if (data.glucose >= 100) score += 0.15; // Prediabetic range
        else score += (data.glucose - 70) / 30 * 0.1; // Normal range
        
        // BMI scoring
        if (data.bmi >= 30) score += 0.2; // Obese
        else if (data.bmi >= 25) score += 0.1; // Overweight
        else score += (data.bmi - 18) / 7 * 0.05; // Normal range
        
        // Age factor
        if (data.age >= 45) score += 0.15;
        else score += (data.age - 21) / 24 * 0.1;
        
        // Diabetes pedigree function
        score += (data.diabetesPedigree * 0.1);
        
        // Additional factors
        if (data.pregnancies > 0) score += Math.min(data.pregnancies * 0.03, 0.09);
        if (data.bloodPressure >= 80) score += 0.05;
        if (data.skinThickness >= 30) score += 0.03;
        if (data.insulin >= 100) score += 0.02;
        
        return Math.min(1, Math.max(0, score));
    }
    
    determineRiskLevel(score) {
        if (score < 0.25) return { level: "Low Risk", class: "low" };
        if (score < 0.6) return { level: "Medium Risk", class: "medium" };
        return { level: "High Risk", class: "high" };
    }
    
    displayResults(score, riskInfo, formData) {
        const riskLevelElement = document.getElementById('riskLevel');
        const riskProbabilityElement = document.getElementById('riskProbability');
        const riskDescriptionElement = document.getElementById('riskDescription');
        const recommendationContentElement = document.getElementById('recommendationContent');
        const riskIndicator = document.querySelector('.risk-indicator');
        
        // Update risk information
        riskLevelElement.textContent = riskInfo.level;
        riskProbabilityElement.textContent = `${(score * 100).toFixed(1)}%`;
        
        // Update risk description
        riskDescriptionElement.innerHTML = this.getRiskDescription(riskInfo, score);
        
        // Update recommendations
        recommendationContentElement.innerHTML = this.getRecommendations(riskInfo, formData);
        
        // Update risk indicator styling
        riskIndicator.className = 'risk-indicator';
        riskIndicator.classList.add(`risk-${riskInfo.class}`);
        
        // Update feature bars with current data
        this.updateFeatureBars();
        
        // Scroll to results if on mobile
        if (window.innerWidth < 768) {
            document.getElementById('results').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }
    
    getRiskDescription(riskInfo, score)
