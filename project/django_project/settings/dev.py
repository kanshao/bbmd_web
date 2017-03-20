import sys
from django_project.settings.base import *  # noqa

INSTALLED_APPS += (
    'debug_toolbar',
    'django_extensions',
)

MIDDLEWARE_CLASSES += (
    'debug_toolbar.middleware.DebugToolbarMiddleware',
)

INTERNAL_IPS = ('127.0.0.1', )

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

LOGGING['loggers'][''] = {
    'handlers': ['console'],
    'level': 'INFO',
}

# Cache settings
CACHES['default'] = {
    'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    'LOCATION': 'bbmd',
    'TIMEOUT': None,
}

# execute celery-tasks locally instead of sending to queue
CELERY_ALWAYS_EAGER = True
CELERY_EAGER_PROPAGATES_EXCEPTIONS = True
CELERY_RESULT_BACKEND = 'db+sqlite:///celery.sqlite'

WEBPACK_LOADER['DEFAULT']['POLL_INTERVAL'] = 0.2

if 'test' in sys.argv:
    PASSWORD_HASHERS = (
        'django.contrib.auth.hashers.SHA1PasswordHasher',
        'django.contrib.auth.hashers.MD5PasswordHasher',
    )
