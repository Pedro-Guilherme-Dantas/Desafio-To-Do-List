from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import CategorySerializer, TaskSerializer
from apps.tasks.services import CategoryService, TaskService

class CategoryViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        categories = CategoryService.get_all_categories()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        category = CategoryService.create_category(
            name=serializer.validated_data['name'],
            color=serializer.validated_data.get('color', '#FFFFFF')
        )
        
        return Response(CategorySerializer(category).data, status=status.HTTP_201_CREATED)

class TaskViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        tasks = TaskService.get_user_tasks(request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = TaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        task = TaskService.create_task(
            user=request.user,
            title=serializer.validated_data['title'],
            description=serializer.validated_data.get('description', ''),
            priority=serializer.validated_data.get('priority', 'MEDIUM'),
            due_date=serializer.validated_data.get('due_date'),
            category_id=serializer.validated_data.get('category_id')
        )
        
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        TaskService.delete_task(user=request.user, task_id=pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
