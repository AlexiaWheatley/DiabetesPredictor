from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import json
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

print("🚀 Starting Diabetes Prediction API...")
print("🔍 Loading machine learning model...")

# Global variables for model and feature info
model = None
model_info = None
MODEL_LOADED = False

try:
    # Try to load the trained model
    model = joblib.load('diabetes_model.pkl')
    
    # Load model information
    with open('model_info.json', 'r') as f:
        model_info = json.load(f)
    
    MODEL_LOADED = True
    print("✅ Diabetes prediction model loaded successfully!")
    print(f"📊 Using features: {model_info['selected_features']}")
    
except FileNotFoundError:
    print("❌ Model files not found. Using fallback calculation method.")
    print("💡 Make sure you have:")
    print("   - diabetes_model.pkl (trained model)")
    print("   - model_info.json (feature information)")
    MODEL_LOADED = False
    
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("🔄 Using fallback prediction method")
    MODEL_LOADED = False

@app.route('/predict', methods=['POST'])
def predict_diabetes():
    """
    Predict diabetes risk based on patient features
    Expected JSON: {'pregnancies': 2, 'glucose': 120, 'bmi': 25.5, 'dpf': 0.5, 'age': 35}
    """
    try:
        # Get JSON data from frontend
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data received. Please send JSON data with patient information.'
            }), 400

        print("📥 Received patient data:", data)

        # Extract and validate features
        try:
            pregnancies = float(data.get('pregnancies', 0))
            glucose = float(data.get('glucose', 0))
            bmi = float(data.get('bmi', 0))
            dpf = float(data.get('dpf', 0))  # Diabetes Pedigree Function
            age = float(data.get('age', 0))
        except (TypeError, ValueError) as e:
            return jsonify({
                'success': False,
                'error': f'Invalid data types. Please check your input values: {str(e)}'
            }), 400

        # Validate critical values
        if glucose <= 0 or glucose > 300:
            return jsonify({
                'success': False,
                'error': 'Glucose must be between 1 and 300 mg/dL'
            }), 400
            
        if bmi <= 0 or bmi > 60:
            return jsonify({
                'success': False, 
                'error': 'BMI must be between 1 and 60'
            }), 400
            
        if age < 1 or age > 120:
            return jsonify({
                'success': False,
                'error': 'Age must be between 1 and 120'
            }), 400

        print(f"🔧 Processing features: Pregnancies={pregnancies}, Glucose={glucose}, BMI={bmi}, DPF={dpf}, Age={age}")

        # Make prediction
        if MODEL_LOADED and model is not None:
            # Use the actual trained ML model
            try:
                # Prepare features in correct order
                features = np.array([[pregnancies, glucose, bmi, dpf, age]])
                
                # Get probability prediction
                probability = model.predict_proba(features)[0][1]
                risk_score = probability * 100
                
                print(f"🎯 ML Model prediction: {risk_score:.1f}% risk")
                
            except Exception as e:
                print(f"❌ Model prediction failed: {e}. Using fallback.")
                risk_score = calculate_fallback_risk(pregnancies, glucose, bmi, dpf, age)
                model_used = "Fallback (Model Error)"
        else:
            # Use fallback calculation
            risk_score = calculate_fallback_risk(pregnancies, glucose, bmi, dpf, age)
            model_used = "Fallback (No Model)"
            
        # Determine risk level
        risk_level = get_risk_level(risk_score)
        model_used = "XGBoost Ensemble" if MODEL_LOADED else "Fallback Calculation"

        # Return successful prediction
        response = {
            'success': True,
            'risk_score': round(risk_score, 1),
            'risk_level': risk_level,
            'model_used': model_used,
            'features_used': {
                'pregnancies': pregnancies,
                'glucose': glucose,
                'bmi': bmi,
                'diabetes_pedigree_function': dpf,
                'age': age
            }
        }
        
        print(f"📤 Sending response: {risk_level} ({risk_score:.1f}%)")
        return jsonify(response)

    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


