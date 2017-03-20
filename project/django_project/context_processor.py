from django.conf import settings


def ga(request):
    """
    return google-analytics settings
    """
    return {
        'GA_TRACKING_ID': settings.GA_TRACKING_ID,
        'GA_SITE': settings.GA_SITE,
    }
