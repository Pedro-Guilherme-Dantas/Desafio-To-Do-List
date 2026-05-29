from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics, filters
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, extend_schema_view

from .serializers import RegisterSerializer, UserSerializer, FriendshipSerializer, UserUpdateSerializer
from apps.users.services import UserService, FriendshipService
from rest_framework import viewsets, serializers
from rest_framework.exceptions import ValidationError

@extend_schema_view(
    post=extend_schema(tags=['Authentication'], summary="User Registration")
)
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

@extend_schema_view(
    get=extend_schema(tags=['Users'], summary="Get Current User Profile"),
    put=extend_schema(tags=['Users'], summary="Update User Profile Completely"),
    patch=extend_schema(tags=['Users'], summary="Update User Profile Partially"),
    delete=extend_schema(tags=['Users'], summary="Delete Current User")
)
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    @extend_schema(request=UserUpdateSerializer, responses={200: UserSerializer})
    def put(self, request):
        serializer = UserUpdateSerializer(data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        user = UserService.update_user(request.user, **serializer.validated_data)
        return Response(UserSerializer(user).data)

    @extend_schema(request=UserUpdateSerializer, responses={200: UserSerializer})
    def patch(self, request):
        serializer = UserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = UserService.update_user(request.user, **serializer.validated_data)
        return Response(UserSerializer(user).data)

    def delete(self, request):
        UserService.delete_user(request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

User = get_user_model()

@extend_schema_view(
    get=extend_schema(tags=['Users'], summary="List and Search Users")
)
class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']




@extend_schema_view(
    list=extend_schema(tags=['Friendships'], summary="List User Friends"),
    create=extend_schema(tags=['Friendships'], summary="Send Friendship Invite"),
    destroy=extend_schema(tags=['Friendships'], summary="Remove Friendship or Reject Invite")
)
class FriendshipViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: FriendshipSerializer(many=True)})
    def list(self, request):
        friends = FriendshipService.get_friends(request.user)
        serializer = FriendshipSerializer(friends, many=True, context={'request': request})
        return Response(serializer.data)

    class FriendshipInviteSerializer(serializers.Serializer):
        to_user_id = serializers.IntegerField()

    @extend_schema(request=FriendshipInviteSerializer, responses={201: FriendshipSerializer})
    def create(self, request):
        to_user_id = request.data.get('to_user_id')
        if not to_user_id:
            raise ValidationError("to_user_id is required.")
            
        friendship = FriendshipService.send_invite(request.user, to_user_id)
        return Response(FriendshipSerializer(friendship, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @extend_schema(responses={204: None})
    def destroy(self, request, pk=None):
        FriendshipService.remove_friendship(request.user, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

@extend_schema_view(
    post=extend_schema(tags=['Friendships'], summary="Accept Friendship Invite")
)
class FriendshipAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: FriendshipSerializer})
    def post(self, request, from_user_id):
        friendship = FriendshipService.accept_invite(request.user, from_user_id)
        return Response(FriendshipSerializer(friendship, context={'request': request}).data)
