from django.apps import AppConfig


class BBMDConfig(AppConfig):
    name = "bbmdweb"
    verbose_name = "Bayesian BMD"

    def ready(self):
        from . import signals  # noqa
