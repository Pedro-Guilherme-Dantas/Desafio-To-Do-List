from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import CategorySerializer, TaskSerializer, TaskParticipationSerializer, CommentSerializer, TaskParticipationInputSerializer, CommentInputSerializer
from apps.tasks.services import CategoryService, TaskService, SharingService
from drf_spectacular.utils import extend_schema, OpenApiParameter, extend_schema_view
from rest_framework.pagination import PageNumberPagination

@extend_schema_view(
    list=extend_schema(tags=['Categories'], summary="List all categories"),
    create=extend_schema(tags=['Categories'], summary="Create a category"),
    update=extend_schema(tags=['Categories'], summary="Update a category completely"),
    partial_update=extend_schema(tags=['Categories'], summary="Update a category partially")
)
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

@extend_schema_view(
    list=extend_schema(tags=['Tasks'], summary="List tasks with filters"),
    create=extend_schema(tags=['Tasks'], summary="Create a new task"),
    update=extend_schema(tags=['Tasks'], summary="Update a task completely"),
    partial_update=extend_schema(tags=['Tasks'], summary="Update a task partially"),
    destroy=extend_schema(tags=['Tasks'], summary="Delete a task")
)
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

@extend_schema_view(
    create=extend_schema(tags=['Sharing'], summary="Share task with a user"),
    destroy=extend_schema(tags=['Sharing'], summary="Remove user from task")
)
class TaskParticipationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=TaskParticipationInputSerializer, responses={201: TaskParticipationSerializer})
    def create(self, request, task_pk=None):
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'VIEWER')
        if not user_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("user_id is required.")
            
        participation = SharingService.share_task(request.user, task_pk, user_id, role)
        return Response(TaskParticipationSerializer(participation).data, status=status.HTTP_201_CREATED)

    @extend_schema(responses={204: None})
    def destroy(self, request, pk=None, task_pk=None):
        SharingService.unshare_task(request.user, task_pk, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

@extend_schema_view(
    create=extend_schema(tags=['Comments'], summary="Add a comment to a task")
)
class CommentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=CommentInputSerializer, responses={201: CommentSerializer})
    def create(self, request, task_pk=None):
        text = request.data.get('text')
        if not text:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("text is required.")
            
        comment = SharingService.add_comment(request.user, task_pk, text)
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)
