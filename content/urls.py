from django.urls import path
from .views import UploadFeed, Main, UploadReply, ToggleLike, ToggleBookmark, RemoveFeed, \
    SearchFeed, RemoveReply, UpdateFeed, UpdateReply, FeedModal, Autocomplete, FollowerFeed, FeedUpdateIMG

# 사용자가 어떤 url를 요청하느냐에 따라 어떤 뷰를 실행할지 결정하는 리스트
urlpatterns = [
    path('upload', UploadFeed.as_view()),
    path('reply', UploadReply.as_view()),
    path('like', ToggleLike.as_view()),
    path('bookmark', ToggleBookmark.as_view()),
    path('main/', Main.as_view()),
    path('removefeed', RemoveFeed.as_view()),
    path('search/', SearchFeed.as_view()),
    path('removereply', RemoveReply.as_view()),
    path('updatefeed', UpdateFeed.as_view()),
    path('updatereply', UpdateReply.as_view()),
    path('feedmodal/', FeedModal.as_view()),
    path('autocomplete/', Autocomplete.as_view()),
    path('follower', FollowerFeed.as_view()),
    path('feedupdateimg', FeedUpdateIMG.as_view())
]
