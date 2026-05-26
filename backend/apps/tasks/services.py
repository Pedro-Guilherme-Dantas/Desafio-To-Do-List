from django.core.cache import cache
from django.db import models
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

class TaskService:
    @staticmethod
    def get_user_tasks(user):
        return Task.objects.filter(owner=user).order_by('-created_at')

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
    def delete_task(user, task_id: int):
        task = Task.objects.filter(id=task_id, owner=user).first()
        if not task:
            raise ValidationError("Task not found or you don't have permission to delete it.")
        task.delete()
        return True
