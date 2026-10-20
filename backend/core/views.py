from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection


@api_view(['GET'])
@permission_classes([AllowAny])
def api_status(request):
    """
    Health check endpoint to verify backend status and PostgreSQL connection.
    """
    db_ok = True
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        db_ok = False
        db_error = str(e)

    return Response({
        "status": "online",
        "database": "PostgreSQL connected" if db_ok else f"Database error: {db_error}",
        "message": "Online Examination and Assessment Platform API is operational.",
        "version": "1.0.0"
    })
