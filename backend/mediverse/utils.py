"""
Custom exception handler for consistent API error responses.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent error format.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Format the response to our standard
        error_data = {
            'success': False,
            'message': 'An error occurred',
            'errors': response.data,
        }

        # Extract a more user-friendly message
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                error_data['message'] = str(response.data['detail'])
            elif 'error' in response.data:
                error_data['message'] = str(response.data['error'])
            elif 'non_field_errors' in response.data:
                error_data['message'] = ' '.join(str(e) for e in response.data['non_field_errors'])
            else:
                # Get first error message
                for key, value in response.data.items():
                    if isinstance(value, list) and value:
                        error_data['message'] = f"{key}: {value[0]}"
                        break
                    elif isinstance(value, str):
                        error_data['message'] = f"{key}: {value}"
                        break

        response.data = error_data

    else:
        # Handle uncaught exceptions (500 errors)
        logger.exception("Uncaught exception", exc_info=exc)
        response = Response(
            {
                'success': False,
                'message': 'An internal server error occurred. Please try again later.',
                'errors': {},
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response