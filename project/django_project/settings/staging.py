from django_project.settings.base import *  # noqa

DEBUG = False
TEMPLATE_DEBUG = DEBUG

ALLOWED_HOSTS = os.environ['DJANGO_ALLOWED_HOSTS'].split(';')

SECRET_KEY = os.environ['DJANGO_SECRET_KEY']

DATABASES['default']['NAME'] = os.environ['DJANGO_DB_NAME']
DATABASES['default']['USER'] = os.environ['DJANGO_DB_USER']
DATABASES['default']['PASSWORD'] = os.environ['DJANGO_DB_PASSWORD']

EMAIL_HOST = os.environ['EMAIL_HOST']
EMAIL_HOST_PASSWORD = os.environ['EMAIL_HOST_PASSWORD']

# execute celery-tasks locally instead of sending to queue
CELERY_ALWAYS_EAGER = True
CELERY_EAGER_PROPAGATES_EXCEPTIONS = True

PUBLIC_ROOT = os.environ['DJANGO_PUBLIC_PATH']
STATIC_ROOT = os.path.join(PUBLIC_ROOT, 'static')
MEDIA_ROOT = os.path.join(PUBLIC_ROOT, 'media')

GA_TRACKING_ID = os.environ['GA_TRACKING_ID']
GA_SITE = os.environ['GA_SITE']

CRON_COMMAND_PREFIX = os.environ['CRON_COMMAND_PREFIX']
TEST_ACCOUNT_USERNAME = os.environ['TEST_ACCOUNT_USERNAME']
TEST_ACCOUNT_PASSWORD = os.environ['TEST_ACCOUNT_PASSWORD']
CRONJOBS = [
    (
        '0 6 * * *',
        '{} && python manage.py clear_test_account'.format(CRON_COMMAND_PREFIX)
    ),
]
