from django.core.management.base import BaseCommand

from bbmd.compilation import compile_stan


HELP_TEXT = """Compile STAN models"""


class Command(BaseCommand):
    help = HELP_TEXT

    def handle(self, *args, **options):
        compile_stan()
