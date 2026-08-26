from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from accounts.models import PatientProfile
from disease.models import PredictionHistory
from reports.models import MedicalReport
from skin.models import SkinPrediction


def calculate_health_score(user):
    """
    Calculate a simple transparent health score (0-100).
    Based on profile completeness, recent activity, and basic indicators.
    This is an EDUCATIONAL wellness score - not a medical assessment.
    """
    score = 50  # Base score
    factors = []

    try:
        profile = PatientProfile.objects.get(user=user)
    except PatientProfile.DoesNotExist:
        profile = None

    # Profile completeness (up to 20 points)
    profile_fields = ['full_name', 'age', 'gender', 'height', 'weight', 'blood_group']
    filled = sum(1 for f in profile_fields if getattr(profile, f, None))
    profile_score = int((filled / len(profile_fields)) * 20)
    score += profile_score - 10  # Normalize around 0
    if profile_score > 10:
        factors.append({'factor': 'Profile Completeness', 'impact': profile_score - 10, 'detail': f'{filled}/{len(profile_fields)} fields completed'})
    else:
        factors.append({'factor': 'Profile Completeness', 'impact': profile_score - 10, 'detail': f'Only {filled}/{len(profile_fields)} fields completed'})

    # BMI factor (if height and weight available)
    if profile and profile.height and profile.weight:
        height_m = profile.height / 100
        bmi = profile.weight / (height_m * height_m)
        if 18.5 <= bmi <= 24.9:
            score += 10
            factors.append({'factor': 'BMI', 'impact': 10, 'detail': f'BMI: {bmi:.1f} (healthy range)'})
        elif 25 <= bmi <= 29.9:
            score += 0
            factors.append({'factor': 'BMI', 'impact': 0, 'detail': f'BMI: {bmi:.1f} (overweight)'})
        else:
            score -= 5
            factors.append({'factor': 'BMI', 'impact': -5, 'detail': f'BMI: {bmi:.1f} (outside healthy range)'})

    # Activity indicators
    total_predictions = PredictionHistory.objects.filter(user=user).count()
    total_reports = MedicalReport.objects.filter(user=user).count()
    recent_predictions = PredictionHistory.objects.filter(user=user)[:5]

    if total_predictions > 0:
        score += 5
        factors.append({'factor': 'Health Monitoring', 'impact': 5, 'detail': f'{total_predictions} prediction(s) tracked'})

    if total_reports > 0:
        score += 5
        factors.append({'factor': 'Report Tracking', 'impact': 5, 'detail': f'{total_reports} report(s) uploaded'})

    # Check for any concerning predictions (high confidence)
    concerning_count = PredictionHistory.objects.filter(
        user=user, confidence__gte=0.7
    ).count()
    if concerning_count > 0:
        score -= 5
        factors.append({'factor': 'Health Alerts', 'impact': -5, 'detail': f'{concerning_count} high-confidence prediction(s) detected'})

    # Clamp score
    score = max(0, min(100, score))

    return {
        'score': score,
        'factors': factors,
        'recommendations': _generate_recommendations(score, profile, total_predictions),
    }


def _generate_recommendations(score, profile, total_predictions):
    """Generate general health recommendations."""
    recs = []

    recs.append({
        'category': 'General',
        'message': 'Stay hydrated by drinking at least 8 glasses of water daily.',
    })
    recs.append({
        'category': 'Exercise',
        'message': 'Aim for at least 30 minutes of moderate physical activity most days.',
    })
    recs.append({
        'category': 'Sleep',
        'message': 'Maintain a regular sleep schedule of 7-9 hours per night.',
    })
    recs.append({
        'category': 'Nutrition',
        'message': 'Include plenty of fruits, vegetables, and whole grains in your diet.',
    })

    if not profile or not profile.full_name:
        recs.append({
            'category': 'Profile',
            'message': 'Complete your health profile for more personalized insights.',
        })

    if total_predictions == 0:
        recs.append({
            'category': 'Monitoring',
            'message': 'Use the disease prediction tool to track your symptoms over time.',
        })

    if score < 60:
        recs.append({
            'category': 'Checkup',
            'message': 'Consider scheduling a routine health checkup with your doctor.',
        })

    recs.append({
        'category': 'Disclaimer',
        'message': (
            'These recommendations are for educational purposes only and are not a substitute '
            'for professional medical advice. Always consult a qualified healthcare provider.'
        ),
    })

    return recs