def calculate_fallback_risk(pregnancies, glucose, bmi, dpf, age):
    """
    Fallback risk calculation when ML model is not available
    Based on clinical risk factors for diabetes
    """
    risk = 0.0
    
    # Glucose contribution (most important factor)
    if glucose < 70:
        risk += 0.1
    elif glucose < 100:
        risk += 0.2
    elif glucose < 126:
        risk += 0.4
    else:
        risk += 0.6

    # BMI contribution
    if bmi < 18.5:
        risk += 0.05
    elif bmi < 25:
        risk += 0.1
    elif bmi < 30:
        risk += 0.2
    else:
        risk += 0.3

    # Age contribution
    if age < 30:
        risk += 0.05
    elif age < 45:
        risk += 0.1
    elif age < 60:
        risk += 0.2
    else:
        risk += 0.15

    # Pregnancy history contribution
    if pregnancies > 0:
        risk += min(0.2, pregnancies * 0.05)

    # Diabetes pedigree function contribution
    risk += min(0.15, dpf * 0.3)

    # Convert to percentage and ensure reasonable bounds
    risk_score = min(95, max(5, risk * 100))
    
    print(f"🔄 Fallback calculation: {risk_score:.1f}%")
    return risk_score


def get_risk_level(risk_score):
    """Convert risk score to meaningful risk level"""
    if risk_score < 25:
        return 'Low Risk'
    elif risk_score < 50:
        return 'Medium Risk'
    elif risk_score < 75:
        return 'High Risk'
    else:
        return 'Very High Risk'


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API is running"""
    status = {
        'status': 'healthy',
        'message': 'Diabetes Prediction API is running',
        'model_loaded': MODEL_LOADED,
        'model_type': 'XGBoost Ensemble' if MODEL_LOADED else 'Fallback Calculation',
        'endpoints': {
            'GET /health': 'Health check',
            'POST /predict': 'Predict diabetes risk (requires JSON data)',
            'GET /model-info': 'Get model information'
        }
    }
    return jsonify(status)


@app.route('/model-info', methods=['GET'])
def get_model_info():
    """Get information about the loaded model and features"""
    if MODEL_LOADED and model_info:
        return jsonify({
            'success': True,
            'model_loaded': True,
            'selected_features': model_info['selected_features'],
            'feature_ranges': model_info['feature_ranges'],
            'model_type': 'XGBoost Ensemble with Feature Selection'
        })
    else:
        return jsonify({
            'success': True,
            'model_loaded': False,
            'message': 'Using fallback risk calculation',
            'required_features': [
                'pregnancies', 'glucose', 'bmi', 'dpf', 'age'
            ]
        })


@app.route('/example', methods=['GET'])
def example_request():
    """Show example of how to use the prediction endpoint"""
    example_data = {
        'pregnancies': 2,
        'glucose': 120,
        'bmi': 25.5,
        'dpf': 0.5,
        'age': 35
    }
    
    return jsonify({
        'message': 'Example prediction request',
        'curl_example': 'curl -X POST http://localhost:5000/predict -H "Content-Type: application/json" -d \'{"pregnancies": 2, "glucose": 120, "bmi": 25.5, "dpf": 0.5, "age": 35}\'',
        'example_data': example_data
    })


@app.route('/')
def home():
    """Home page with API information"""
    return jsonify({
        'message': 'Diabetes Prediction API',
        'version': '1.0',
        'description': 'Machine learning API for diabetes risk prediction',
        'endpoints': {
            'GET /': 'This information',
            'GET /health': 'Health check',
            'GET /model-info': 'Model information',
            'GET /example': 'Example request',
            'POST /predict': 'Predict diabetes risk'
        },
        'usage': 'Send POST request to /predict with JSON data containing: pregnancies, glucose, bmi, dpf, age'
    })


if __name__ == '__main__':
    print("\n" + "="*50)
    print("🏥 DIABETES PREDICTION API")
    print("="*50)
    print("📍 Available Endpoints:")
    print("   - GET  /              - API information")
    print("   - GET  /health        - Health check")
    print("   - GET  /model-info    - Model information") 
    print("   - GET  /example       - Example request")
    print("   - POST /predict       - Predict diabetes risk")
    print("\n🔥 Starting server on http://localhost:5000")
    print("💡 Test the API:")
    print("   - Open: http://localhost:5000/health")
    print("   - Or:   http://localhost:5000/model-info")
    print("="*50)
    
    app.run(debug=True, port=5000, host='0.0.0.0')
