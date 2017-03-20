from celery import shared_task
from celery.utils.log import get_task_logger

from . import models


logger = get_task_logger(__name__)


@shared_task
def execute(object_id):
    object_ = models.Run.objects.get(id=object_id)
    object_.execute()
