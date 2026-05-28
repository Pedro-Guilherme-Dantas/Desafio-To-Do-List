import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import User, Friendship
from apps.tasks.models import Task
from apps.tasks.models import TaskParticipation, Comment

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user1():
    return User.objects.create_user(username='user1', email='u1@example.com', password='pw1')

@pytest.fixture
def user2():
    return User.objects.create_user(username='user2', email='u2@example.com', password='pw2')

@pytest.fixture
def user3():
    return User.objects.create_user(username='user3', email='u3@example.com', password='pw3')

@pytest.fixture
def auth_client1(user1):
    client = APIClient()
    client.force_authenticate(user=user1)
    return client

@pytest.fixture
def auth_client2(user2):
    client = APIClient()
    client.force_authenticate(user=user2)
    return client

@pytest.fixture
def auth_client3(user3):
    client = APIClient()
    client.force_authenticate(user=user3)
    return client

@pytest.fixture
def friendship(user1, user2):
    return Friendship.objects.create(user1=user1, user2=user2, status='ACCEPTED')

@pytest.fixture
def task(user1):
    return Task.objects.create(owner=user1, title='Test Task')

@pytest.mark.django_db
def test_share_task_with_friend(auth_client1, user2, task, friendship):
    url = reverse('taskparticipation-list', kwargs={'task_pk': task.id})
    data = {'user_id': user2.id, 'role': 'EDITOR'}
    response = auth_client1.post(url, data, format='json')
    assert response.status_code == 201
    assert TaskParticipation.objects.filter(task=task, user=user2, role='EDITOR').exists()

@pytest.mark.django_db
def test_share_task_with_non_friend(auth_client1, user3, task):
    url = reverse('taskparticipation-list', kwargs={'task_pk': task.id})
    data = {'user_id': user3.id, 'role': 'VIEWER'}
    response = auth_client1.post(url, data, format='json')
    assert response.status_code == 400
    assert not TaskParticipation.objects.filter(task=task, user=user3).exists()

@pytest.mark.django_db
def test_editor_can_edit_task(auth_client2, user2, task, friendship):
    TaskParticipation.objects.create(task=task, user=user2, role='EDITOR')
    
    url = reverse('task-detail', args=[task.id])
    data = {'title': 'Updated by Editor'}
    response = auth_client2.patch(url, data, format='json')
    assert response.status_code == 200
    task.refresh_from_db()
    assert task.title == 'Updated by Editor'

@pytest.mark.django_db
def test_viewer_cannot_edit_task(auth_client2, user2, task, friendship):
    TaskParticipation.objects.create(task=task, user=user2, role='VIEWER')
    
    url = reverse('task-detail', args=[task.id])
    data = {'title': 'Updated by Viewer'}
    response = auth_client2.patch(url, data, format='json')
    assert response.status_code == 400

@pytest.mark.django_db
def test_add_comment(auth_client2, user2, task, friendship):
    TaskParticipation.objects.create(task=task, user=user2, role='COMMENTER')
    
    url = reverse('comment-list', kwargs={'task_pk': task.id})
    data = {'text': 'This is a comment'}
    response = auth_client2.post(url, data, format='json')
    assert response.status_code == 201
    assert Comment.objects.filter(task=task, user=user2, text='This is a comment').exists()

@pytest.mark.django_db
def test_friendship_removal_unlinks_tasks(auth_client1, user1, user2, task, friendship):
    TaskParticipation.objects.create(task=task, user=user2, role='VIEWER')
    
    # Remove friendship
    url = reverse('friendship-detail', args=[user2.id])
    response = auth_client1.delete(url)
    assert response.status_code == 204
    
    # Ensure participation is removed
    assert not TaskParticipation.objects.filter(task=task, user=user2).exists()
