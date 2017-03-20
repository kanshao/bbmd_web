from bokeh.core.json_encoder import BokehJSONEncoder

from rest_framework import filters, viewsets
from rest_framework.decorators import detail_route
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer

from django.db.models import Q
from django.shortcuts import Http404
from django.shortcuts import get_object_or_404
from utils.api import OwnedButSharablePermission
from utils.renderers import TxtRenderer, DocxRenderer, XLSXRenderer

from . import models, forms, serializers


class PlottingJSONRenderer(JSONRenderer):
    encoder_class = BokehJSONEncoder


class RunViewset(OwnedButSharablePermission, viewsets.ModelViewSet):

    serializer_class = serializers.RunSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_class = forms.RunFilters

    def get_is_public(self, obj):
        return obj.public

    def get_owner(self, obj):
        return obj.owner

    def get_queryset(self):
        query = Q(public=True)
        user = self.request.user
        if user.is_authenticated():
            if user.is_staff:
                query = Q(id__gt=0)  # any
            else:
                query = query | Q(owner=user)

        return models.Run.objects\
            .filter(query)\
            .order_by('last_updated')

    @detail_route(methods=['get'], renderer_classes=(PlottingJSONRenderer,))
    def plot(self, request, pk=None, run_id=None):
        obj = self.get_object()
        data = obj.get_plot()
        return Response(data)

    @detail_route(methods=['get'], renderer_classes=(DocxRenderer,))
    def docx(self, request, pk=None, run_id=None):
        obj = self.get_object()
        data = obj.get_word_report()
        fn = u'{}.docx'.format(obj.to_slug())
        resp = Response(data)
        resp['Content-Disposition'] = u'attachment; filename="{}"'.format(fn)
        return resp

    @detail_route(methods=['get'], renderer_classes=(TxtRenderer,))
    def summary_txt(self, request, pk=None):
        obj = self.get_object()
        data = obj.get_report(format='txt')
        fn = u'{}.txt'.format(obj.to_slug())
        resp = Response(data)
        resp['Content-Disposition'] = u'attachment; filename="{}"'.format(fn)
        return resp

    @detail_route(methods=['get'], renderer_classes=(TxtRenderer,))
    def summary_json(self, request, pk=None):
        obj = self.get_object()
        data = obj.get_report(format='json')
        fn = u'{}.json'.format(obj.to_slug())
        resp = Response(data)
        resp['Content-Disposition'] = u'attachment; filename="{}"'.format(fn)
        return resp

    @detail_route(methods=['get'], renderer_classes=(XLSXRenderer,))
    def xlsx_params(self, request, pk=None, run_id=None):
        obj = self.get_object()
        data = obj.get_parameters_flatfile()
        fn = u'{}-parameters.xlsx'.format(obj.to_slug())
        resp = Response(data)
        resp['Content-Disposition'] = u'attachment; filename="{}"'.format(fn)
        return resp

    @detail_route(methods=['get'], renderer_classes=(XLSXRenderer,))
    def xlsx_bmds(self, request, pk=None, run_id=None):
        obj = self.get_object()
        data = obj.get_bmds_flatfile()
        fn = u'{}-bmds.xlsx'.format(obj.to_slug())
        resp = Response(data)
        resp['Content-Disposition'] = u'attachment; filename="{}"'.format(fn)
        return resp


class ModelSettingsViewset(OwnedButSharablePermission, viewsets.ModelViewSet):

    serializer_class = serializers.ModelSettingsSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_class = forms.ModelSettingsFilters

    def get_is_public(self, obj):
        return obj.run.public

    def get_owner(self, obj):
        return obj.run.owner

    def get_queryset(self):
        run = get_object_or_404(models.Run, id=self.kwargs.get('run_id'))
        if not run.user_can_view(self.request.user):
            return models.ModelSettings.objects.none()
        return models.ModelSettings.objects\
            .filter(run=run)\
            .order_by('created')

    @detail_route(methods=['get'], renderer_classes=(PlottingJSONRenderer,))
    def plot(self, request, pk=None, run_id=None):
        obj = get_object_or_404(models.ModelSettings, id=pk)
        if not self.check_object_permissions(request, obj):
            raise Http404()
        data = obj.get_plot()
        return Response(data)

    @detail_route(methods=['get'], renderer_classes=(PlottingJSONRenderer,))
    def parameter_plot(self, request, pk=None, run_id=None):
        obj = get_object_or_404(models.ModelSettings, id=pk)
        if not self.check_object_permissions(request, obj):
            raise Http404()
        data = obj.get_parameter_plot()
        return Response(data)


class BMDAnalysisViewset(OwnedButSharablePermission, viewsets.ModelViewSet):

    serializer_class = serializers.BMDAnalysisSerializer
    filter_backends = (filters.DjangoFilterBackend,)

    def get_is_public(self, obj):
        return obj.run.public

    def get_owner(self, obj):
        return obj.run.owner

    def get_queryset(self):
        run = get_object_or_404(models.Run, id=self.kwargs.get('run_id'))
        if not run.user_can_view(self.request.user):
            return models.BMDAnalysis.objects.none()
        return models.BMDAnalysis.objects\
            .filter(run=run)\
            .order_by('created')

    def create_bmd_models(self, serializer):
        weights = serializer.prior_weights

        existings = models.BMDAnalysisModel.objects\
            .filter(analysis=serializer.instance.id, model_id__in=weights.keys())

        for obj in existings:
            obj.prior_weight = weights[obj.model_id]
            obj.result = ''
            obj.save()

        news_ids = set(weights.keys()) - \
            set(existings.values_list('model_id', flat=True))
        news = [
            models.BMDAnalysisModel(
                analysis_id=serializer.instance.id,
                model_id=id_,
                prior_weight=weights[id_],
            ) for id_ in news_ids
        ]
        models.BMDAnalysisModel.objects.bulk_create(news)

    def perform_create(self, serializer):
        super(BMDAnalysisViewset, self).perform_create(serializer)
        self.create_bmd_models(serializer)
        serializer.instance.calculate_bmds()

    def perform_update(self, serializer):
        super(BMDAnalysisViewset, self).perform_update(serializer)
        self.create_bmd_models(serializer)
        serializer.instance.calculate_bmds()

    @detail_route(methods=['get'], renderer_classes=(PlottingJSONRenderer,))
    def plot(self, request, pk=None, run_id=None):
        obj = get_object_or_404(models.BMDAnalysis, id=pk)
        if not self.check_object_permissions(request, obj):
            raise Http404()
        data = obj.get_plots()
        return Response(data)
