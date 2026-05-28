from .tasks import dispatch_webhook

class NotificationService:
    @staticmethod
    def notify(event_type: str, payload: dict):
        """
        Wrapper to dispatch the Celery task.
        """
        dispatch_webhook.delay(event_type, payload)
