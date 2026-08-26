"""
MediVerse AI - Disease Prediction Model Training Script

Trains a Random Forest classifier for symptom-based disease prediction.
The model learns to map symptom combinations to disease diagnoses.

This is for educational/demo purposes only.
"""

import os
import sys
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

# Symptom-Disease training dataset
# Each disease maps to a list of associated symptoms
DISEASE_SYMPTOMS = {
    'Common Cold': [
        'runny_nose', 'sneezing', 'sore_throat', 'cough', 'mild_fever',
        'congestion', 'watery_eyes', 'body_ache',
    ],
    'Influenza': [
        'high_fever', 'headache', 'body_ache', 'fatigue', 'chills',
        'cough', 'sore_throat', 'runny_nose',
    ],
    'COVID-19': [
        'fever', 'dry_cough', 'fatigue', 'loss_of_taste', 'loss_of_smell',
        'shortness_of_breath', 'body_ache', 'headache',
    ],
    'Malaria': [
        'high_fever', 'chills', 'sweating', 'headache', 'nausea',
        'vomiting', 'body_ache', 'fatigue',
    ],
    'Dengue': [
        'high_fever', 'severe_headache', 'pain_behind_eyes', 'joint_pain',
        'rash', 'bleeding', 'body_ache', 'fatigue',
    ],
    'Typhoid': [
        'sustained_fever', 'headache', 'abdominal_pain', 'loss_of_appetite',
        'constipation', 'fatigue', 'body_ache',
    ],
    'Pneumonia': [
        'cough', 'high_fever', 'chest_pain', 'shortness_of_breath',
        'fatigue', 'chills', 'sweating',
    ],
    'Bronchitis': [
        'persistent_cough', 'mucus', 'wheezing', 'chest_discomfort',
        'fatigue', 'mild_fever', 'sore_throat',
    ],
    'Asthma': [
        'wheezing', 'shortness_of_breath', 'chest_tightness', 'cough',
    ],
    'Type 2 Diabetes': [
        'excessive_thirst', 'frequent_urination', 'fatigue',
        'blurred_vision', 'slow_healing', 'weight_loss',
    ],
    'Hypertension': [
        'headache', 'dizziness', 'nosebleed', 'shortness_of_breath',
        'chest_pain', 'fatigue',
    ],
    'Migraine': [
        'severe_headache', 'nausea', 'sensitivity_to_light',
        'blurred_vision', 'vomiting', 'throbbing_pain',
    ],
    'Gastroenteritis': [
        'nausea', 'vomiting', 'diarrhea', 'abdominal_cramps',
        'fever', 'dehydration', 'loss_of_appetite',
    ],
    'Food Poisoning': [
        'nausea', 'vomiting', 'diarrhea', 'abdominal_pain',
        'fever', 'chills', 'weakness',
    ],
    'Urinary Tract Infection': [
        'burning_urination', 'frequent_urination', 'pelvic_pain',
        'cloudy_urine', 'strong_odor', 'blood_in_urine',
    ],
    'Allergic Reaction': [
        'rash', 'itching', 'swelling', 'sneezing', 'watery_eyes',
        'runny_nose',
    ],
    'Anemia': [
        'fatigue', 'pale_skin', 'shortness_of_breath', 'dizziness',
        'cold_hands', 'headache',
    ],
    'Hypothyroidism': [
        'fatigue', 'weight_gain', 'cold_sensitivity', 'constipation',
        'dry_skin', 'depression', 'muscle_weakness',
    ],
    'Hyperthyroidism': [
        'weight_loss', 'rapid_heartbeat', 'anxiety', 'tremors',
        'sweating', 'heat_sensitivity', 'fatigue',
    ],
    'Arthritis': [
        'joint_pain', 'joint_swelling', 'stiffness',
        'reduced_range_of_motion', 'fatigue',
    ],
    'Lower Back Pain': [
        'back_pain', 'muscle_spasm', 'limited_mobility',
        'leg_pain', 'stiffness',
    ],
    'Depression': [
        'sadness', 'loss_of_interest', 'fatigue', 'sleep_changes',
        'appetite_changes', 'difficulty_concentrating', 'hopelessness',
    ],
    'Anxiety Disorder': [
        'excessive_worry', 'restlessness', 'rapid_heartbeat',
        'sweating', 'insomnia', 'muscle_tension', 'irritability',
    ],
    'Conjunctivitis': [
        'red_eyes', 'itching', 'discharge', 'tearing',
        'swollen_eyelids', 'blurry_vision',
    ],
    'Sinusitis': [
        'facial_pain', 'nasal_congestion', 'headache',
        'thick_discharge', 'reduced_smell', 'fever',
    ],
    'Ear Infection': [
        'ear_pain', 'fever', 'drainage', 'hearing_loss',
        'irritability', 'headache',
    ],
    'Strep Throat': [
        'sore_throat', 'fever', 'swollen_lymph_nodes', 'red_spots',
        'difficulty_swallowing', 'headache',
    ],
    'Chickenpox': [
        'itchy_rash', 'fever', 'fatigue', 'loss_of_appetite',
        'headaches', 'blisters',
    ],
    'Hepatitis': [
        'jaundice', 'fatigue', 'abdominal_pain', 'dark_urine',
        'loss_of_appetite', 'nausea', 'joint_pain',
    ],
    'Kidney Stones': [
        'severe_flank_pain', 'blood_in_urine', 'nausea',
        'vomiting', 'frequent_urination',
    ],
    'GERD': [
        'heartburn', 'acid_reflux', 'chest_pain',
        'difficulty_swallowing', 'regurgitation', 'chronic_cough',
    ],
    'Irritable Bowel Syndrome': [
        'abdominal_pain', 'bloating', 'diarrhea', 'constipation',
        'gas', 'mucus_in_stool',
    ],
    'Lupus': [
        'fatigue', 'joint_pain', 'rash', 'fever',
        'hair_loss', 'sensitivity_to_sun', 'chest_pain',
    ],
    'Fibromyalgia': [
        'widespread_pain', 'fatigue', 'sleep_problems',
        'cognitive_difficulties', 'stiffness', 'headache',
    ],
    'Appendicitis': [
        'abdominal_pain', 'nausea', 'vomiting', 'fever',
        'loss_of_appetite', 'constipation',
    ],
    'Gallstones': [
        'abdominal_pain', 'nausea', 'vomiting', 'bloating',
        'indigestion', 'sweating',
    ],
    'Pancreatitis': [
        'severe_abdominal_pain', 'nausea', 'vomiting', 'fever',
        'rapid_pulse', 'swollen_abdomen',
    ],
    'Cataracts': [
        'blurred_vision', 'sensitivity_to_light', 'difficulty_seeing_at_night',
        'faded_colors', 'halos_around_lights',
    ],
    'Glaucoma': [
        'eye_pain', 'blurred_vision', 'headache',
        'nausea', 'halos_around_lights',
    ],
    'Parkinsons Disease': [
        'tremor', 'slow_movement', 'rigid_muscles',
        'balance_problems', 'speech_changes',
    ],
    'Alzheimers Disease': [
        'memory_loss', 'confusion', 'difficulty_planning',
        'mood_changes', 'withdrawal', 'difficulty_completing_familiar_tasks',
    ],
}


