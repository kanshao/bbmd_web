import logging
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.conf import settings
from django.core.urlresolvers import reverse_lazy
from django.http import HttpResponseRedirect
from django.utils.decorators import method_decorator
from django.views.generic import View, TemplateView, DetailView, UpdateView, \
                                 DeleteView, ListView
from django.shortcuts import redirect
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse

import pystan

from . import models, tasks


class About(TemplateView):
    template_name = 'about.html'


class ViewRunMixin(object):
    slug_field = 'uuid'
    slug_url_kwarg = 'uuid'

    def get_object(self, queryset=None):
        obj = super(ViewRunMixin, self).get_object(queryset)
        if isinstance(self, RunDetail):
            method = obj.user_can_view
        else:
            method = obj.is_owner
        logging.info("Permissions checked")
        if not method(self.request.user):
            raise PermissionDenied
        return obj

    def get_context_data(self, **kwargs):
        context = super(ViewRunMixin, self).get_context_data(**kwargs)
        model = self.object.models.first()
        if model:
            pystan_version = model.pystan_version
        else:
            pystan_version = pystan.__version__
        context['pystan_version'] = pystan_version
        return context


class RunList(ListView):
    model = models.Run
    http_method_names = ['get', 'post']

    def get_queryset(self):
        qs = self.model.objects.none()
        if self.request.user.is_authenticated():
            qs = self.model.objects.filter(owner=self.request.user)
        return qs

    def post(self, request, *args, **kwargs):
        user = authenticate(
            username=settings.TEST_ACCOUNT_USERNAME,
            password=settings.TEST_ACCOUNT_PASSWORD
        )
        if user is None:
            raise LookupError('Error with username {} not found!'
                              .format(settings.TEST_ACCOUNT_USERNAME))
        login(request, user)
        redirect_to = reverse_lazy('home')
        return HttpResponseRedirect(redirect_to)

    def isTestAccount(self, user):
        return user.is_authenticated() and \
            user.email == settings.TEST_ACCOUNT_USERNAME

    def get_context_data(self, **kwargs):
        context = super(RunList, self).get_context_data(**kwargs)
        context['isTestAccount'] = self.isTestAccount(self.request.user)
        return context


class RunCreate(View):
    http_method_names = ['get', ]

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(RunCreate, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        run = models.Run.create_default(request)
        return redirect(run.get_update_url())


class RunDetail(ViewRunMixin, DetailView):
    model = models.Run

    def get_context_data(self, **kwargs):
        context = super(RunDetail, self).get_context_data(**kwargs)
        context['isEditMode'] = False
        return context


class RunExecute(ViewRunMixin, UpdateView):
    model = models.Run
    http_method_names = ['post', ]

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        task = tasks.execute.apply_async(args=[self.object.id, ])
        if task.ready():
            task.forget()
        return JsonResponse({"isComplete": True})


class RunUpdate(ViewRunMixin, UpdateView):
    template_name = 'bbmdweb/run_detail.html'
    model = models.Run
    fields = ("name", )

    def get_context_data(self, **kwargs):
        context = super(RunUpdate, self).get_context_data(**kwargs)
        context['isEditMode'] = True
        return context


class RunDelete(ViewRunMixin, DeleteView):
    model = models.Run
    success_url = reverse_lazy("home")
