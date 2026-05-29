import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import User
from apps.users.models import Friendship

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
def auth_client1(user1):
    client = APIClient()
    client.force_authenticate(user=user1)
    return client

@pytest.fixture
def auth_client2(user2):
    client = APIClient()
    client.force_authenticate(user=user2)
    return client

@pytest.mark.django_db
def test_send_friend_request(auth_client1, user2):
    url = reverse('friendship-list')
    data = {'to_user_id': user2.id}
    response = auth_client1.post(url, data, format='json')
    assert response.status_code == 201
    
    assert Friendship.objects.filter(user1=auth_client1.handler._force_user, user2=user2, status='PENDING').exists()

@pytest.mark.django_db
def test_accept_friend_request(auth_client1, auth_client2, user1, user2):
    # user1 sends to user2
    Friendship.objects.create(user1=user1, user2=user2, status='PENDING')
    
    url = reverse('friendship-accept', args=[user1.id])
    response = auth_client2.post(url)
    assert response.status_code == 200
    
    # Should now be ACCEPTED
    f = Friendship.objects.get(user1=user1, user2=user2)
    assert f.status == 'ACCEPTED'

@pytest.mark.django_db
def test_list_friends(auth_client1, user1, user2):
    Friendship.objects.create(user1=user1, user2=user2, status='ACCEPTED')
    
    url = reverse('friendship-list')
    response = auth_client1.get(url)
    assert response.status_code == 200
    assert len(response.data) == 1
    # Friend is user2
    assert response.data[0]['friend']['id'] == user2.id

@pytest.mark.django_db
def test_remove_friend(auth_client1, auth_client2, user1, user2):
    f = Friendship.objects.create(user1=user1, user2=user2, status='ACCEPTED')
    
    url = reverse('friendship-detail', args=[user2.id])
    response = auth_client1.delete(url)
    assert response.status_code == 204
    
    assert not Friendship.objects.filter(id=f.id).exists()
