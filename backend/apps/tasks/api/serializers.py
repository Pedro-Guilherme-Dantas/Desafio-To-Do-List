from rest_framework import serializers
from apps.tasks.models import Category, Task, TaskParticipation, Comment
from apps.users.api.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    def validate(self, attrs):
        if 'due_date' in attrs and attrs['due_date']:
            # Example basic validation if needed
            pass
        return attrs

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('owner',)

class TaskParticipationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TaskParticipation
        fields = ('id', 'user', 'user_id', 'role', 'created_at')

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ('id', 'user', 'text', 'created_at')
