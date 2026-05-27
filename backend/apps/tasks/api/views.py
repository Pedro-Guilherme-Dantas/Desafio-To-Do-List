from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import CategorySerializer, TaskSerializer
from apps.tasks.services import CategoryService, TaskService
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework.pagination import PageNumberPagination

class CategoryViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: CategorySerializer(many=True)})
    def list(self, request):
        categories = CategoryService.get_all_categories()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    @extend_schema(request=CategorySerializer, responses={201: CategorySerializer})
    def create(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        category = CategoryService.create_category(
            name=serializer.validated_data['name'],
            color=serializer.validated_data.get('color', '#FFFFFF')
        )
        
        return Response(CategorySerializer(category).data, status=status.HTTP_201_CREATED)

    @extend_schema(request=CategorySerializer, responses={200: CategorySerializer})
    def update(self, request, pk=None):
        return self.partial_update(request, pk)

    @extend_schema(request=CategorySerializer, responses={200: CategorySerializer})
    def partial_update(self, request, pk=None):
        serializer = CategorySerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        category = CategoryService.update_category(
            category_id=pk,
            name=serializer.validated_data.get('name'),
            color=serializer.validated_data.get('color')
        )
        
        return Response(CategorySerializer(category).data)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class TaskViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='category_id', type=int, required=False),
            OpenApiParameter(name='priority', type=str, required=False),
            OpenApiParameter(name='is_completed', type=bool, required=False),
        ]
    )
    def list(self, request):
        filters = {
            'category_id': request.query_params.get('category_id'),
            'priority': request.query_params.get('priority'),
            'is_completed': request.query_params.get('is_completed'),
        }
        
        tasks = TaskService.get_user_tasks(request.user, filters)
        
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(tasks, request)
        if page is not None:
            serializer = TaskSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    @extend_schema(request=TaskSerializer, responses={201: TaskSerializer})
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

    @extend_schema(request=TaskSerializer, responses={200: TaskSerializer})
    def update(self, request, pk=None):
        return self.partial_update(request, pk)

    @extend_schema(request=TaskSerializer, responses={200: TaskSerializer})
    def partial_update(self, request, pk=None):
        serializer = TaskSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        task = TaskService.update_task(
            user=request.user,
            task_id=pk,
            **serializer.validated_data
        )
        
        return Response(TaskSerializer(task).data)

    @extend_schema(responses={204: None})
    def destroy(self, request, pk=None):
        TaskService.delete_task(user=request.user, task_id=pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
