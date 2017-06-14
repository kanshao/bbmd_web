from io import BytesIO
import uuid
from copy import deepcopy
from datetime import datetime
from random import randint

import numpy as np

from django.core.urlresolvers import reverse
from django.core import validators
from django.db import models
from django.contrib.postgres.fields import ArrayField, JSONField
from django.utils.text import slugify

from picklefield.fields import PickledObjectField

from myuser.models import User

from bbmd.session import Session
from bbmd.models import continuous, dichotomous
from bbmd.bmr import continuous as cbmr, \
                     dichotomous as dbmr

from utils.models import PickledFileField

from plotting import bkh


class Run(models.Model):

    DICHOTOMOUS_TYPES = ['D', 'E']

    DATA_TYPE_CONTINUOUS_SUMMARY = 'C'
    DATA_TYPE_CONTINUOUS_INDIVIDUAL = 'I'

    DATA_TYPE_CHOICES = (
        ("D", "Dichotomous (summary)"),
        ("E", "Dichotomous (individual)"),
        (DATA_TYPE_CONTINUOUS_SUMMARY, "Continuous (summary)"),
        (DATA_TYPE_CONTINUOUS_INDIVIDUAL, "Continuous (individual)"),
    )
    VARIANCE_TYPE_CHOICES = (
        ("NA",  "Not applicable"),
        ("SD",  "Standard deviation"),
        ("SE",  "Standard error"),
    )

    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        db_index=True)
    owner = models.ForeignKey(
        User)
    name = models.CharField(
        max_length=128)
    data_type = models.CharField(
        max_length=2,
        choices=DATA_TYPE_CHOICES,
        default="D")
    variance_type = models.CharField(
        max_length=2,
        choices=VARIANCE_TYPE_CHOICES,
        default="NA")
    raw_data = models.TextField(
        blank=True,
        verbose_name="Dataset inputs",
        help_text="Paste dose-response data here, or manually type, using "
                  "spaces between values. Headers are optional. To view "
                  "example formats, see example formats "
                  "<a href='/static/excel/dataTemplates.xlsx'>here</a>.")
    dose = ArrayField(
        models.FloatField(),
        null=True,
        size=100)
    n = ArrayField(
        models.PositiveSmallIntegerField(),
        null=True,
        size=100)
    incidence = ArrayField(
        models.PositiveSmallIntegerField(),
        null=True,
        size=100)
    response = ArrayField(
        models.FloatField(),
        null=True,
        size=100)
    variance = ArrayField(
        models.FloatField(),
        null=True,
        size=100)
    trend_z_test = models.FloatField(
        null=True)
    trend_p_value = models.FloatField(
        null=True)
    mcmc_iterations = models.PositiveIntegerField(
        verbose_name="MCMC iterations",
        help_text="Length of each Markov chain (10,000 - 50,000)",
        default=30000,
        validators=[
            validators.MinValueValidator(5000),
            validators.MaxValueValidator(50000)])
    mcmc_num_chains = models.PositiveSmallIntegerField(
        verbose_name="Number chains",
        help_text="Number of chains (1-3)",
        default=1,
        validators=[
            validators.MinValueValidator(1),
            validators.MaxValueValidator(4)])
    mcmc_warmup_percent = models.PositiveSmallIntegerField(
        verbose_name="MCMC warmup (%)",
        help_text="Specify % of samples used as warmup; the remaining samples "
                  "will be kept and used for analysis and statistical "
                  "inference.",
        default=50,
        validators=[
            validators.MinValueValidator(10),
            validators.MaxValueValidator(90)])
    seed = models.PositiveIntegerField(
        verbose_name="Random seed",
        help_text="Random integer (0-99,999)",
        validators=[
            validators.MinValueValidator(0),
            validators.MaxValueValidator(99999)])
    public = models.BooleanField(
        default=False)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        ordering = ['-last_updated']
        get_latest_by = 'created'

    def __unicode__(self):
        return self.name

    def to_slug(self):
        return slugify(self.__unicode__(), allow_unicode=True)

    def get_absolute_url(self):
        return reverse('bbmd:run_detail', args=(self.uuid, ))

    def get_update_url(self):
        return reverse('bbmd:run_update', args=(self.uuid, ))

    def get_delete_url(self):
        return reverse('bbmd:run_delete', args=(self.uuid, ))

    def get_execute_url(self):
        return reverse('bbmd:run_execute', args=(self.uuid, ))

    def get_plot_url(self):
        return reverse('bbmd:api:run-plot', args=(self.id, ))

    def get_docx_url(self):
        return reverse('bbmd:api:run-docx', args=(self.id, ))

    def get_summary_json_url(self):
        return reverse('bbmd:api:run-summary-json', args=(self.id, ))

    def get_summary_txt_url(self):
        return reverse('bbmd:api:run-summary-txt', args=(self.id, ))

    def get_parameters_url(self):
        return reverse('bbmd:api:run-xlsx-params', args=(self.id, ))

    def get_bmds_url(self):
        return reverse('bbmd:api:run-xlsx-bmds', args=(self.id, ))

    def user_can_view(self, user):
        if self.public:
            return True
        if user.is_authenticated() and user.is_staff:
            return True
        return self.is_owner(user)

    def is_owner(self, user):
        return not user.is_anonymous() and self.owner == user

    @classmethod
    def create_default(cls, request):
        name = datetime.now().strftime("New run %b %d %Y, %I:%M %p")
        return cls.objects.create(
            owner=request.user,
            name=name,
            seed=randint(0, 99999))

    @property
    def has_dataset(self):
        return not np.isnan(self.np_doses).any()

    def create_dr_session(self, dataset=True, models=False, bmrs=False):
        # create session
        session = Session(
            mcmc_iterations=self.mcmc_iterations,
            mcmc_num_chains=self.mcmc_num_chains,
            mcmc_warmup_fraction=self.mcmc_warmup_percent*0.01,
            seed=self.seed,
            name=self.name,
        )

        if dataset:
            session.set_trend_test(self.trend_z_test, self.trend_p_value)
            if self.data_type in self.DICHOTOMOUS_TYPES:
                session.add_dichotomous_data(
                    dose=self.np_doses,
                    n=self.np_ns,
                    incidence=self.np_incidences
                )
            elif self.data_type == self.DATA_TYPE_CONTINUOUS_SUMMARY:
                session.add_continuous_summary_data(
                    dose=self.np_doses,
                    n=self.np_ns,
                    response=self.np_responses,
                    stdev=self.np_stdevs,
                )
            else:
                session.add_continuous_individual_data(
                    dose=self.np_doses,
                    response=self.np_responses
                )

        if models:
            models = [
                model.to_bbmd()
                for model in self.models.all()
            ]
            session.add_models(*models)

        if bmrs:
            bmrs = []
            for bmd in self.bmds.all().prefetch_related('models'):
                bmrs.extend(bmd.load_bmd_models())
            session.add_bmrs(*bmrs)

            for bmr in session.bmrs:
                # set priors if run already executed
                if hasattr(bmr, 'model_average'):
                    bmr.session = session
                    bmr.validate_inputs()

        return session

    def execute(self):
        session = self.create_dr_session(dataset=True, models=True, bmrs=False)
        session.execute()
        for i, model in enumerate(self.models.all()):
            model.from_bbmd(session.models[i])

    @property
    def has_data(self):
        return self.dose is not None and len(self.dose) > 0

    @property
    def np_doses(self):
        if not hasattr(self, "_np_doses"):
            self._np_doses = np.array(self.dose, dtype=np.float64)
        return self._np_doses

    @property
    def np_ns(self):
        if not hasattr(self, "_np_n"):
            self._np_n = np.array(self.n, dtype=np.float64)
        return self._np_n

    @property
    def np_incidences(self):
        if not hasattr(self, "_np_incidence"):
            self._np_incidence = np.array(self.incidence, dtype=np.float64)
        return self._np_incidence

    @property
    def np_responses(self):
        if not hasattr(self, "_np_response"):
            self._np_responses = np.array(self.response, dtype=np.float64)
        return self._np_responses

    @property
    def np_stdevs(self):
        if not hasattr(self, '_np_stdevs'):
            if self.variance_type == 'SE':
                self._np_stdevs = np.array(self.variance, dtype=np.float64) *\
                    np.sqrt(self.np_ns)
            elif self.variance_type == 'SD':
                self._np_stdevs = np.array(self.variance, dtype=np.float64)
            else:
                raise ValueError("Unknown variance type")
        return self._np_stdevs

    def get_bmr_bounding_ranges(self):
        if self.has_data:
            session = self.create_dr_session(
                dataset=True, models=False, bmrs=False)
            return session.get_bmr_adversity_value_domains()
        else:
            return {
                "is_increasing": True,
                "bmr_domain": [0, 1],
                "quantile_domain": [0, 1],
                "cutoff_domain": [0, 1],
                "absolute_change_domain": [0, 1],
                "relative_change_domain": [0, 1],
            }

    @property
    def is_increasing(self):
        if not hasattr(self, '_is_increasing'):
            session = self.create_dr_session(
                dataset=True, models=False, bmrs=False)
            self._is_increasing = session.is_increasing()
        return self._is_increasing

    @property
    def is_dichotomous(self):
        return self.data_type in self.DICHOTOMOUS_TYPES

    def get_word_report(self):
        session = self.create_dr_session(dataset=True, models=True, bmrs=True)
        b = BytesIO()
        session.export_word_report(b)
        return b.getvalue()

    def get_report(self, format='txt'):
        session = self.create_dr_session(dataset=True, models=True, bmrs=True)
        b = BytesIO()
        session.export_report(b, format)
        return b.getvalue()

    def get_parameters_flatfile(self):
        session = self.create_dr_session(dataset=True, models=True, bmrs=True)
        b = BytesIO()
        session.export_parameters(b, format='xlsx')
        return b.getvalue()

    def get_bmds_flatfile(self):
        session = self.create_dr_session(dataset=True, models=True, bmrs=True)
        b = BytesIO()
        session.export_bmds(b, format='xlsx')
        return b.getvalue()

    def set_trend_test(self):
        if self.dose is None or len(self.dose) == 0:
            return

        session = self.create_dr_session(
            dataset=True, models=False, bmrs=False)
        z, pvalue = session.get_trend_test()

        if z is None or np.isnan(z):
            z = None

        if pvalue is None or np.isnan(pvalue):
            pvalue = None

        self.trend_z_test = z
        self.trend_p_value = pvalue

    def get_plotting_data(self):
        if self.dose is None:
            return None

        if self.data_type == "C":
            return {
                "dose": self.dose,
                "n": self.n,
                "response": self.response,
                "variance": self.variance,
                "variance_type": self.variance_type,
            }
        elif self.data_type == 'I':
            return {
                "dose": self.dose,
                "response": self.response,
            }
        elif self.data_type in self.DICHOTOMOUS_TYPES:
            return {
                "dose": self.dose,
                "incidence": self.incidence,
                "n": self.n,
                "ratio":  [i/float(n) for i, n in zip(self.incidence, self.n)],
            }

    def get_plot(self):
        data = self.get_plotting_data()
        Plot = bkh.DoseResponse if data is not None else bkh.NullPlot
        return Plot(data).as_json()


