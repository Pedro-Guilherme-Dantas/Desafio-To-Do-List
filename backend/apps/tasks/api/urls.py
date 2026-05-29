from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TaskViewSet, TaskParticipationViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path('tasks/<int:task_pk>/participations/', TaskParticipationViewSet.as_view({'get': 'list', 'post': 'create'}), name='taskparticipation-list'),
    path('tasks/<int:task_pk>/participations/<int:pk>/', TaskParticipationViewSet.as_view({'delete': 'destroy'}), name='taskparticipation-detail'),
    path('tasks/<int:task_pk>/comments/', CommentViewSet.as_view({'get': 'list', 'post': 'create'}), name='comment-list'),
]
