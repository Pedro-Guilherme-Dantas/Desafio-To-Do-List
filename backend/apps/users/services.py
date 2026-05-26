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