class ModelSettings(models.Model):

    MODEL_TYPE_CHOICES = (
        ("DGa", "Gamma"),
        ("DLg", "Logistic"),
        ("DLl", "LogLogistic"),
        ("DPr", "Probit"),
        ("DLp", "LogProbit"),
        ("DM1", "Quantal linear"),
        ("DM2", "Multistage (2nd order)"),
        ("DWe", "Weibull"),
        ("DHi", "Dichotomous Hill"),
        ("CE2", "Exponential 2"),
        ("CE3", "Exponential 3"),
        ("CE4", "Exponential 4"),
        ("CE5", "Exponential 5"),
        ("CHi", "Hill"),
        ("CPw", "Power"),
        ("CMm", "Michaelis Menten"),
        ("CLi", "Linear"),
    )

    MODEL_CROSSWALK = {
        "DGa": dichotomous.Gamma,
        "DLg": dichotomous.Logistic,
        "DLl": dichotomous.LogLogistic,
        "DPr": dichotomous.Probit,
        "DLp": dichotomous.LogProbit,
        "DM1": dichotomous.QuantalLinear,
        "DM2": dichotomous.Multistage2,
        "DWe": dichotomous.Weibull,
        "DHi": dichotomous.DichotomousHill,
        "CE2": continuous.Exponential2,
        "CE3": continuous.Exponential3,
        "CE4": continuous.Exponential4,
        "CE5": continuous.Exponential5,
        "CHi": continuous.Hill,
        "CPw": continuous.Power,
        "CMm": continuous.MichaelisMenten,
        "CLi": continuous.Linear,
    }

    POWER_BOUNDED_MODELS = [
        'DGa',
        'DLl',
        'DLp',
        'DWe',
        'DHi',
        'CE3',
        'CE5',
        'CHi',
        'CPw',
    ]

    DR_RESULT_FIELDS = (
        'predicted_pvalue',
        'parameter_correlation',
        'fit_summary',
        'fit_summary_dict',
        'model_weight_scaler',
        'plotting',
        'pystan_version',
    )

    DR_VECTOR_KEYS = (
        'parameters',
        'kernels',
        'model_weights',
        'model_weight_vector',
    )

    PLB_ZERO = 'zero'
    PLB_QT = 'qtr'
    PLB_POINT_FIVE = 'pointFive'
    PLB_TQT = 'threeQtr'
    PLB_ONE = 'one'
    PLB_CHOICES = (
        (PLB_ZERO, 0.),
        (PLB_QT, 0.25),
        (PLB_POINT_FIVE, 0.5),
        (PLB_TQT, 0.75),
        (PLB_ONE, 1.),
    )

    run = models.ForeignKey(
        Run,
        related_name="models")
    name = models.CharField(
        max_length=128)
    model_type = models.CharField(
        max_length=4,
        choices=MODEL_TYPE_CHOICES)
    pystan_version = models.CharField(
        blank=True,
        max_length=8)
    power_lower_bound = models.CharField(
        max_length=9,
        choices=PLB_CHOICES,
        default=PLB_ONE)
    predicted_pvalue = models.FloatField(
        null=True)
    parameter_names = ArrayField(
        models.CharField(max_length=5),
        null=True,
        size=10)
    vectors = PickledFileField(
        blank=True,
        null=True)
    plotting = PickledObjectField(
        blank=True)  # expected pickled np.ndarray if exists
    parameter_correlation = ArrayField(
        ArrayField(
            models.FloatField(),
            size=10),
        null=True,
        size=10)
    fit_summary = models.TextField(
        blank=True)
    fit_summary_dict = JSONField(
        default=dict)
    model_weight_scaler = models.FloatField(
        null=True)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        ordering = ('created', )
        get_latest_by = 'created'
        verbose_name_plural = 'Model settings'

    def __unicode__(self):
        return self.name

    def get_plot_url(self):
        return reverse('bbmd:api:models-plot',
                       args=(self.run.id, self.id, ))

    def get_parameter_plot_url(self):
        return reverse('bbmd:api:models-parameter-plot',
                       args=(self.run.id, self.id, ))

    def to_bbmd(self):
        # Django Model --> BBMD
        settings = self.get_model_settings()
        model = self.MODEL_CROSSWALK[self.model_type](**settings)
        if self.run_executed:

            # load data from db
            for fld in self.DR_RESULT_FIELDS:
                setattr(model, fld, getattr(self, fld))

            # load data from pickled file
            data = self.vectors.data
            for k in self.DR_VECTOR_KEYS:
                setattr(model, k, data[k])

        return model

    def from_bbmd(self, model):
        # BBMD --> Django model
        self.parameter_names = model.PARAMETERS

        # save data to database
        for fld in self.DR_RESULT_FIELDS:
            setattr(self, fld, getattr(model, fld))

        # write data to pickled file
        if self.id is None:
            self.save()

        data = {
            k: getattr(model, k)
            for k in self.DR_VECTOR_KEYS
        }
        self.vectors.create_pickle_file(self.id, data)

        # save model
        self.save()

    @property
    def uses_power_lower_bound(self):
        return self.model_type in self.POWER_BOUNDED_MODELS

    def get_model_settings(self):
        settings = {}
        if self.uses_power_lower_bound:
            settings['pwr_lbound'] = self.get_power_lower_bound_display()
        return settings

    @property
    def run_executed(self):
        # An empty self.plotting is a string == u''
        return len(self.plotting) > 0

    def get_plotting_data(self):
        d = self.run.get_plotting_data()
        d["lines"] = (self.plotting.T).tolist()
        return d

    def get_plot(self):
        if not self.run_executed:
            return {}
        data = self.get_plotting_data()
        plot = bkh.DoseResponseAndCurve(data)
        return plot.as_json()

    def get_parameter_data(self):
        if not self.run_executed:
            return None
        data = self.vectors.data
        return {
            "parameter_names": self.parameter_names,
            "parameters": data['parameters'],
            "kernels": data['kernels'],
        }

    def get_parameter_plot(self):
        data = self.get_parameter_data()
        if data is None:
            return None
        plot = bkh.ParameterSummary(data)
        return plot.as_json()


