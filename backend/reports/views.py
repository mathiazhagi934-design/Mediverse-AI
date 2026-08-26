import re
import logging
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MedicalReport
from .serializers import MedicalReportSerializer, UploadReportSerializer

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = ['.pdf']

# Common medical lab value patterns
MEDICAL_PATTERNS = {
    'hemoglobin': r'hemoglobin[:\s]*(\d+\.?\d*)\s*(g/dl|g/dL)?',
    'glucose': r'glucose[:\s]*(\d+\.?\d*)\s*(mg/dl|mg/dL)?',
    'cholesterol': r'cholesterol[:\s]*(\d+\.?\d*)\s*(mg/dl|mg/dL)?',
    'blood_pressure': r'(?:blood\s*pressure|bp)[:\s]*(\d{2,3})\s*/\s*(\d{2,3})',
    'heart_rate': r'heart\s*rate[:\s]*(\d+\.?\d*)\s*(bpm)?',
    'white_blood_cells': r'white\s*blood\s*(?:cell|count)[s]?[:\s]*(\d+\.?\d*)',
    'red_blood_cells': r'red\s*blood\s*(?:cell|count)[s]?[:\s]*(\d+\.?\d*)',
    'platelets': r'platelets[:\s]*(\d+\.?\d*)',
    'temperature': r'temperature[:\s]*(\d+\.?\d*)',
    'bmi': r'bmi[:\s]*(\d+\.?\d*)',
    'creatinine': r'creatinine[:\s]*(\d+\.?\d*)\s*(mg/dl|mg/dL)?',
    'urea': r'urea[:\s]*(\d+\.?\d*)\s*(mg/dl|mg/dL)?',
    'bilirubin': r'bilirubin[:\s]*(\d+\.?\d*)',
    'patient_name': r'(?:patient|name)[:\s]*([A-Za-z\s]+)',
    'age': r'age[:\s]*(\d+)',
}

# Reference ranges for interpretation
REFERENCE_RANGES = {
    'hemoglobin': {'low': 12.0, 'high': 17.5, 'unit': 'g/dL', 'optimal_low': 13.5, 'optimal_high': 17.0},
    'glucose': {'low': 70, 'high': 140, 'unit': 'mg/dL', 'optimal_low': 70, 'optimal_high': 100},
    'cholesterol': {'low': 0, 'high': 240, 'unit': 'mg/dL', 'optimal_low': 100, 'optimal_high': 200},
    'platelets': {'low': 150000, 'high': 400000, 'unit': '/μL'},
    'white_blood_cells': {'low': 4000, 'high': 11000, 'unit': '/μL'},
    'creatinine': {'low': 0.6, 'high': 1.2, 'unit': 'mg/dL'},
}


def extract_text_from_pdf(file_obj):
    """Extract text from PDF using pdfplumber."""
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(file_obj) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return '\n'.join(text_parts)
    except ImportError:
        logger.warning("pdfplumber not installed")
        return ''
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        return ''


def extract_medical_data(text):
    """Extract structured medical data from text."""
    extracted = {}
    text_lower = text.lower()

    for key, pattern in MEDICAL_PATTERNS.items():
        match = re.search(pattern, text_lower)
        if match:
            groups = match.groups()
            if key == 'blood_pressure' and len(groups) >= 2:
                extracted[key] = f"{groups[0]}/{groups[1]}"
            elif groups:
                try:
                    extracted[key] = float(groups[0])
                except (ValueError, TypeError):
                    extracted[key] = groups[0]

    return extracted


def analyze_values(extracted_data):
    """Generate educational interpretation of extracted values."""
    interpretations = []
    warnings = []

    for key, value in extracted_data.items():
        if key in REFERENCE_RANGES and isinstance(value, (int, float)):
            ref = REFERENCE_RANGES[key]
            if value < ref.get('low', 0):
                interpretations.append({
                    'test': key,
                    'value': value,
                    'status': 'low',
                    'message': f'{key.replace("_", " ").title()} is below the reference range ({ref["low"]}-{ref["high"]} {ref.get("unit", "")}).',
                })
                warnings.append(f'Low {key.replace("_", " ")} detected.')
            elif value > ref.get('high', float('inf')):
                interpretations.append({
                    'test': key,
                    'value': value,
                    'status': 'high',
                    'message': f'{key.replace("_", " ").title()} is above the reference range ({ref["low"]}-{ref["high"]} {ref.get("unit", "")}).',
                })
                warnings.append(f'High {key.replace("_", " ")} detected.')
            else:
                interpretations.append({
                    'test': key,
                    'value': value,
                    'status': 'normal',
                    'message': f'{key.replace("_", " ").title()} is within the reference range.',
                })

    return {
        'interpretations': interpretations,
        'warnings': warnings,
        'recommendation': _generate_recommendation(interpretations),
    }


def _generate_recommendation(interpretations):
    """Generate general recommendation based on interpretations."""
    has_issues = any(i['status'] != 'normal' for i in interpretations)
    if has_issues:
        return (
            "Some values are outside the normal reference range. "
            "This information is for educational purposes only. "
            "Please consult a healthcare professional for proper evaluation."
        )
    return (
        "All extracted values appear to be within normal reference ranges. "
        "This is an automated analysis for educational purposes only. "
        "Regular health checkups are recommended."
    )


class ReportUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UploadReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']

        # Validate file extension
        filename = file.name.lower()
        if not any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
            return Response(
                {'error': 'Only PDF files are accepted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file size
        if file.size > MAX_FILE_SIZE:
            return Response(
                {'error': f'File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate not empty
        if file.size == 0:
            return Response(
                {'error': 'The uploaded file is empty.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Extract text
        extracted_text = extract_text_from_pdf(file)
        if not extracted_text.strip():
            return Response(
                {'error': 'Could not extract text from the PDF. The file may be corrupted or image-based.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Extract structured data
        extracted_data = extract_medical_data(extracted_text)
        analysis = analyze_values(extracted_data)

        # Save report
        report = MedicalReport.objects.create(
            user=request.user,
            file=file,
            original_filename=file.name,
            file_size=file.size,
            extracted_text=extracted_text[:10000],
            extracted_data=extracted_data,
            analysis=analysis,
        )

        return Response(MedicalReportSerializer(report).data, status=status.HTTP_201_CREATED)


class ReportListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reports = MedicalReport.objects.filter(user=request.user)
        serializer = MedicalReportSerializer(reports, many=True)
        return Response(serializer.data)


class ReportDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            report = MedicalReport.objects.get(pk=pk, user=request.user)
        except MedicalReport.DoesNotExist:
            return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(MedicalReportSerializer(report).data)

    def delete(self, request, pk):
        try:
            report = MedicalReport.objects.get(pk=pk, user=request.user)
        except MedicalReport.DoesNotExist:
            return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)
        report.file.delete(save=False)
        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
