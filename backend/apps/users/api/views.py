from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
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

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    @extend_schema(request=RegisterSerializer, responses={200: UserSerializer})
    def put(self, request):
        serializer = RegisterSerializer(data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        user = UserService.update_user(request.user, **serializer.validated_data)
        return Response(UserSerializer(user).data)

    @extend_schema(request=RegisterSerializer, responses={200: UserSerializer})
    def patch(self, request):
        serializer = RegisterSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = UserService.update_user(request.user, **serializer.validated_data)
        return Response(UserSerializer(user).data)

    def delete(self, request):
        UserService.delete_user(request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