class BMDAnalysis(models.Model):

    SUBTYPE_CHOICES = (
        ('D', 'Dichotomous'),
        ('C', 'Central tendency'),
        ('H', 'Hybrid method (tails)'),
    )
    DUAL_RUN_SUBTYPES = ('D', 'H')
    ADVERSITY_TYPE_CT_CHOICES = (
        ('R', 'Relative'),
        ('A', 'Absolute'),
        ('C', 'Cutoff'),
    )
    ADVERSITY_TYPE_HYBRID_CHOICES = (
        ('P', 'Percentile'),
        ('A', 'Absolute cutoff'),
    )

    run = models.ForeignKey(
        Run,
        related_name="bmds")
    name = models.CharField(
        max_length=128)
    subtype = models.CharField(
        max_length=1,
        default='D',
        choices=SUBTYPE_CHOICES)
    bmr = models.FloatField(
        blank=True,
        null=True,
        validators=[
            validators.MinValueValidator(0.),
            validators.MaxValueValidator(1.)])
    adversity_ct_type = models.CharField(
        max_length=1,
        default='R',
        choices=ADVERSITY_TYPE_CT_CHOICES)
    adversity_hybrid_type = models.CharField(
        max_length=1,
        default='P',
        choices=ADVERSITY_TYPE_HYBRID_CHOICES)
    adversity_value = models.FloatField(
        blank=True,
        null=True)
    vectors = PickledFileField(
        blank=True,
        null=True)
    summary = PickledObjectField(
        blank=True)  # expected pickled dict if exists
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        get_latest_by = 'created'
        verbose_name_plural = 'BMD analyses'

    @property
    def run_executed(self):
        return len(self.summary) > 0

    @property
    def requires_dual_run(self):
        return self.subtype in self.DUAL_RUN_SUBTYPES

    def get_plot_url(self):
        return reverse('bbmd:api:bmds-plot', args=(self.run.id, self.id, ))

    def get_plots_data(self):
        return {
            "weighted": self.summary,
            "models": [
                model.get_plot_data()
                for model in self.models.all()
            ],
        }

    def get_plots(self):
        if not self.run_executed:
            return {}
        data = self.get_plots_data()
        plot = bkh.BenchmarkDosePlot(data)
        return plot.as_json()

    def get_stats_for_table(self):
        if not self.summary:
            return {}
        return {
            "name": "Model average",
            "prior_weight": "N/A",
            "weight": "N/A",
            "stats": self.summary.get('stats'),
            "added": self.summary.get('added_stats'),
            "extra": self.summary.get('extra_stats'),
        }

    def results_to_bbmd(self, bmrs):
        # order of models is specific; should Added then Extra if applicable
        if not self.summary:
            return

        model_posterior_weights = list(self.models.values_list('weight', flat=True))

        if self.requires_dual_run:
            # TODO - get model average posterior weights to the model averages, then
            # pass these model averages to the word/txt exporters to get in the
            # correct format
            bmrs[0].model_average = BMDAnalysisModel.results_to_bbmd(
                self, 'added_')
            bmrs[1].model_average = BMDAnalysisModel.results_to_bbmd(
                self, 'extra_')
            bmrs[0].model_posterior_weights = model_posterior_weights
            bmrs[1].model_posterior_weights = model_posterior_weights
            bmrs[0].results = [
                BMDAnalysisModel.results_to_bbmd(d, 'added_')
                for d in self.models.all()
            ]
            bmrs[1].results = [
                BMDAnalysisModel.results_to_bbmd(d, 'extra_')
                for d in self.models.all()
            ]

        else:
            bmrs[0].model_average = BMDAnalysisModel.results_to_bbmd(
                self, '')
            bmrs[0].model_posterior_weights = model_posterior_weights
            bmrs[0].results = [
                BMDAnalysisModel.results_to_bbmd(d, '')
                for d in self.models.all()
            ]

    def load_bmd_models(self):
        # order of models is specific; should Added then Extra if applicable
        bmrs = None
        if self.subtype == 'D':
            kwargs = {
                'name': self.name,
                'bmr': self.bmr,
                'priors': self.get_priors()
            }
            # append BMR type to name
            added = deepcopy(kwargs)
            added['name'] += '-Added'
            extra = deepcopy(kwargs)
            extra['name'] += '-Extra'
            bmrs = [
                dbmr.Added(**added),
                dbmr.Extra(**extra)
            ]

        elif self.subtype == 'H':
            kwargs = {
                'name': self.name,
                'adversity_value': self.adversity_value,
                'bmr': self.bmr,
                'priors': self.get_priors(),
            }
            # append BMR type to name
            added = deepcopy(kwargs)
            added['name'] += '-Added'
            extra = deepcopy(kwargs)
            extra['name'] += '-Extra'
            if self.adversity_hybrid_type == 'P':
                bmrs = [
                    cbmr.HybridControlPercentileAdded(**added),
                    cbmr.HybridControlPercentileExtra(**extra),
                ]
            elif self.adversity_hybrid_type == 'A':
                bmrs = [
                    cbmr.HybridAbsoluteCutoffAdded(**added),
                    cbmr.HybridAbsoluteCutoffExtra(**extra),
                ]

        elif self.subtype == 'C':
            kwargs = {
                'name': self.name,
                'adversity_value': self.adversity_value,
                'priors': self.get_priors(),
            }
            if self.adversity_ct_type == 'R':
                Cls = cbmr.CentralTendencyRelativeChange
            elif self.adversity_ct_type == 'A':
                Cls = cbmr.CentralTendencyAbsoluteChange
            elif self.adversity_ct_type == 'C':
                Cls = cbmr.CentralTendencyCutoff
            bmrs = [Cls(**kwargs), ]

        if bmrs is None:
            raise ValueError('Invalid BMR specification')

        self.results_to_bbmd(bmrs)
        return bmrs

    def get_priors(self):
        return self.models.all()\
            .values_list('prior_weight', flat=True)

    def calculate_bmds(self):
        session = self.run.create_dr_session(dataset=True, models=True, bmrs=False)
        session.add_bmrs(*self.load_bmd_models())
        session.calculate_bmrs()
        self.from_bbmd(session)

    def from_bbmd(self, session):
        if self.requires_dual_run:
            added = session.bmrs[0]
            extra = session.bmrs[1]
            for i, model in enumerate(self.models.all()):
                assert added.model_average['model_posterior_weights'][i] == \
                    extra.model_average['model_posterior_weights'][i]
                posterior = added.model_average['model_posterior_weights'][i]
                bmrs = [added.results[i], extra.results[i]]
                model.from_bbmd(bmrs, posterior)
            vectors, summary = BMDAnalysisModel.results_from_bbmd(
                [added.model_average, extra.model_average])
        else:
            bmr = session.bmrs[0]
            for i, model in enumerate(self.models.all()):
                posterior = bmr.model_average['model_posterior_weights'][i]
                bmrs = [bmr.results[i]]
                model.from_bbmd(bmrs, posterior)
            vectors, summary = BMDAnalysisModel.results_from_bbmd(
                [bmr.model_average])

        # make sure we have ID
        if self.id is None:
            self.save()
        self.vectors.create_pickle_file(self.id, vectors)
        self.summary = summary
        self.save()


