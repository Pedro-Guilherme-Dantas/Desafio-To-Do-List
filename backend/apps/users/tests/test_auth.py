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
    user = User.objects.create_user(username='loginuser', email='login@example.com', password='strongpassword123')
    
    url = reverse('token_obtain_pair')
    data = {
        'username': 'loginuser',
        'password': 'strongpassword123'
    }
    response = client.post(url, data, content_type='application/json')
    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data
