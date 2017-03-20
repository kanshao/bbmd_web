from django.contrib import admin
from django.db.models import Count

from . import models


class UserAdmin(admin.ModelAdmin):
    list_display = (
        'email',
        'id',
        'date_joined',
        'runs',
        'is_staff',
    )
    search_fields = ('email', )
    ordering = ('-date_joined', )

    def get_queryset(self, request):
        return self.model.objects.annotate(number_runs=Count('run'))

    def runs(self, inst):
        return inst.number_runs
    runs.admin_order_field = 'number_runs'
    runs.short_description = 'Number of runs'


admin.site.register(models.User, UserAdmin)
