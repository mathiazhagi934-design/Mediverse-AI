from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import PredictionHistory
from .serializers import PredictSerializer, PredictionHistorySerializer
from .ml.predictor import predict_disease, get_available_symptoms


DISCLAIMER = (
    "This result is AI-generated and should not be treated as a medical diagnosis. "
    "Please consult a qualified healthcare professional for proper evaluation and advice."
)


class DiseasePredictView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PredictSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        symptoms = serializer.validated_data['symptoms']
        result = predict_disease(symptoms)

        if result is None:
            return Response({
                'error': 'Unable to make prediction. Either the model is not available or no valid symptoms were provided.',
                'available_symptoms': get_available_symptoms()[:20],
            }, status=status.HTTP_400_BAD_REQUEST)

        # Save prediction history
        PredictionHistory.objects.create(
            user=request.user,
            symptoms=symptoms,
            predicted_disease=result['disease'],
            confidence=result['confidence'],
        )

        return Response({
            'disease': result['disease'],
            'confidence': result['confidence'],
            'symptoms': symptoms,
            'matched_symptoms': result['matched_symptoms'],
            'top_predictions': result['top_predictions'],
            'disclaimer': DISCLAIMER,
        })


class SymptomListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        symptoms = get_available_symptoms()
        return Response({'symptoms': symptoms, 'count': len(symptoms)})


class PredictionHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        predictions = PredictionHistory.objects.filter(user=request.user)
        serializer = PredictionHistorySerializer(predictions, many=True)
        return Response(serializer.data)
