from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')
        read_only_fields = ('id',)

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

from apps.users.models import Friendship

class FriendshipSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()
    
    class Meta:
        model = Friendship
        fields = ('id', 'friend', 'status', 'created_at')
        
    def get_friend(self, obj):
        # Determine which user is the friend from the perspective of the request user
        request_user = self.context['request'].user
        friend_user = obj.user2 if obj.user1 == request_user else obj.user1
        return UserSerializer(friend_user).data
