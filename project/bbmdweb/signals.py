from django.db.models.signals import pre_save
from django.dispatch import receiver

from . import models


@receiver(pre_save, sender=models.Run)
def setTrend(sender, instance, *args, **kwargs):
    instance.set_trend_test()
