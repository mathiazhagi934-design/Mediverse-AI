"""
MediVerse AI - Disease Prediction Module

Loads the trained Random Forest model and provides disease prediction
from user-reported symptoms.
"""

import os
import logging
from pathlib import Path
import numpy as np
import joblib

logger = logging.getLogger(__name__)

# Use Django BASE_DIR for robust path resolution when available
# Fallback to relative path for standalone usage
def _get_model_dir():
    try:
        from django.conf import settings
        if settings.configured:
            return settings.BASE_DIR / 'trained_models'
    except Exception:
        pass
    # Fallback for non-Django contexts or when settings not configured
    return Path(__file__).resolve().parent.parent.parent / 'trained_models'

MODEL_DIR = _get_model_dir()
MODEL_PATH = MODEL_DIR / 'random_forest.pkl'
ENCODER_PATH = MODEL_DIR / 'label_encoder.pkl'
SYMPTOM_PATH = MODEL_DIR / 'symptom_list.pkl'

_model = None
_label_encoder = None
_symptom_list = None


def _load_artifacts():
    global _model, _label_encoder, _symptom_list
    if _model is not None:
        return True
    try:
        if not os.path.exists(MODEL_PATH):
            logger.warning(f"Model file not found: {MODEL_PATH}")
            return False
        _model = joblib.load(MODEL_PATH)
        _label_encoder = joblib.load(ENCODER_PATH)
        _symptom_list = joblib.load(SYMPTOM_PATH)
        logger.info(f"Loaded model with {len(_symptom_list)} symptoms and {len(_label_encoder.classes_)} diseases")
        return True
    except Exception as e:
        logger.error(f"Failed to load model artifacts: {e}")
        return False


def get_available_symptoms():
    """Return list of all known symptoms."""
    if not _load_artifacts():
        return []
    return list(_symptom_list)


def predict_disease(symptoms: list[str]):
    """
    Predict disease from a list of symptoms.

    Returns:
        dict with 'disease', 'confidence', 'all_probabilities' or None if model unavailable.
    """
    if not _load_artifacts():
        return None

    # Normalize symptoms
    normalized = [s.strip().lower().replace(' ', '_') for s in symptoms]

    # Create feature vector
    features = np.zeros(len(_symptom_list))
    matched = []
    for symptom in normalized:
        if symptom in _symptom_list:
            idx = _symptom_list.index(symptom)
            features[idx] = 1
            matched.append(symptom)

    if not matched:
        return None

    # Predict
    features_2d = features.reshape(1, -1)
    probabilities = _model.predict_proba(features_2d)[0]

    # Get top prediction
    top_idx = np.argmax(probabilities)
    confidence = float(probabilities[top_idx])
    disease = _label_encoder.inverse_transform([top_idx])[0]

    # Get all probabilities for top diseases
    sorted_indices = np.argsort(probabilities)[::-1]
    all_probs = []
    for idx in sorted_indices[:5]:
        all_probs.append({
            'disease': _label_encoder.inverse_transform([idx])[0],
            'confidence': float(probabilities[idx]),
        })

    return {
        'disease': disease,
        'confidence': round(confidence, 4),
        'matched_symptoms': matched,
        'top_predictions': all_probs,
    }
