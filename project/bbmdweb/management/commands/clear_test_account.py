from django.conf import settings
from django.core.management.base import BaseCommand

from bbmdweb.models import Run
from myuser.models import User


HELP_TEXT = """Clear test-user account"""


class Command(BaseCommand):
    help = HELP_TEXT

    def handle(self, *args, **options):
        u = User.objects.get(email=settings.TEST_ACCOUNT_USERNAME)
        Run.objects.filter(owner=u).delete()
