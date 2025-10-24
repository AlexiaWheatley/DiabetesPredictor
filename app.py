from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:5500"])  # Explicit CORS

# Load your trained model (you'll need to save it first)
# model = joblib.load('diabetes_model.pkl')
# selected_features = ['Pregnancies', 'Glucose', 'BMI', 'DiabetesPedigreeFunction', 'Age']

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict_diabetes():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    try:
        # Get data from frontend
        data = request.json
        print("Received data:", data)  # Debug log
        
        # Extract features (adjust based on your selected features)
        features = [
            float(data.get('pregnancies', 0)),
            float(data.get('glucose', 0)),
            float(data.get('bmi', 0)),
            float(data.get('dpf', 0)),  # DiabetesPedigreeFunction
            float(data.get('age', 0))
        ]
        
        print("Processed features:", features)  # Debug log
        
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
        
        print("Calculated risk:", risk)  # Debug log
        
        # Return prediction
        response = jsonify({
            'success': True,
            'risk_score': round(risk * 100, 1),
            'risk_level': get_risk_level(risk)
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print("Error:", str(e))  # Debug log
        response = jsonify({
            'success': False,
            'error': str(e)
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

def get_risk_level(risk):
    if risk < 0.3:
        return 'Low Risk'
    elif risk < 0.7:
        return 'Medium Risk'
    else:
        return 'High Risk'

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Flask server is running'})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')        glucose = float(data.get('glucose', 0))
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
