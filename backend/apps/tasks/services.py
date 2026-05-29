from django.core.cache import cache
from rest_framework.exceptions import ValidationError
from .models import Category, Task

class CategoryService:
    CACHE_KEY = 'global_categories'
    CACHE_TIMEOUT = 60 * 60 * 24 # 24 hours
    
    @classmethod
    def get_all_categories(cls):
        categories = cache.get(cls.CACHE_KEY)
        if categories is None:
            categories = list(Category.objects.all())
            cache.set(cls.CACHE_KEY, categories, cls.CACHE_TIMEOUT)
        return categories

    @classmethod
    def create_category(cls, name: str, color: str = "#FFFFFF") -> Category:
        if Category.objects.filter(name__iexact=name).exists():
            raise ValidationError("A category with this name already exists.")
        
        category = Category.objects.create(name=name, color=color)
        cache.delete(cls.CACHE_KEY) # Invalidate cache
        return category

    @classmethod
    def update_category(cls, category_id: int, name: str = None, color: str = None) -> Category:
        category = Category.objects.filter(id=category_id).first()
        if not category:
            raise ValidationError("Category not found.")
            
        if name and name.lower() != category.name.lower():
            if Category.objects.filter(name__iexact=name).exists():
                raise ValidationError("A category with this name already exists.")
            category.name = name
            
        if color:
            category.color = color
            
        category.save()
        cache.delete(cls.CACHE_KEY)
        return category

class TaskService:
    @staticmethod
    def get_user_tasks(user, filters=None):
        from django.db.models import Q
        queryset = Task.objects.filter(
            Q(owner=user) | Q(participations__user=user)
        ).distinct()
        
        if filters:
            if 'category_id' in filters and filters['category_id']:
                queryset = queryset.filter(category_id=filters['category_id'])
            if 'priority' in filters and filters['priority']:
                queryset = queryset.filter(priority=filters['priority'])
            if 'is_completed' in filters and filters['is_completed'] is not None:
                # convert string to bool if needed
                is_completed = filters['is_completed'].lower() == 'true' if isinstance(filters['is_completed'], str) else bool(filters['is_completed'])
                queryset = queryset.filter(is_completed=is_completed)
                
        return queryset.select_related('owner', 'category').prefetch_related('participations__user').order_by('-created_at')

    @staticmethod
    def create_task(user, title: str, description: str = '', priority: str = 'MEDIUM', due_date=None, category_id=None) -> Task:
        category = None
        if category_id:
            category = Category.objects.filter(id=category_id).first()
            if not category:
                raise ValidationError("Category not found.")

        task = Task.objects.create(
            owner=user,
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
            category=category
        )
        
        from apps.notifications.services import NotificationService
        NotificationService.notify('TASK_CREATED', {'task_id': task.id, 'owner_id': user.id})
        
        return task

    @staticmethod
    def update_task(user, task_id: int, **kwargs) -> Task:
        from django.db.models import Q
        task = Task.objects.filter(
            id=task_id
        ).filter(
            Q(owner=user) | Q(participations__user=user, participations__role='EDITOR')
        ).first()
        if not task:
            raise ValidationError("Task not found or you don't have permission to update it.")
            
        if 'category_id' in kwargs:
            cat_id = kwargs.pop('category_id')
            if cat_id is not None:
                category = Category.objects.filter(id=cat_id).first()
                if not category:
                    raise ValidationError("Category not found.")
                task.category = category
            else:
                task.category = None

        # Prevent modifying critical fields
        for forbidden in ['id', 'owner', 'owner_id', 'created_at', 'updated_at']:
            kwargs.pop(forbidden, None)

        for field, value in kwargs.items():
            if hasattr(task, field):
                setattr(task, field, value)
                
        task.save()
        
        from apps.notifications.services import NotificationService
        NotificationService.notify('TASK_UPDATED', {'task_id': task.id, 'user_id': user.id})
        
        return task

    @staticmethod
    def delete_task(user, task_id: int):
        task = Task.objects.filter(id=task_id, owner=user).first()
        if not task:
            raise ValidationError("Task not found or you don't have permission to delete it.")
        task.delete()
        
        from apps.notifications.services import NotificationService
        NotificationService.notify('TASK_DELETED', {'task_id': task_id, 'owner_id': user.id})
        
        return True

