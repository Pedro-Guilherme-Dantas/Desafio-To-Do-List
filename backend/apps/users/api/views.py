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

from rest_framework import viewsets
from apps.users.services import FriendshipService
from .serializers import FriendshipSerializer

class FriendshipViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: FriendshipSerializer(many=True)})
    def list(self, request):
        friends = FriendshipService.get_friends(request.user)
        serializer = FriendshipSerializer(friends, many=True, context={'request': request})
        return Response(serializer.data)

    @extend_schema(request={'type': 'object', 'properties': {'to_user_id': {'type': 'integer'}}}, responses={201: FriendshipSerializer})
    def create(self, request):
        to_user_id = request.data.get('to_user_id')
        if not to_user_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("to_user_id is required.")
            
        friendship = FriendshipService.send_invite(request.user, to_user_id)
        return Response(FriendshipSerializer(friendship, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @extend_schema(responses={204: None})
    def destroy(self, request, pk=None):
        FriendshipService.remove_friendship(request.user, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

class FriendshipAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: FriendshipSerializer})
    def post(self, request, from_user_id):
        friendship = FriendshipService.accept_invite(request.user, from_user_id)
        return Response(FriendshipSerializer(friendship, context={'request': request}).data)
