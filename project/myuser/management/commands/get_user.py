from importlib import import_module

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


HELP_TEXT = """Given a session ID, attempt to get user object."""


class Command(BaseCommand):
    help = HELP_TEXT

    def add_arguments(self, parser):
        parser.add_argument('session_id', help='Cookie for session of interest')

    def handle(self, *args, **options):
        session_id = options.get('session_id')
        engine = import_module(settings.SESSION_ENGINE)
        SessionStore = engine.SessionStore
        session = SessionStore(session_id)
        user_id = session.get('_auth_user_id')
        if user_id:
            Model = get_user_model()
            user = Model.objects.get(pk=session.get('_auth_user_id'))
            self.stdout.write(
                "Session Found!\nFull name: {}\nEmail: {}\nID: {}".format(
                    user.get_full_name(), user.email, user.id))
        else:
            self.stdout.write('Session not found; used session-id "{}"'.format(session_id))