class SharingService:
    @staticmethod
    def share_task(owner, task_id: int, target_user_id: int, role: str):
        from apps.users.models import Friendship, User
        from django.db.models import Q
        
        task = Task.objects.filter(id=task_id, owner=owner).first()
        if not task:
            raise ValidationError("Task not found or you don't have permission to share it.")
            
        target_user = User.objects.filter(id=target_user_id).first()
        if not target_user:
            raise ValidationError("Target user not found.")
            
        is_friend = Friendship.objects.filter(
            status='ACCEPTED'
        ).filter(
            Q(user1=owner, user2=target_user) | Q(user1=target_user, user2=owner)
        ).exists()
        
        if not is_friend:
            raise ValidationError("You can only share tasks with your friends.")
            
        from .models import TaskParticipation
        if role not in dict(TaskParticipation.ROLE_CHOICES):
            raise ValidationError("Invalid role. Must be 'EDITOR' or 'VIEWER'.")
            
        participation, created = TaskParticipation.objects.update_or_create(
            task=task,
            user=target_user,
            defaults={'role': role}
        )
        
        from apps.notifications.services import NotificationService
        NotificationService.notify('TASK_SHARED', {'task_id': task.id, 'owner_id': owner.id, 'target_user_id': target_user.id, 'role': role})
        
        return participation

    @staticmethod
    def get_task_participations(user, task_id: int):
        from .models import TaskParticipation
        task = Task.objects.filter(id=task_id).first()
        if not task:
            raise ValidationError("Task not found.")
            
        if task.owner != user:
            if not TaskParticipation.objects.filter(task=task, user=user).exists():
                raise ValidationError("You do not have permission to view this task's participants.")
                
        return TaskParticipation.objects.filter(task=task).select_related('user')

    @staticmethod
    def unshare_task(user, task_id: int, target_user_id: int):
        from .models import TaskParticipation
        participation = TaskParticipation.objects.filter(task_id=task_id, user_id=target_user_id).select_related('task').first()
        if not participation:
            raise ValidationError("Participant not found in this task.")
            
        if participation.task.owner != user and user.id != target_user_id:
            raise ValidationError("You do not have permission to remove this participant.")
            
        participation.delete()
        
        from apps.notifications.services import NotificationService
        NotificationService.notify('TASK_UNSHARED', {'task_id': task_id, 'owner_id': participation.task.owner.id, 'target_user_id': target_user_id})

    @staticmethod
    def add_comment(user, task_id: int, text: str):
        from .models import Comment, TaskParticipation
        task = Task.objects.filter(id=task_id).first()
        if not task:
            raise ValidationError("Task not found.")
            
        if task.owner != user:
            participation = TaskParticipation.objects.filter(task=task, user=user).first()
            if not participation or participation.role == 'VIEWER':
                raise ValidationError("You do not have permission to comment on this task.")
                
        comment = Comment.objects.create(task=task, user=user, text=text)
        
        from apps.notifications.services import NotificationService
        NotificationService.notify('COMMENT_ADDED', {'task_id': task.id, 'user_id': user.id, 'comment_id': comment.id})
        
        return comment

    @staticmethod
    def get_task_comments(user, task_id: int):
        from .models import Comment, TaskParticipation
        task = Task.objects.filter(id=task_id).first()
        if not task:
            raise ValidationError("Task not found.")
            
        if task.owner != user:
            if not TaskParticipation.objects.filter(task=task, user=user).exists():
                raise ValidationError("You do not have permission to view comments for this task.")
                
        return Comment.objects.filter(task=task).select_related('user').order_by('created_at')
