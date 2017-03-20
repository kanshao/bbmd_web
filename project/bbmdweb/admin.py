from django.contrib import admin
from django.db.models import Count

from . import models


class RunAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'id',
        'owner',
        'data_type',
        'num_models',
        'num_bmds',
        'public',
        'created',
    )

    list_filter = (
        'public',
        'data_type',
        'owner',
    )

    search_fields = ('name', 'owner__email', )
    ordering = ('-created', )

    def get_queryset(self, request):
        return self.model.objects\
            .annotate(number_models=Count('models', distinct=True))\
            .annotate(number_bmds=Count('bmds', distinct=True))

    def num_models(self, inst):
        return inst.number_models
    num_models.admin_order_field = 'number_models'
    num_models.short_description = 'Models'

    def num_bmds(self, inst):
        return inst.number_bmds
    num_bmds.admin_order_field = 'number_bmds'
    num_bmds.short_description = 'BMDs'


class ModelSettingsAdmin(admin.ModelAdmin):
    list_display = (
        'run',
        'name',
        'model_type',
        'power_lower_bound',
        'predicted_pvalue',
        'model_weight_scaler',
        'vectors',
        'created',
        'last_updated',
    )


class BMDAnalysisAdmin(admin.ModelAdmin):
    list_display = (
        'run',
        'name',
        'subtype',
        'bmr',
        'adversity_ct_type',
        'adversity_hybrid_type',
        'adversity_value',
        'vectors',
        'created',
        'last_updated',
    )


class BMDAnalysisModelAdmin(admin.ModelAdmin):
    list_display = (
        'analysis',
        'model',
        'weight',
        'prior_weight',
        'vectors',
        'created',
        'last_updated',
    )


admin.site.register(models.Run, RunAdmin)
admin.site.register(models.ModelSettings, ModelSettingsAdmin)
admin.site.register(models.BMDAnalysis, BMDAnalysisAdmin)
admin.site.register(models.BMDAnalysisModel, BMDAnalysisModelAdmin)
