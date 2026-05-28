from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task
def dispatch_webhook(event_type: str, payload: dict):
    """
    Simulates dispatching an asynchronous webhook for critical events.
    """
    logger.info(f"Webhook dispatched: {event_type} - Payload: {payload}")
    return True
