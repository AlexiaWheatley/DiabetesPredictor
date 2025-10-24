from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import json
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Load the trained model and feature info
try:
    model = joblib.load('diabetes_model.pkl')
    with open('model_info.json', 'r') as f:
        model_info = json.load(f)
    MODEL_LOADED = True
    print("✅ Diabetes prediction model loaded successfully!")
    print(f"✅ Using features: {model_info['selected_features']}")
except Exception as e:
    MODEL_LOADED = False
    print(f"❌ Error loading model: {e}")
    print("⚠️ Using fallback prediction method")

@app.route('/predict', methods=['POST'])
def predict_diabetes():
    try:
        # Get data from frontend
        data = request.json
        print("📥 Received data:", data)
        
        if MODEL_LOADED:
            # Prepare features in correct order for the model
            features = []
            for feature in model_info['selected_features']:
                value = float(data.get(feature.lower(), 0))
                features.append(value)
            
            print(f"🔧 Processed features: {features}")
            
            # Convert to numpy array and reshape for prediction
            features_array = np.array(features).reshape(1, -1)
            
            # Make prediction using the trained model
            probability = model.predict_proba(features_array)[0][1]
            risk_score = probability * 100
            
            print(f"🎯 Model prediction - Probability: {probability:.4f}, Risk Score: {risk_score:.1f}%")
            
        else:
            # Fallback calculation if model isn't loaded
            print("⚠️ Using fallback calculation")
            glucose = float(data.get('glucose', 0))
            bmi = float(data.get('bmi', 0))
            age = float(data.get('age', 0))
            
            risk = 0
            risk += max(0, (glucose - 70) / 130 * 0.5)
            risk += max(0, (bmi - 18) / 22 * 0.3)
            risk += max(0, (age - 21) / 59 * 0.2)
            risk_score = min(100, max(0, risk * 100))
        
        # Determine risk level
        risk_level = get_risk_level(risk_score)
        
        # Return prediction
        return jsonify({
            'success': True,
            'risk_score': round(risk_score, 1),
            'risk_level': risk_level,
            'model_used': 'XGBoost' if MODEL_LOADED else 'Fallback'
        })
        
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def get_risk_level(risk_score):
    """Convert risk score to risk level"""
    if risk_score < 30:
        return 'Low Risk'
    elif risk_score < 70:
        return 'Medium Risk'
    else:
        return 'High Risk'

@app.route('/health', methods=['GET'])
def health_check():
    status = {
        'status': 'healthy', 
        'message': 'Diabetes Prediction API is running',
        'model_loaded': MODEL_LOADED,
        'features': model_info['selected_features'] if MODEL_LOADED else []
    }
    return jsonify(status)

@app.route('/model-info', methods=['GET'])
def model_info():
    if MODEL_LOADED:
        return jsonify({
            'success': True,
            'selected_features': model_info['selected_features'],
            'feature_ranges': model_info['feature_ranges']
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        })

if __name__ == '__main__':
    print("🚀 Starting Diabetes Prediction API...")
    print("📍 Endpoints:")
    print("   - GET  /health      - Health check")
    print("   - GET  /model-info  - Model information") 
    print("   - POST /predict     - Predict diabetes risk")
    app.run(debug=True, port=5000, host='0.0.0.0')
