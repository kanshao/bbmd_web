"""
Example run command (from django project-path):
celery worker --app=django_project --loglevel=INFO --autoreload
celery beat --app=django_project --loglevel=INFO
"""
from __future__ import absolute_import

from celery import Celery
from celery.utils.log import get_task_logger
from celery.task.schedules import crontab
from celery.decorators import periodic_task

from django.conf import settings


# Using a string here means the worker will not have to
# pickle the object when using Windows.
app = Celery('bbmdweb')
app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

# example celery tasks below
logger = get_task_logger(__name__)


@periodic_task(run_every=(crontab(minute='*/1')), name="debug_periodic_task", ignore_result=True)
def debug_periodic_task():
    logger.info('Running periodic task..')