def generate_training_data(samples_per_disease=50, noise_factor=0.15):
    """Generate training data from the symptom-disease mapping."""
    all_symptoms = set()
    for symptoms in DISEASE_SYMPTOMS.values():
        all_symptoms.update(symptoms)
    all_symptoms = sorted(all_symptoms)

    X = []
    y = []

    rng = np.random.RandomState(42)

    for disease, symptoms in DISEASE_SYMPTOMS.items():
        for _ in range(samples_per_disease):
            # Start with a random subset of the disease's symptoms
            num_symptoms = rng.randint(
                max(2, len(symptoms) // 2),
                len(symptoms) + 1
            )
            selected = rng.choice(symptoms, size=num_symptoms, replace=False)

            # Create feature vector
            features = [1 if s in selected else 0 for s in all_symptoms]

            # Add some noise: randomly flip a few features
            noise_count = int(len(all_symptoms) * noise_factor)
            noise_indices = rng.choice(len(all_symptoms), size=noise_count, replace=False)
            for idx in noise_indices:
                features[idx] = 1 - features[idx]

            X.append(features)
            y.append(disease)

    return np.array(X), np.array(y), all_symptoms


def train_model():
    """Train and save the disease prediction model."""
    print("Generating training data...")
    X, y, symptom_list = generate_training_data(samples_per_disease=80, noise_factor=0.12)

    print(f"Dataset: {X.shape[0]} samples, {X.shape[1]} features, {len(set(y))} diseases")

    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    print(f"Training: {X_train.shape[0]} samples, Testing: {X_test.shape[0]} samples")

    # Train Random Forest
    print("Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    print(f"Training accuracy: {train_acc:.4f}")
    print(f"Testing accuracy: {test_acc:.4f}")

    # Detailed report
    y_pred = model.predict(X_test)
    disease_names = label_encoder.inverse_transform(sorted(set(y_encoded)))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=disease_names))

    # Save model and artifacts
    model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'trained_models')
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, 'random_forest.pkl')
    encoder_path = os.path.join(model_dir, 'label_encoder.pkl')
    symptom_path = os.path.join(model_dir, 'symptom_list.pkl')

    joblib.dump(model, model_path)
    joblib.dump(label_encoder, encoder_path)
    joblib.dump(symptom_list, symptom_path)

    print(f"\nModel saved to: {model_path}")
    print(f"Label encoder saved to: {encoder_path}")
    print(f"Symptom list saved to: {symptom_path}")
    print(f"Total symptoms: {len(symptom_list)}")
    print(f"Total diseases: {len(DISEASE_SYMPTOMS)}")

    return model, label_encoder, symptom_list


if __name__ == '__main__':
    train_model()
