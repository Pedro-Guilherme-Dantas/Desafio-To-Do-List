from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from .models import Friendship

User = get_user_model()

class UserService:
    @staticmethod
    def register_user(username: str, email: str, password: str) -> User:
        if User.objects.filter(username=username).exists():
            raise ValidationError("A user with that username already exists.")
        
        if User.objects.filter(email=email).exists():
            raise ValidationError("A user with that email already exists.")
            
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        from apps.notifications.services import NotificationService
        NotificationService.notify('USER_REGISTERED', {'user_id': user.id, 'username': user.username})
        
        return user

    @staticmethod
    def update_user(user: User, **kwargs) -> User:
        username = kwargs.get('username')
        email = kwargs.get('email')
        
        if username and username != user.username:
            if User.objects.filter(username=username).exists():
                raise ValidationError("A user with that username already exists.")
            user.username = username
            
        if email and email != user.email:
            if User.objects.filter(email=email).exists():
                raise ValidationError("A user with that email already exists.")
            user.email = email
            
        if 'password' in kwargs and kwargs['password']:
            user.set_password(kwargs['password'])
            
        user.save()
        return user

    @staticmethod
    def delete_user(user: User):
        user.delete()
        return True

class FriendshipService:
    @staticmethod
    def send_invite(from_user: User, to_user_id: int) -> Friendship:
        to_user = User.objects.filter(id=to_user_id).first()
        if not to_user:
            raise ValidationError("Target user not found.")
            
        if from_user == to_user:
            raise ValidationError("You cannot send a friend request to yourself.")
            
        # Check if inverse relation exists
        if Friendship.objects.filter(user1=to_user, user2=from_user).exists():
            raise ValidationError("A friendship or request already exists between these users.")
            
        # Check if direct relation exists
        if Friendship.objects.filter(user1=from_user, user2=to_user).exists():
            raise ValidationError("You have already sent a request to this user.")
            
        friendship = Friendship.objects.create(user1=from_user, user2=to_user, status='PENDING')
        
        from apps.notifications.services import NotificationService
        NotificationService.notify('FRIEND_INVITE_SENT', {'from_user_id': from_user.id, 'to_user_id': to_user.id})
        
        return friendship

    @staticmethod
    def accept_invite(user: User, from_user_id: int) -> Friendship:
        friendship = Friendship.objects.filter(user1_id=from_user_id, user2=user, status='PENDING').first()
        if not friendship:
            raise ValidationError("Friend request not found.")
            
        friendship.status = 'ACCEPTED'
        friendship.save()
        
        from apps.notifications.services import NotificationService
        NotificationService.notify('FRIEND_INVITE_ACCEPTED', {'user_id': user.id, 'friend_id': from_user_id})
        
        return friendship

    @staticmethod
    def get_friends(user: User):
        # Friends are where status is ACCEPTED and user is either user1 or user2
        from django.db.models import Q
        return Friendship.objects.filter(
            Q(user1=user) | Q(user2=user),
            status='ACCEPTED'
        ).select_related('user1', 'user2')

    @staticmethod
    def remove_friendship(user: User, friend_id: int):
        from django.db.models import Q
        friendship = Friendship.objects.filter(
            (Q(user1=user, user2_id=friend_id) | Q(user1_id=friend_id, user2=user))
        ).first()
        
        if not friendship:
            raise ValidationError("Friendship not found.")
            
        friendship.delete()
        
        # Unlink tasks (US4 requirement)
        from apps.tasks.models import TaskParticipation
        TaskParticipation.objects.filter(task__owner=user, user_id=friend_id).delete()
        TaskParticipation.objects.filter(task__owner_id=friend_id, user=user).delete()
        
        return True
