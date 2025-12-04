from rest_framework import permissions


class IsJobProvider(permissions.BasePermission):
    """Permission check for job providers"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'org_provider'


class IsJobOwner(permissions.BasePermission):
    """Permission check for job owner"""
    
    def has_object_permission(self, request, view, obj):
        return obj.created_by == request.user


class IsJobSeeker(permissions.BasePermission):
    """Permission check for job seekers"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type in ['individual', 'org_seeker']


class IsApplicationOwner(permissions.BasePermission):
    """Permission check for application owner"""
    
    def has_object_permission(self, request, view, obj):
        return obj.applicant == request.user or obj.job.created_by == request.user