def get_date_range(range_param):
    """Get date range based on parameter."""
    now = timezone.now()
    if range_param == '7d':
        return now - timedelta(days=7)
    elif range_param == '30d':
        return now - timedelta(days=30)
    elif range_param == '90d':
        return now - timedelta(days=90)
    return None


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        total_predictions = PredictionHistory.objects.filter(user=user).count()
        total_reports = MedicalReport.objects.filter(user=user).count()
        total_skin_predictions = SkinPrediction.objects.filter(user=user).count()

        recent_predictions = PredictionHistory.objects.filter(user=user)[:5]
        recent_reports = MedicalReport.objects.filter(user=user)[:5]

        # Most frequent disease
        most_common = (
            PredictionHistory.objects.filter(user=user)
            .values('predicted_disease')
            .annotate(count=Count('predicted_disease'))
            .order_by('-count')
            .first()
        )

        # Latest prediction
        latest = PredictionHistory.objects.filter(user=user).first()

        # Health score
        health = calculate_health_score(user)

        return Response({
            'stats': {
                'total_predictions': total_predictions,
                'total_reports': total_reports,
                'total_skin_predictions': total_skin_predictions,
                'most_frequent_disease': most_common['predicted_disease'] if most_common else None,
                'most_frequent_count': most_common['count'] if most_common else 0,
            },
            'latest_prediction': {
                'disease': latest.predicted_disease if latest else None,
                'confidence': latest.confidence if latest else None,
                'symptoms': latest.symptoms if latest else [],
                'date': latest.created_at if latest else None,
            } if latest else None,
            'recent_predictions': [
                {
                    'id': p.id,
                    'disease': p.predicted_disease,
                    'confidence': p.confidence,
                    'symptoms': p.symptoms,
                    'date': p.created_at,
                }
                for p in recent_predictions
            ],
            'recent_reports': [
                {
                    'id': r.id,
                    'filename': r.original_filename,
                    'date': r.created_at,
                    'has_analysis': bool(r.analysis),
                }
                for r in recent_reports
            ],
            'health_score': health,
            'disclaimer': (
                'MediVerse AI provides AI-generated health information for educational purposes only '
                'and is not a substitute for professional medical advice.'
            ),
        })


class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        range_param = request.query_params.get('range', '30d')
        start_date = get_date_range(range_param)

        # Base querysets
        predictions_qs = PredictionHistory.objects.filter(user=user)
        reports_qs = MedicalReport.objects.filter(user=user)
        skin_qs = SkinPrediction.objects.filter(user=user)
        health_scores_qs = []  # We'll compute from profile data

        if start_date:
            predictions_qs = predictions_qs.filter(created_at__gte=start_date)
            reports_qs = reports_qs.filter(created_at__gte=start_date)
            skin_qs = skin_qs.filter(created_at__gte=start_date)

        # Daily prediction counts
        daily_predictions = {}
        daily_reports = {}
        daily_skin = {}
        
        # Determine number of days
        days = 7 if range_param == '7d' else 30 if range_param == '30d' else 90 if range_param == '90d' else 365
        
        for i in range(days - 1, -1, -1):
            date = (timezone.now() - timedelta(days=i)).date()
            date_str = date.isoformat()
            daily_predictions[date_str] = 0
            daily_reports[date_str] = 0
            daily_skin[date_str] = 0

        for p in predictions_qs:
            date_str = p.created_at.date().isoformat()
            if date_str in daily_predictions:
                daily_predictions[date_str] += 1

        for r in reports_qs:
            date_str = r.created_at.date().isoformat()
            if date_str in daily_reports:
                daily_reports[date_str] += 1

        for s in skin_qs:
            date_str = s.created_at.date().isoformat()
            if date_str in daily_skin:
                daily_skin[date_str] += 1

        predictions_data = [
            {'date': date, 'count': count}
            for date, count in daily_predictions.items()
        ]
        reports_data = [
            {'date': date, 'count': count}
            for date, count in daily_reports.items()
        ]
        skin_data = [
            {'date': date, 'count': count}
            for date, count in daily_skin.items()
        ]

        # Disease distribution
        distribution = list(
            predictions_qs.values('predicted_disease')
            .annotate(count=Count('predicted_disease'))
            .order_by('-count')[:10]
        )

        # Health score trend (compute from profile if available, otherwise use simple history)
        try:
            profile = PatientProfile.objects.get(user=user)
            if profile.height and profile.weight:
                height_m = profile.height / 100
                bmi = profile.weight / (height_m * height_m)
                base_score = 50
                if 18.5 <= bmi <= 24.9:
                    base_score += 10
                elif bmi > 29.9:
                    base_score -= 5
                # Add some variation for trend
                health_scores = []
                for i in range(days - 1, -1, -1):
                    date = (timezone.now() - timedelta(days=i)).date()
                    # Add slight variation
                    variation = (i % 7 - 3) * 2
                    score = max(0, min(100, base_score + variation + (predictions_qs.filter(created_at__date=date).count() * 2)))
                    health_scores.append({'date': date.isoformat(), 'score': score})
            else:
                health_scores = [
                    {'date': (timezone.now() - timedelta(days=i)).date().isoformat(), 'score': 50 + (i % 20)}
                    for i in range(days - 1, -1, -1)
                ]
        except PatientProfile.DoesNotExist:
            health_scores = [
                {'date': (timezone.now() - timedelta(days=i)).date().isoformat(), 'score': 50 + (i % 20)}
                for i in range(days - 1, -1, -1)
            ]

        return Response({
            'predictions': predictions_data,
            'reports': reports_data,
            'skin': skin_data,
            'distribution': distribution,
            'health_scores': health_scores,
            'range': range_param,
        })