class BMDAnalysisModel(models.Model):

    analysis = models.ForeignKey(
        BMDAnalysis,
        related_name="models")
    model = models.ForeignKey(
        ModelSettings,
        related_name="bmds")
    weight = models.FloatField(
        null=True,  # calculated
        validators=[
            validators.MinValueValidator(0.),
            validators.MaxValueValidator(1.)])
    prior_weight = models.FloatField(
        validators=[
            validators.MinValueValidator(0.),
            validators.MaxValueValidator(1.)])
    vectors = PickledFileField(
        blank=True,
        null=True)
    summary = PickledObjectField(
        blank=True)  # expected pickled dict if exists
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        ordering = ('model__created', )
        get_latest_by = 'created'
        verbose_name_plural = 'BMD analyses models'

    def get_plot_data(self):
        summary = self.summary
        summary['model_name'] = self.model.name
        return summary

    def get_stats_for_table(self):
        if not self.summary:
            return {}
        return {
            "name": self.model.name,
            "prior_weight": self.prior_weight,
            "weight": self.weight,
            "stats": self.summary.get('stats'),
            "extra": self.summary.get('extra_stats'),
            "added": self.summary.get('added_stats'),
        }

    @staticmethod
    def results_from_bbmd(bmrs):
        # Save the large arrays (bmd, extra_bmd, added_bmd) to a FileField;
        # keep the small stuff in a pickled field for fast access
        if len(bmrs) == 1:
            vectors = {
                'bmd': bmrs[0]['bmd'],
            }
            summary = {
                'n_total': bmrs[0]['n_total'],
                'n_non_nans': bmrs[0]['n_non_nans'],
                'kernel': bmrs[0]['kernel'],
                'stats': bmrs[0]['stats']
            }

        elif len(bmrs) == 2:
            vectors = {
                'added_bmd': bmrs[0]['bmd'],
                'extra_bmd': bmrs[1]['bmd'],
            }
            summary = {
                'added_n_total': bmrs[0]['n_total'],
                'added_n_non_nans': bmrs[0]['n_non_nans'],
                'added_kernel': bmrs[0]['kernel'],
                'added_stats': bmrs[0]['stats'],
                'extra_n_total': bmrs[1]['n_total'],
                'extra_n_non_nans': bmrs[1]['n_non_nans'],
                'extra_kernel': bmrs[1]['kernel'],
                'extra_stats': bmrs[1]['stats'],
            }

        else:
            raise ValueError('Invalid BMR specification')

        return vectors, summary

    @staticmethod
    def results_to_bbmd(dj, prefix):
        # Django model -> BBMD result
        data = dj.vectors.data
        summary = dj.summary
        return dict(
            bmd=data['%sbmd' % prefix],
            n_total=summary['%sn_total' % prefix],
            n_non_nans=summary['%sn_non_nans' % prefix],
            kernel=summary['%skernel' % prefix],
            stats=summary['%sstats' % prefix]
        )

    def from_bbmd(self, bmrs, model_posterior_weight):
        # BBMD -> Django model
        self.weight = model_posterior_weight
        vectors, summary = self.results_from_bbmd(bmrs)
        self.summary = summary

        # make sure we have ID
        if self.id is None:
            self.save()
        self.vectors.create_pickle_file(self.id, vectors)
        self.save()
