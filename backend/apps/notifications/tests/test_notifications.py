import pytest
from unittest.mock import patch
from apps.notifications.services import NotificationService

def test_notification_service_dispatches_task():
    with patch('apps.notifications.tasks.dispatch_webhook.delay') as mock_delay:
        NotificationService.notify('TEST_EVENT', {'data': 'test'})
        mock_delay.assert_called_once_with('TEST_EVENT', {'data': 'test'})
