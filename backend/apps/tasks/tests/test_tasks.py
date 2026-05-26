import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.tasks.models import Category, Task

User = get_user_model()

pytestmark = pytest.mark.django_db

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def auth_client(api_client):
    user = User.objects.create_user(username='taskuser', password='password123')
    api_client.force_authenticate(user=user)
    api_client.user = user
    return api_client

def test_create_category(auth_client):
    url = reverse('category-list')
    data = {'name': 'Work', 'color': '#FF0000'}
    response = auth_client.post(url, data, format='json')
    assert response.status_code == 201
    assert Category.objects.count() == 1

def test_category_case_insensitive_unique(auth_client):
    Category.objects.create(name='Personal')
    url = reverse('category-list')
    data = {'name': 'personal', 'color': '#00FF00'}
    response = auth_client.post(url, data, format='json')
    assert response.status_code == 400

def test_create_task(auth_client):
    category = Category.objects.create(name='Home')
    url = reverse('task-list')
    data = {
        'title': 'Buy groceries',
        'category_id': category.id,
        'priority': 'HIGH'
    }
    response = auth_client.post(url, data, format='json')
    assert response.status_code == 201
    assert Task.objects.count() == 1
    assert Task.objects.first().owner == auth_client.user

def test_list_tasks(auth_client):
    Task.objects.create(title='Task 1', owner=auth_client.user)
    Task.objects.create(title='Task 2', owner=auth_client.user)
    
    other_user = User.objects.create_user(username='other', password='pw')
    Task.objects.create(title='Other Task', owner=other_user)
    
    url = reverse('task-list')
    response = auth_client.get(url)
    assert response.status_code == 200
    # Should only list tasks owned by the authenticated user (MVP sharing not active yet in this endpoint)
    assert len(response.data) == 2

def test_update_category(auth_client):
    category = Category.objects.create(name='OldName')
    url = reverse('category-detail', args=[category.id])
    data = {'name': 'NewName'}
    response = auth_client.patch(url, data, format='json')
    assert response.status_code == 200
    category.refresh_from_db()
    assert category.name == 'NewName'

def test_update_task(auth_client):
    task = Task.objects.create(title='Old Title', owner=auth_client.user)
    url = reverse('task-detail', args=[task.id])
    data = {'title': 'New Title', 'priority': 'HIGH'}
    response = auth_client.patch(url, data, format='json')
    assert response.status_code == 200
    task.refresh_from_db()
    assert task.title == 'New Title'
    assert task.priority == 'HIGH'
