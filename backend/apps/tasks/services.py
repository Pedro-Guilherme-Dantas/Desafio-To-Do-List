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
        queryset = Task.objects.filter(owner=user)
        
        if filters:
            if 'category_id' in filters and filters['category_id']:
                queryset = queryset.filter(category_id=filters['category_id'])
            if 'priority' in filters and filters['priority']:
                queryset = queryset.filter(priority=filters['priority'])
            if 'is_completed' in filters and filters['is_completed'] is not None:
                # convert string to bool if needed
                is_completed = filters['is_completed'].lower() == 'true' if isinstance(filters['is_completed'], str) else bool(filters['is_completed'])
                queryset = queryset.filter(is_completed=is_completed)
                
        return queryset.order_by('-created_at')

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
        return task

    @staticmethod
    def update_task(user, task_id: int, **kwargs) -> Task:
        task = Task.objects.filter(id=task_id, owner=user).first()
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

        for field, value in kwargs.items():
            if hasattr(task, field):
                setattr(task, field, value)
                
        task.save()
        return task

    @staticmethod
    def delete_task(user, task_id: int):
        task = Task.objects.filter(id=task_id, owner=user).first()
        if not task:
            raise ValidationError("Task not found or you don't have permission to delete it.")
        task.delete()
        return True
