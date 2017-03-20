import django_filters

from . import models


class RunFilters(django_filters.rest_framework.FilterSet):

    class Meta:
        model = models.Run
        fields = ['owner', ]


class ModelSettingsFilters(django_filters.rest_framework.FilterSet):

    class Meta:
        model = models.ModelSettings
        fields = ['run', ]
