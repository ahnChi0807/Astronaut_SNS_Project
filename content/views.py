from uuid import uuid4
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView

from Astronaut.settings import MEDIA_ROOT
from .models import Feed, Reply, Like, Bookmark
from user.models import User
import os


# Main 클래스는 여러 테이블에서 데이터를 가져와 피드리스트 변수에 저장하고 main.html과
# main.html에서 피드를 사용자에게 보여주는데 필요한 피드리스트와 user 정보를 브라우저에게 보내는 클래스입니다.
class Main(APIView):
    # noinspection PyMethodMayBeStatic
    def get(self, request):
        # 세션 정보에 저장된 이메일을 request 요청으로 가져와서 변수 email에 저장
        email = request.session.get('email', None)
        # 세션에 이메일 정보가 없는경우 -> 로그인을 하지 않고 메인페이지에 접속했다는 뜻 -> 로그인 페이지로 이동시킴
        if email is None:
            return render(request, "user/login.html")

        # 세션정보가 저장된 이메일을 필터링 조건으로 대입해서 유저테이블을 필터링을 진행 -> 결과를 user 변수에 저장
        user_session = User.objects.filter(email=email).first()
        # 세션에 이메일 정보가 있는데 그 이메일 주소가 우리 회원이 아닌경우 -> 로그인 페이지로 이동시킴
        if user_session is None:
            return render(request, "user/login.html")

        # 노션에 정리된 글 참고, 요약 main.html로 보낼 피드 리스트와 user 정보를 처리
        feed_object_list = Feed.objects.all().order_by('-id')
        feed_list = []

        for feed in feed_object_list:
            user = User.objects.filter(email=feed.email).first()
            reply_object_list = Reply.objects.filter(feed_id=feed.id)
            reply_list = []
            for reply in reply_object_list:
                user = User.objects.filter(email=reply.email).first()
                reply_list.append(dict(reply_content=reply.reply_content,
                                       nickname=user.nickname))
            like_count = Like.objects.filter(feed_id=feed.id, is_like=True).count()
            is_liked = Like.objects.filter(feed_id=feed.id, email=email, is_like=True).exists()
            is_marked = Bookmark.objects.filter(feed_id=feed.id, email=email, is_marked=True).exists()
            feed_list.append(dict(id=feed.id,
                                  image=feed.image,
                                  content=feed.content,
                                  like_count=like_count,
                                  profile_image=user.profile_image,
                                  nickname=user.nickname,
                                  reply_list=reply_list,
                                  is_liked=is_liked,
                                  is_marked=is_marked
                                  ))

        # 필터링을 거쳐서 나온 유저 정보가 담긴 user와 피드 리스트가 담긴 feed_list를 사전 형태로 클라이언트에게 보냄
        return render(request, "astronaut/main.html", context=dict(feeds=feed_list, user_session=user_session))


