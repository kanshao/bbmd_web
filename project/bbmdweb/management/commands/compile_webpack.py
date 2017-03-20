import subprocess
from django.conf import settings
from django.core.management.base import BaseCommand


HELP_TEXT = """Compile webpack bundles"""


class Command(BaseCommand):
    help = HELP_TEXT

    def handle(self, *args, **options):
        base = settings.PROJECT_PATH
        cmd = ["./node_modules/.bin/webpack", "--config", "webpack.prod-config.js"]
        subprocess.call(cmd, cwd=base)
