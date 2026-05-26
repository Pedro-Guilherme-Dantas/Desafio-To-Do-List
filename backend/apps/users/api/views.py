from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema

from .serializers import RegisterSerializer, UserSerializer
from apps.users.services import UserService

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = UserService.register_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
