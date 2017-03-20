import logging
from rest_framework import authentication, permissions


class SiteMixin(object):
    """
    Default settings for view authentication, permissions, filtering
    and pagination.
    """
    authentication_classes = (
        authentication.SessionAuthentication,
    )
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
    )
    paginate_by = 25
    paginate_by_param = 'page_size'
    max_paginate_by = 1000


class OwnedButSharablePermission(permissions.BasePermission):

    def get_is_public(self, obj):
        pass

    def get_owner(self, obj):
        pass

    def check_object_permissions(self, request, obj):
        logging.info("Permissions checked")

        if request.method in permissions.SAFE_METHODS and self.get_is_public(obj):
            return True

        if request.user.is_authenticated() and request.user.is_staff:
            return True

        if request.user.is_anonymous():
            return False

        return self.get_owner(obj) == request.user


class OwnedButShareableMixin(SiteMixin):
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
        OwnedButSharablePermission,
    )
