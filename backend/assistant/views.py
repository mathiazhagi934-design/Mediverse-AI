from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import AssistantChatSerializer
from disease.models import PredictionHistory
from reports.models import MedicalReport
from skin.models import SkinPrediction
from dashboard.views import calculate_health_score


class AssistantChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AssistantChatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.validated_data['message']
        context = serializer.validated_data.get('context', {})
        history = serializer.validated_data.get('history', [])

        # Enrich context with actual user data from database
        enriched_context = self.enrich_context(context, request.user)

        # Generate response based on message and context
        response = self.generate_response(message, enriched_context, history, request.user)

        return Response({
            'response': response,
        })

    def enrich_context(self, context, user):
        """Fetch actual user data from database to enrich context."""
        # Get recent predictions
        recent_predictions = list(PredictionHistory.objects.filter(user=user)
            .order_by('-created_at')[:5]
            .values('id', 'predicted_disease', 'confidence', 'symptoms', 'created_at'))

        # Get recent reports
        recent_reports = list(MedicalReport.objects.filter(user=user)
            .order_by('-created_at')[:5]
            .values('id', 'original_filename', 'created_at', 'analysis'))

        # Get recent skin predictions
        recent_skin = list(SkinPrediction.objects.filter(user=user)
            .order_by('-created_at')[:5]
            .values('id', 'prediction', 'confidence', 'is_model_available', 'created_at'))

        # Get health score
        health_score = calculate_health_score(user)

        return {
            **context,
            'recentPredictions': recent_predictions,
            'recentReports': recent_reports,
            'recentSkin': recent_skin,
            'healthScore': health_score,
            'userProfile': {
                'username': user.username,
                'email': user.email,
            }
        }

    def generate_response(self, message, context, history, user):
        """Generate a contextual response based on user's health data."""
        message_lower = message.lower()
        user_profile = context.get('userProfile', {})

        # Check for specific health-related queries
        if any(keyword in message_lower for keyword in ['predict', 'prediction', 'disease', 'symptom']):
            return self.get_prediction_response(user, context)

        if any(keyword in message_lower for keyword in ['report', 'lab', 'blood', 'test']):
            return self.get_report_response(user, context)

        if any(keyword in message_lower for keyword in ['health score', 'score', 'wellness']):
            return self.get_health_score_response(user, context)

        if any(keyword in message_lower for keyword in ['doctor', 'discuss', 'appointment', 'medical']):
            return self.get_doctor_discussion_response(user, context)

        if any(keyword in message_lower for keyword in ['improve', 'better', 'increase', 'tips', 'advice']):
            return self.get_improvement_tips(user, context)

        if any(keyword in message_lower for keyword in ['how', 'work', 'algorithm', 'model', 'ai']):
            return self.get_how_it_works_response()

        # Default response
        return self.get_general_response(message, user, context)

    def get_prediction_response(self, user, context):
        predictions = context.get('recentPredictions', [])
        if predictions:
            latest = predictions[0]
            disease = latest.get('predicted_disease', 'Unknown')
            confidence = latest.get('confidence', 0)
            symptoms = latest.get('symptoms', [])
            date = latest.get('created_at', '')
            
            return (
                f"Your latest prediction was **{disease}** with **{confidence:.1%}** confidence "
                f"on {date}. The symptoms considered were: {', '.join(symptoms) if symptoms else 'N/A'}.\n\n"
                f"**Important:** This is an AI-generated educational prediction, not a medical diagnosis. "
                f"Please consult a healthcare professional for proper evaluation."
            )
        else:
            return (
                "You don't have any predictions yet. You can use the Disease Prediction tool "
                "to analyze symptoms and get AI-powered predictions.\n\n"
                "**Remember:** All predictions are for educational purposes only and not medical diagnoses."
            )

    def get_report_response(self, user, context):
        reports = context.get('recentReports', [])
        if reports:
            latest = reports[0]
            filename = latest.get('original_filename', 'Unknown')
            has_analysis = bool(latest.get('analysis'))
            date = latest.get('created_at', '')
            
            response = f"Your most recent report is **{filename}** uploaded on {date}."
            if has_analysis:
                response += " This report has been analyzed and you can view the detailed results in the Medical Reports section."
            else:
                response += " This report is pending analysis."
            
            response += "\n\n**Note:** Report analysis is automated and for educational purposes only. Always discuss results with your doctor."
            return response
        else:
            return (
                "You don't have any uploaded medical reports yet. You can upload PDF reports "
                "in the Medical Reports section for AI-powered analysis and extraction."
            )

    def get_health_score_response(self, user, context):
        health_score = context.get('healthScore', {})
        score = health_score.get('score', 0)
        factors = health_score.get('factors', [])
        
        response = f"Your current Health Score is **{score}/100**.\n\n"
        response += "This educational wellness indicator is based on:\n\n"
        
        if factors:
            for factor in factors:
                impact = factor.get('impact', 0)
                detail = factor.get('detail', '')
                sign = '+' if impact > 0 else ''
                response += f"• **{factor.get('factor', 'Factor')}** ({sign}{impact} pts): {detail}\n"
        else:
            response += "• **Profile Completeness** - How complete your health profile is\n"
            response += "• **BMI** - If height and weight are provided\n"
            response += "• **Health Monitoring** - Number of predictions tracked\n"
            response += "• **Report Tracking** - Number of reports uploaded\n"
            response += "• **Health Alerts** - High-confidence predictions\n"
        
        response += f"\nThe score ranges from 0-100 and is **not a medical assessment**. "
        response += "It's designed to encourage healthy tracking habits. "
        response += "Complete your profile and use the prediction tools to improve your score!"
        return response

    def get_doctor_discussion_response(self, user, context):
        return (
            "When discussing your MediVerse AI results with a healthcare provider, consider sharing:\n\n"
            "1. **Prediction History** - Your symptom analyses and AI predictions with confidence scores\n"
            "2. **Medical Reports** - Uploaded lab results and their automated interpretations\n"
            "3. **Health Score Factors** - What contributes to your wellness score\n"
            "4. **Symptom Patterns** - Recurring symptoms you've tracked over time\n"
            "5. **Skin Analyses** - Any skin condition detections (if applicable)\n\n"
            "**Important:** MediVerse AI is an educational tool. Always present the results as "
            "AI-generated insights for discussion, not as medical diagnoses. Your doctor will "
            "appreciate having this organized health data for your consultation."
        )

    def get_improvement_tips(self, user, context):
        return (
            "Here are some general wellness tips to support your health journey:\n\n"
            "🏃 **Physical Activity**\n"
            "• Aim for 150 minutes of moderate exercise per week\n"
            "• Include strength training 2-3 times per week\n"
            "• Take regular movement breaks if you have a desk job\n\n"
            "🥗 **Nutrition**\n"
            "• Eat a variety of fruits and vegetables (5+ servings daily)\n"
            "• Choose whole grains over refined grains\n"
            "• Limit processed foods, added sugars, and excess sodium\n"
            "• Stay hydrated - 8+ glasses of water daily\n\n"
            "😴 **Sleep & Recovery**\n"
            "• Maintain consistent sleep schedule (7-9 hours)\n"
            "• Create a relaxing bedtime routine\n"
            "• Limit screen time before bed\n\n"
            "🧠 **Mental Wellness**\n"
            "• Practice stress management (meditation, deep breathing)\n"
            "• Stay socially connected\n"
            "• Seek professional support when needed\n\n"
            "📋 **Health Tracking**\n"
            "• Complete your MediVerse profile for personalized insights\n"
            "• Track symptoms regularly using the prediction tool\n"
            "• Upload medical reports for comprehensive tracking\n"
            "• Schedule regular checkups with your healthcare provider\n\n"
            "**Disclaimer:** These are general wellness tips for educational purposes. "
            "Consult a healthcare professional for personalized medical advice."
        )

    def get_how_it_works_response(self):
        return (
            "MediVerse AI uses machine learning models to provide educational health insights:\n\n"
            "**Disease Prediction**\n"
            "• Uses a trained Random Forest classifier on symptom-disease patterns\n"
            "• Analyzes selected symptoms against known disease profiles\n"
            "• Provides confidence scores and top alternative predictions\n\n"
            "**Medical Report Analysis**\n"
            "• Extracts text from PDF reports using pdfplumber\n"
            "• Applies regex patterns to identify common lab values\n"
            "• Compares values against standard reference ranges\n"
            "• Generates educational interpretations\n\n"
            "**Skin Analysis**\n"
            "• Uses a convolutional neural network (when model is available)\n"
            "• Classifies skin lesions into 8 categories\n"
            "• Requires a trained model (skin_model.h5) to be configured\n\n"
            "**Health Score**\n"
            "• Transparent algorithm based on profile completeness, BMI, and activity\n"
            "• Educational wellness indicator only - not a medical assessment\n\n"
            "**All AI outputs are for educational purposes only and should not replace professional medical advice.**"
        )

    def get_general_response(self, message, user, context):
        return (
            "I'm here to help you understand your health data from MediVerse AI! "
            "You can ask me about:\n\n"
            "• **Your latest prediction** - \"Explain my latest prediction\"\n"
            "• **Medical reports** - \"What does my report contain?\"\n"
            "• **Health score** - \"Explain my health score\"\n"
            "• **Doctor discussions** - \"What should I discuss with my doctor?\"\n"
            "• **Wellness tips** - \"How can I improve my health?\"\n"
            "• **How it works** - \"How does the AI prediction work?\"\n\n"
            "What would you like to know more about?"
        )