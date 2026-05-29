from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Friendship(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
    ]
    
    user1 = models.ForeignKey(User, related_name='friendships_initiated', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='friendships_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"{self.user1.username} -> {self.user2.username} ({self.status})"
