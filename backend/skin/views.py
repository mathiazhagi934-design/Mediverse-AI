import os
import logging
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SkinPrediction
from .serializers import SkinPredictionSerializer, SkinUploadSerializer

logger = logging.getLogger(__name__)

SKIN_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), 'trained_models', 'skin_model.h5'
)


def is_skin_model_available():
    return os.path.exists(SKIN_MODEL_PATH)


SKIN_DISEASE_LABELS = [
    'Actinic Keratoses', 'Basal Cell Carcinoma', 'Benign Keratosis-like Lesions',
    'Dermatofibroma', 'Melanocytic Nevi', 'Melanoma',
    'Vascular Lesions', 'Unknown',
]


class SkinPredictView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SkinUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image = serializer.validated_data['image']

        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if hasattr(image, 'content_type') and image.content_type not in allowed_types:
            return Response(
                {'error': 'Only JPEG, PNG, and WebP images are accepted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file size (max 5MB)
        if image.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'Image too large. Maximum size is 5MB.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        model_available = is_skin_model_available()

        if not model_available:
            # Save with no prediction
            pred = SkinPrediction.objects.create(
                user=request.user,
                image=image,
                prediction='',
                confidence=0.0,
                is_model_available=False,
            )
            return Response({
                'prediction': '',
                'confidence': 0.0,
                'is_model_available': False,
                'message': (
                    'The skin disease detection model is not configured. '
                    'Please upload a trained skin disease model (skin_model.h5) to enable predictions. '
                    'The image has been saved to your history.'
                ),
                'disclaimer': (
                    'MediVerse AI provides AI-generated health information for educational purposes only '
                    'and is not a substitute for professional medical advice.'
                ),
                'id': pred.id,
                'created_at': pred.created_at,
            })

        try:
            import numpy as np
            from PIL import Image
            import joblib

            # Preprocess image
            img = Image.open(image).convert('RGB')
            img = img.resize((224, 224))
            img_array = np.array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            # Load model and predict
            model = joblib.load(SKIN_MODEL_PATH)
            predictions = model.predict(img_array)

            if hasattr(predictions, 'shape') and len(predictions.shape) > 1:
                pred_class_idx = int(np.argmax(predictions[0]))
                confidence = float(predictions[0][pred_class_idx])
            else:
                pred_class_idx = int(predictions[0])
                confidence = 0.0

            if pred_class_idx < len(SKIN_DISEASE_LABELS):
                disease_name = SKIN_DISEASE_LABELS[pred_class_idx]
            else:
                disease_name = 'Unknown'

            pred = SkinPrediction.objects.create(
                user=request.user,
                image=image,
                prediction=disease_name,
                confidence=confidence,
                is_model_available=True,
            )

            return Response({
                'prediction': disease_name,
                'confidence': confidence,
                'is_model_available': True,
                'disclaimer': (
                    'MediVerse AI provides AI-generated health information for educational purposes only '
                    'and is not a substitute for professional medical advice. '
                    'Please consult a dermatologist for proper diagnosis.'
                ),
                'id': pred.id,
                'created_at': pred.created_at,
            })

        except Exception as e:
            logger.error(f"Skin prediction error: {e}")
            pred = SkinPrediction.objects.create(
                user=request.user,
                image=image,
                prediction='',
                confidence=0.0,
                is_model_available=False,
            )
            return Response({
                'error': f'Model prediction failed: {str(e)}',
                'is_model_available': False,
                'message': 'The skin disease model encountered an error during prediction.',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SkinHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        predictions = SkinPrediction.objects.filter(user=request.user)
        serializer = SkinPredictionSerializer(predictions, many=True)
        return Response(serializer.data)