# 피드를 업로드 할 때 서버로 넘어오는 데이터를 받아서 각 변수에 저장 후 출력
class UploadFeed(APIView):
    # noinspection PyMethodMayBeStatic
    def post(self, request):
        # 서버로 올라온 폼 데이터에서 파일을 꺼냄
        file = request.FILES['file']
        # uuid 값 생성
        uuid_name = uuid4().hex
        # 파일을 어디에 저장할 것 인지 설정
        save_path = os.path.join(MEDIA_ROOT, uuid_name)
        # 아래 작업을 거치면 media 폴더에 파일이 저장됨
        with open(save_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        # 폼 데이터에서 파일을 제외한 나머지 일반 데이터를 꺼냄
        uuid_name = uuid_name
        content = request.data.get('content')
        email = request.session.get('email', None)

        # 전달 받은 데이터를 기반으로 Feed 테이블에 새로운 튜플 생성
        Feed.objects.create(image=uuid_name, content=content, email=email)

        # 성공적으로 전달 되었다는 응답을 보냄
        return Response(status=200)


# 사용자에게 프로필을 보여주기 위한 profile.html과 profile.html에 필요한 user 정보를 보내주는 클래스
class Profile(APIView):
    # noinspection PyMethodMayBeStatic
    def get(self, request):
        # 세션에 저장된 이메일을 request 요청으로 가져와서 변수 email에 저장
        email = request.session.get('email', None)

        # 세션에 이메일 정보가 없는경우 -> 로그인을 하지않고 메인페이지에 접속한 경우 -> 로그인 페이지로 이동시킴
        if email is None:
            return render(request, "user/login.html")

        # 세션정보가 저장된 이메일을 필터링 조건으로 대입해서 유저테이블을 필터링을 진행 -> 결과를 user 변수에 저장
        user = User.objects.filter(email=email).first()

        # 세션에 이메일 정보가 있는데 그 이메일 주소가 우리 회원이 아닌경우 -> 로그인 페이지로 이동시킴
        if user is None:
            return render(request, "user/login.html")

        # 프로필 화면에서 게시글 조회할 때 필요한 리스트를 구하는 과정 (노션참고)
        feed_list = Feed.objects.filter(email=email)
        like_list = list(Like.objects.filter(email=email, is_like=True).values_list('feed_id', flat=True))
        like_feed_list = Feed.objects.filter(id__in=like_list)
        bookmark_list = list(Bookmark.objects.filter(email=email, is_marked=True).values_list('feed_id', flat=True))
        bookmark_feed_list = Feed.objects.filter(id__in=bookmark_list)
        # 프로플 화면에서 게시글을 조회할 때 필요한 리스트들을 profile.html로 전달
        return render(request, 'content/profile.html', context=dict(feed_list=feed_list,
                                                                    like_feed_list=like_feed_list,
                                                                    bookmark_feed_list=bookmark_feed_list,
                                                                    user=user))


# 서버로 전달된 댓글 내용과 댓글을 입력한 사용자의 이메일 받아서 각 변수에 넣고 댓글 테이블에 저장
class UploadReply(APIView):
    # noinspection PyMethodMayBeStatic
    def post(self, request):
        # 서버로 전달된 Json 형식의 파일에서 데이터를 꺼내서 각 변수에 저장
        feed_id = request.data.get('feed_id', None)
        reply_content = request.data.get('reply_content', None)
        # 댓글은 여러 사람이 작성하므로 댓글을 게시한 사용자들이 누군지 구분이 필요하기 때문에 세션 정보에 저장된 이메일을 이용해야 합니다.
        email = request.session.get('email', None)

        # 서버로 전달된 데이터를 토대로 Reply 테이블에 새로운 튜플을 생성
        Reply.objects.create(feed_id=feed_id, reply_content=reply_content, email=email)

        # 성공적으로 전달이 되었다는 응답을 줌
        return Response(status=200)


# 특정 피드에 좋아요가 되면 좋아요 여부와 피드id를 받아서 변수에 넣고 간단한 조건문을 실행 후 좋아요 테이블에 저장
class ToggleLike(APIView):
    # noinspection PyMethodMayBeStatic
    def post(self, request):
        feed_id = request.data.get('feed_id', None)
        favorite_text = request.data.get('favorite_text', True)
        email = request.session.get('email', None)

        # 좋아요 여부는 텍스트로 전달 되었기 때문에 이걸 불린 값으러 맞게 설정
        if favorite_text == 'favorite_border':
            is_like = True
        else:
            is_like = False

        # 해당 피드에 현재 세션의 사용자가 좋아요를 누른 정보가 있다면 뽑아서 like에 저장
        like = Like.objects.filter(feed_id=feed_id, email=email).first()

        # 뽑은 레코드의 is_like 필드 값을 토글시키고 저장
        if like is not None:
            like.is_like = is_like
            like.save()
        # 현재 세션의 사용자가 해당 피드에 좋아요를 한 흔적이 없다면 이 사용자가 해당 피드에는 좋아요를 눌렀다는 정보를 테이블에 추가
        else:
            Like.objects.create(feed_id=feed_id, is_like=is_like, email=email)

        return Response(status=200)


# 특정 피드가 북마크 되면 북마크 여부와 피드id를 받아서 변수에 넣고 간단한 조건문을 실행 후 북마크 테이블에 저장
class ToggleBookmark(APIView):
    # noinspection PyMethodMayBeStatic
    def post(self, request):
        feed_id = request.data.get('feed_id', None)
        bookmark_text = request.data.get('bookmark_text', True)
        email = request.session.get('email', None)

        # 북마크 여부는 텍스트로 전달 되었기 때문에 이걸 불린 값으로 맞게 설정
        if bookmark_text == 'bookmark_border':
            is_marked = True
        else:
            is_marked = False

        # 현재 세션의 사용자가 해당 피드에 북마크를 누른 정보가 있다면 뽑아서 bookmark에 저장
        bookmark = Bookmark.objects.filter(feed_id=feed_id, email=email).first()

        # 뽑은 레코드의 is_marked 필드 값을 토글시키고 저장
        if bookmark is not None:
            bookmark.is_marked = is_marked
            bookmark.save()
        # 현재 세션의 사용자가 해당 피드에 북마크를 한 흔적이 없다면 이 사용자가 해당 피드에는 북마크를 눌렀다는 정보를 테이블에 추가
        else:
            Bookmark.objects.create(feed_id=feed_id, is_marked=is_marked, email=email)

        return Response(status=200)
