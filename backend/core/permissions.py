from rest_framework import permissions


class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to users with the ADMIN role or superuser/staff privileges.
    """
    message = "Access restricted to administrators only."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )


class IsStudentUserRole(permissions.BasePermission):
    """
    Allows access only to users with the STUDENT role.
    """
    message = "Access restricted to students only."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'STUDENT'
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admins can modify; authenticated students can read.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
