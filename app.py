from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load your trained model (you'll need to save it first)
# model = joblib.load('diabetes_model.pkl')
# selected_features = ['Pregnancies', 'Glucose', 'BMI', 'DiabetesPedigreeFunction', 'Age']

@app.route('/predict', methods=['POST'])
def predict_diabetes():
    try:
        # Get data from frontend
        data = request.json
        
        # Extract features (adjust based on your selected features)
        features = [
            float(data.get('pregnancies', 0)),
            float(data.get('glucose', 0)),
            float(data.get('bmi', 0)),
            float(data.get('dpf', 0)),  # DiabetesPedigreeFunction
            float(data.get('age', 0))
        ]
        
        # Convert to numpy array and reshape
        features_array = np.array(features).reshape(1, -1)
        
        # TODO: Replace with your actual model prediction
        # For now, using a simple rule-based approach similar to your JS
        glucose = float(data.get('glucose', 0))
        bmi = float(data.get('bmi', 0))
        age = float(data.get('age', 0))
        
        # Simple risk calculation (replace with your model later)
        risk = 0
        risk += max(0, (glucose - 70) / 130 * 0.5)
        risk += max(0, (bmi - 18) / 22 * 0.3)
        risk += max(0, (age - 21) / 59 * 0.2)
        
        risk = min(1, max(0, risk))
        
        # Return prediction
        return jsonify({
            'success': True,
            'risk_score': round(risk * 100, 1),
            'risk_level': get_risk_level(risk)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

def get_risk_level(risk):
    if risk < 0.3:
        return 'Low Risk'
    elif risk < 0.7:
        return 'Medium Risk'
    else:
        return 'High Risk'

if __name__ == '__main__':
    app.run(debug=True, port=5000)
