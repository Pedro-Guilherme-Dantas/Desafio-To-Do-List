from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

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
