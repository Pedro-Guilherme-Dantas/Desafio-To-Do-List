import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

pytestmark = pytest.mark.django_db

def test_user_registration(client):
    url = reverse('user-register')
    data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'strongpassword123'
    }
    response = client.post(url, data, content_type='application/json')
    assert response.status_code == 201
    assert 'id' in response.data
    assert response.data['username'] == 'testuser'
    
    # Ensure user is created in the db
    assert User.objects.filter(username='testuser').exists()

def test_user_login(client):
    # First create a user
    User.objects.create_user(username='loginuser', email='login@example.com', password='strongpassword123')
    
    url = reverse('token_obtain_pair')
    data = {
        'username': 'loginuser',
        'password': 'strongpassword123'
    }
    response = client.post(url, data, content_type='application/json')
    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data

def test_user_profile_crud(client):
    user = User.objects.create_user(username='cruduser', email='crud@example.com', password='pw')
    from rest_framework.test import APIClient
    auth_client = APIClient()
    auth_client.force_authenticate(user=user)

    url = reverse('user-profile')

    # GET
    response = auth_client.get(url)
    assert response.status_code == 200
    assert response.data['username'] == 'cruduser'

    # PATCH
    response = auth_client.patch(url, {'username': 'newcrud'}, format='json')
    assert response.status_code == 200
    assert response.data['username'] == 'newcrud'
    user.refresh_from_db()
    assert user.username == 'newcrud'

    # DELETE
    response = auth_client.delete(url)
    assert response.status_code == 204
    assert not User.objects.filter(username='newcrud').exists()