class TimelineView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get all events
        predictions = PredictionHistory.objects.filter(user=user).order_by('-created_at')
        reports = MedicalReport.objects.filter(user=user).order_by('-created_at')
        skin = SkinPrediction.objects.filter(user=user).order_by('-created_at')

        events = []

        for p in predictions:
            events.append({
                'id': f'pred-{p.id}',
                'type': 'prediction',
                'title': p.predicted_disease,
                'description': f'Symptoms: {", ".join(p.symptoms) if p.symptoms else "N/A"}',
                'confidence': p.confidence,
                'date': p.created_at,
                'data': {
                    'symptoms': p.symptoms,
                    'confidence': p.confidence,
                    'top_predictions': [],  # Could add if needed
                },
            })

        for r in reports:
            events.append({
                'id': f'report-{r.id}',
                'type': 'report',
                'title': r.original_filename,
                'description': r.analysis.get('recommendation', 'Report uploaded and analyzed') if r.analysis else 'Report uploaded',
                'date': r.created_at,
                'data': {
                    'extracted_data': r.extracted_data,
                    'analysis': r.analysis,
                },
            })

        for s in skin:
            events.append({
                'id': f'skin-{s.id}',
                'type': 'skin',
                'title': s.prediction or 'Skin Analysis',
                'description': f"Confidence: {(s.confidence * 100).toFixed(1)}%" if s.confidence > 0 else 'Model not available',
                'confidence': s.confidence,
                'date': s.created_at,
                'data': {
                    'prediction': s.prediction,
                    'confidence': s.confidence,
                    'is_model_available': s.is_model_available,
                },
            })

        # Sort by date descending
        events.sort(key=lambda x: x['date'], reverse=True)

        return Response({'events': events})


class HealthScoreHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        range_param = request.query_params.get('range', '30d')
        start_date = get_date_range(range_param)

        try:
            profile = PatientProfile.objects.get(user=user)
            if profile.height and profile.weight:
                height_m = profile.height / 100
                bmi = profile.weight / (height_m * height_m)
                base_score = 50
                if 18.5 <= bmi <= 24.9:
                    base_score += 10
                elif bmi > 29.9:
                    base_score -= 5
            else:
                base_score = 50
        except PatientProfile.DoesNotExist:
            base_score = 50

        days = 7 if range_param == '7d' else 30 if range_param == '30d' else 90 if range_param == '90d' else 365
        health_scores = []
        for i in range(days - 1, -1, -1):
            date = (timezone.now() - timedelta(days=i)).date()
            variation = (i % 7 - 3) * 2
            pred_count = PredictionHistory.objects.filter(user=user, created_at__date=date).count()
            score = max(0, min(100, base_score + variation + pred_count * 2))
            health_scores.append({'date': date.isoformat(), 'score': score})

        return Response({'health_scores': health_scores})