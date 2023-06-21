import os
from datetime import datetime
from uuid import uuid4
from django.db.models import Q
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from Astronaut.settings import MEDIA_ROOT
from content.models import Feed, Reply, Hashtag, Follow, Like, Bookmark, Image, ShareCategory, Chat, Alert
from .models import User
from django.contrib.auth.hashers import make_password


# 회원가입 클래스
class Join(APIView):
    # noinspection PyMethodMayBeStatic
    def get(self, request):
        return render(request, "user/join.html")

    # noinspection PyMethodMayBeStatic
    def post(self, request):
        # 서버로 전달된 데이터를 받음 (회원가입시 사용자가 입력한 정보)
        email = request.data.get('email', None)
        nickname = request.data.get('nickname', None)
        name = request.data.get('name', None)
        password = request.data.get('password', None)

        # 사용자가 입력한 정보가 User 테이블에 존재하는지 확인
        check_user_email = User.objects.filter(email=email).exists()
        check_user_nickname = User.objects.filter(nickname=nickname).exists()

        # 이미 존재하는 경우 출력할 메시지 전달.
        if check_user_email or check_user_nickname:
            if check_user_email:
                return Response(status=200, data=dict(message="이미 가입된 이메일입니다."))
            if check_user_nickname:
                return Response(status=200, data=dict(message="이미 존재하는 닉네임입니다."))
        # 존재하지 않는 경우 유저 테이블에 새로운 객체를 생성
        else:
            # 전달 받은 데이터를 토대로 유저 테이블에 새로운 객체를 생성
            User.objects.create(email=email,
                                nickname=nickname,
                                name=name,
                                password=make_password(password),
                                profile_image="default_profile.png")

            # 성공적으로 전달되었다는 응답을 줌
            return Response(status=200)


# 로그인 클래스
class Login(APIView):
    # noinspection PyMethodMayBeStatic
    def get(self, request):
        return render(request, "user/login.html")

    # noinspection PyMethodMayBeStatic
    def post(self, request):
        # 서버로 전달된 데이터를 받음 (로그인시 사용자가 입력한 정보)
        email = request.data.get('email', None)
        password = request.data.get('password', None)

        # 사용자가 입력한 정보가 User 테이블에 존재하는지 확인
        user = User.objects.filter(email=email).first()

        # 이메일이 일치하지 않을 경우
        if user is None:
            return Response(status=200, data=dict(message="회원정보가 잘못되었습니다."))

        # 이메일은 올바르지만 비밀번호가 일치한지 확인
        if user.check_password(password):
            # 비밀번호가 일치하면 로그인 성공으로 세션 정보에 이메일이란 이름으로 이메일 값을 저장해놓는다.
            request.session['email'] = email
            # 해당 유저가 마지막으로 로그인한 시점을 업데이트 한다
            user.last_login = datetime.now()
            user.save()
            return Response(status=200)
        # 비밀번호가 일치하지 않은 경우 알림
        else:
            return Response(status=200, data=dict(message="회원정보가 잘못되었습니다."))


# 로그아웃 클래스
class LogOut(APIView):
    # noinspection PyMethodMayBeStatic
    def get(self, request):
        # 세션을 비우고 로그인 페이지로 이동시킴
        request.session.flush()
        return render(request, "user/login.html")


# 프로필 사진 변경 클래스
class UploadProfile(APIView):
    # noinspection PyMethodMayBeStatic
    def post(self, request):
        # 서버로 전달된 이메일과 폼 데이터객체에서 파일을 꺼냄
        file = request.FILES['file']
        email = request.data.get('email')

        # 전달된 이미지 이름을 uuid로 설정
        uuid_name = uuid4().hex
        # 이미지가 저장될 경로를 설정 ( 미디어 경로 + 변경된 이미지 이름 )
        save_path = os.path.join(MEDIA_ROOT, uuid_name)
        # 이미지를 실제 media 폴더에 저장하는 과정
        with open(save_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        # 변수에 변경할 이미지 이름을 저장
        profile_image = uuid_name

        # 프로필 이미지를 변경할 유저객체를 뽑음
        user = User.objects.filter(email=email).first()
        # 해당 유저의 프로필 사진을 변경
        user.profile_image = profile_image
        # 변경 사항을 저장함
        user.save()

        return Response(status=200)


# 프로필 리셋 클래스
class ResetProfile(APIView):
    # noinspection PyMethodMayBeStatic
    def post(self, request):
        # 서버로 부터 전달된 프로필을 리셋할 유저의 이메일
        email = request.data.get('email')
        # 프로필을 리셋할 유저 객체
        user = User.objects.filter(email=email).first()

        # 해당 유저의 프로필 사진을 기본값으로 변경
        user.profile_image = "default_profile.png"
        # 변경 사항을 저장
        user.save()
        return Response(status=200)


# 유저 탈퇴 클래스
class RemoveProfile(APIView):
    def post(self, request):
        # 서버로 전달된 탈퇴할 유저의 이메일을 받음
        email = request.data.get('email')
        # 탈퇴할 유저의 객체를 구함
        user = User.objects.filter(email=email).first()
        # 해당 유저가 작성한 댓글 객체를 가져옴
        reply = Reply.objects.filter(email=email)
        # 댓글 객체 삭제
        reply.delete()
        # 해당 유저가 작성한 피드 객체를 가져옴
        feeds = Feed.objects.filter(email=email)
        for feeds in feeds:
            # 해당 유저가 작성한 피드에 달린 해시태그와 좋아요 북마크를 삭제
            hashtags = Hashtag.objects.filter(feed_id=feeds.id)
            hashtags.delete()
            likes = Like.objects.filter(feed_id=feeds.id)
            likes.delete()
            bookmark = Bookmark.objects.filter(feed_id=feeds.id)
            bookmark.delete()
            # 이미지 삭제 추가
            images = Image.objects.filter(feed_id=feeds.id)
            images.delete()

        # 해당 유저가 다른 피드에 좋아요, 북마크한 정보를 삭제
        likes = Like.objects.filter(email=email)
        likes.delete()
        bookmark = Bookmark.objects.filter(email=email)
        bookmark.delete()

        # 해당유저가 팔로우한 정보와 해당 유저를 팔로잉한 정보를 삭제
        follower = Follow.objects.filter(follower=email)
        follower.delete()
        following = Follow.objects.filter(following=email)
        following.delete()

        #해당유저가 가지고 있는 공유 카테고리 권한 삭제
        share_category = ShareCategory.objects.filter(email=email)
        share_category.delete()

        # 해당 유저의 채팅 목록을 삭제
        chat_send = Chat.objects.filter(send_user=email)
        chat_receive = Chat.objects.filter(receive_user=email)
        chat_send.delete()
        chat_receive.delete()

        # 해당 유저의 알림 목록 삭제
        alert_send = Alert.objects.filter(send_user=email)
        alert_receive = Alert.objects.filter(receive_user=email)
        alert_send.delete()
        alert_receive.delete()

        # 삭제할 피드 객체를 다시 불러옴 ( 반복문으로 인해서 인덱스 값을 잃어버림)
        feeds = Feed.objects.filter(email=email)
        # 피드 객체 삭제
        feeds.delete()
        # 유저 객체 삭제
        user.delete()
        # 세션 정보 비움
        request.session.flush()
        # 로그아웃 페이지로 이동
        return render(request, "user/join.html")


# 닉네임 수정 클래스
class UpdateNickname(APIView):
    def post(self, request):
        # 서버로 전달된 닉네임을 수정할 유저의 이메일과 수정하고 싶은 닉네임
        user_email = request.data.get('email')
        user_nickname = request.data.get('nickname')
        # 수정하고 싶은 닉네임이 중복인지 확인
        check_nickname = User.objects.filter(Q(email=user_email) & Q(nickname=user_nickname)).exists()
        # 이미 있는 경우 알림
        if check_nickname:
            return Response(status=200, data=dict(message="존재하는 닉네임입니다."))
        # 없는 경우 유저의 닉네임을 요청된 닉네임으로 수정
        else:
            user = User.objects.filter(email=user_email).first()
            user.nickname = user_nickname
            user.save()
            return Response(status=200)


# 비밀번호 수정 클래스
class UpdatePassword(APIView):
    def post(self, request):
        # 서버로 전달된 비밀번호를 수정할 유저의 이메일과 수정할 비밀번호
        user_email = request.data.get('email')
        user_password = request.data.get('password')

        # 수정할 유저의 객체를 뽑음
        user = User.objects.filter(email=user_email).first()
        # 수정할 비밀번호가 만약 이전 비밀번호와 동일하면 알림
        if user.check_password(user_password):
            return Response(status=200, data=dict(message="동일한 비밀번호입니다"))
        # 그렇지 않다면 암호화를 한 뒤 저장
        else:
            user.password = make_password(user_password)
            user.save()
            # 비밀번호가 수정 되었으니 세션을 비워주고 다시 로그인을 하게 함
            request.session.flush()
            return Response(status=200)


# 설정 클래스
class Settings(APIView):
    def get(self, request):
        # 세션정보에서 이메일을 가져옴
        email = request.session.get('email', None)
        # 세션 유저의 객체를 가져옴
        user_session = User.objects.filter(email=email).first()
        # 설정 페이지와 세션 유저의 객체를 전달
        return render(request, "content/settings.html", dict(user_session=user_session))


# 이메일 변경 클래스
class UpdateEmail(APIView):
    def post(self, request):
        # 서버로 전달된 수정할 이메일
        email = request.data.get('email')
        # 수정할 이메일이 이미 유저 테이블에 존재하는지 확인
        check_email = User.objects.filter(email=email).exists()
        # 이미 존재한다면 알림
        if check_email:
            return Response(status=200, data=dict(message="존재하는 이메일입니다."))
        # 그렇지 않다면 서버로 전달된 유저가 사용중인 이메일을 받음
        else:
            # 현재 사용중인 이메일
            user_email = request.data.get('user_email')
            # 이메일을 변경할 유저의 객체를 구함
            user = User.objects.filter(email=user_email).first()
            # 해당 유저가 작성한 댓글 객체를 구함
            reply = Reply.objects.filter(email=user_email)
            # 해당 유저가 작성한 피드 객체를 구함
            feed = Feed.objects.filter(email=user_email)
            # 해당 유저가 좋아요, 북마크, 팔로워, 팔로잉 등등 한 객체를 구함
            like = Like.objects.filter(email=user_email)
            bookmark = Bookmark.objects.filter(email=user_email)
            follower = Follow.objects.filter(follower=user_email)
            following = Follow.objects.filter(following=user_email)
            alert_send = Alert.objects.filter(send_user=user_email)
            alert_receive = Alert.objects.filter(receive_user=user_email)
            share_category = ShareCategory.objects.filter(email=user_email)
            chat_send = Chat.objects.filter(send_user=user_email)
            chat_receive = Chat.objects.filter(receive_user=user_email)
            # 각 객체의 이메일을 수정할 이메일로 변경
            user.email = email
            request.session['email'] = email
            reply.update(email=email)
            feed.update(email=email)
            like.update(email=email)
            bookmark.update(email=email)
            follower.update(follower=email)
            following.update(following=email)
            alert_send.update(send_user=email)
            alert_receive.update(receive_user=email)
            share_category.update(email=email)
            chat_receive.update(receive_user=email)
            chat_send.update(send_user=email)
            user.save()
            return Response(status=200)


# 프로필 클래스
class Profile(APIView):
    # noinspection PyMethodMayBeStatic
    def get(self, request):
        # 세션에 저장된 이메일을 request 요청으로 가져와서 변수 email에 저장
        email = request.session.get('email', None)

        # 세션에 이메일 정보가 없는경우 -> 로그인을 하지않고 메인페이지에 접속한 경우 -> 로그인 페이지로 이동시킴
        if email is None:
            return render(request, "user/login.html")

        # 현재 세션 정보의 이메일로 현재 세션 유저의 객체를 뽑아냄 , user
        user = User.objects.filter(email=email).first()

        # 세션에 이메일 정보가 있는데 그 이메일 주소가 우리 회원이 아닌경우 -> 로그인 페이지로 이동시킴
        if user is None:
            return render(request, "user/login.html")

        # 사용자가 작성한 피드 수 TODO
        user_feed_count = Feed.objects.filter(email=email).count()
        # 사용자가 작성한 피드리스트
        feed_list = Feed.objects.filter(email=email).order_by('-id')
        # 사용자가 좋아요한 피드들의 id 리스트
        like_list = list(Like.objects.filter(email=email).values_list('feed_id', flat=True))
        # 사용자가 좋아요한 피드 리스트
        like_feed_list = Feed.objects.filter(id__in=like_list).order_by('-id')
        # 사용자가 북마크한 피드들의 id 리스트
        bookmark_list = list(Bookmark.objects.filter(email=email).values_list('feed_id', flat=True))
        # 사용자가 북마크한 피드 리스트
        bookmark_feed_list = Feed.objects.filter(id__in=bookmark_list).order_by('-id')
        # 팔로워 팔로잉 수 계산
        follower_count = Follow.objects.filter(follower=email).count()
        following_count = Follow.objects.filter(following=email).count()

        # 사용자가 작성한 각 게시물들의 좋아요와 댓글 수를 조회할 때 필요한 리스트를 구하는 과정
        feed_count_list = []
        for feed in feed_list:
            image = Image.objects.filter(feed_id=feed.id).first()
            # 좋아요 수
            like_count = Like.objects.filter(feed_id=feed.id).count()
            # 댓글 수
            reply_count = Reply.objects.filter(feed_id=feed.id).count()
            feed_count_list.append(dict(id=feed.id,
                                        like_count=like_count,
                                        reply_count=reply_count,
                                        image=image))

        # 사용자가 좋아요한 각 게시물들의 좋아요와 댓글 수를 조회할 때 필요한 리스트를 구하는 과정
        like_count_list = []
        for feed in like_feed_list:
            # 좋아요 수
            like_count = Like.objects.filter(feed_id=feed.id).count()
            # 댓글 수
            reply_count = Reply.objects.filter(feed_id=feed.id).count()
            like_count_list.append(dict(id=feed.id,
                                        like_count=like_count,
                                        reply_count=reply_count))
        # 사용자가 북마크한 각 게시물들의 좋아요와 댓글 수를 조회할 때 필요한 리스트를 구하는 과정
        bookmark_count_list = []
        for feed in bookmark_feed_list:
            # 좋아요 수
            like_count = Like.objects.filter(feed_id=feed.id).count()
            # 댓글 수
            reply_count = Reply.objects.filter(feed_id=feed.id).count()
            bookmark_count_list.append(dict(id=feed.id,
                                            like_count=like_count,
                                            reply_count=reply_count))
        # 알림 유무
        alert_exists = Alert.objects.filter(receive_user=email).exists()
        # 세션 유저에게 온 채팅 유무
        is_delivered_chat = Chat.objects.filter(receive_user=email, is_read=True).exists()

        # 정유진: 공유카테고리 피드들의 id 리스트
        shared_category_list = list(ShareCategory.objects.filter(email=email).values_list('feed_id', flat=True))
        # 정유진: 공유카테고리 피드 리스트
        shared_category_feed_list = Feed.objects.filter(id__in=shared_category_list).order_by('-id')
        # 정유진: 공유 중인 각 게시물들의 좋아요와 댓글 수를 조회할 때 필요한 리스트를 구하는 과정
        shared_category_count_list = []
        for feed in shared_category_feed_list:
            # 좋아요 수
            like_count = Like.objects.filter(feed_id=feed.id).count()
            # 댓글 수
            reply_count = Reply.objects.filter(feed_id=feed.id).count()
            shared_category_count_list.append(dict(id=feed.id,
                                                   like_count=like_count,
                                                   reply_count=reply_count))

        # 정유진: 피드 업로드 및 수정 시 필요한 맞팔되어 있는 유저 리스트
        follower_user_email_list = list(Follow.objects.filter(follower=email).values_list('following', flat=True))
        following_user_email_list = list(Follow.objects.filter(follower__in=follower_user_email_list, following=email).values_list('follower', flat=True))

        shared_category_nickname_list = User.objects.filter(email__in=following_user_email_list)
        # 프로필 화면을 요청한 사용자에게 프로필화면과 해당 데이터를 전달
        return render(request, 'content/profile.html', context=dict(feed_list=feed_list,
                                                                    like_feed_list=like_feed_list,
                                                                    bookmark_feed_list=bookmark_feed_list,
                                                                    shared_category_feed_list=shared_category_feed_list,
                                                                    user_session=user,
                                                                    user=user,
                                                                    feed_count_list=feed_count_list,
                                                                    like_count_list=like_count_list,
                                                                    bookmark_count_list=bookmark_count_list,
                                                                    shared_category_count_list=shared_category_count_list,
                                                                    user_feed_count=user_feed_count,
                                                                    follower_count=follower_count,
                                                                    following_count=following_count,
                                                                    shared_category_nickname_list=shared_category_nickname_list,
                                                                    alert_exists=alert_exists,
                                                                    is_delivered_chat=is_delivered_chat))


# 유저 프로필로 이동 클래스
class ReplyProfile(APIView):
    def get(self, request):
        # 서버로 전달된 사용자의 닉네임을 받음
        nickname = request.GET.get('user_nickname')

        # 현재세션 정보를 받아옴. (네비바의 본인 프로필 정보를 위함)
        email_session = request.session.get('email', None)

        # 세션에 이메일 정보가 없는경우 -> 로그인을 하지 않고 메인페이지에 접속했다는 뜻 -> 로그인 페이지로 이동시킴
        if email_session is None:
            return render(request, "user/login.html")

        # 세션 정보를 토대로 User 테이블에서 현재 세션 유저의 객체를 뽑아냄 (user와 구분하기 위해서 user_session에 저장)
        user_session = User.objects.filter(email=email_session).first()

        # 세션에 이메일 정보가 있는데 그 이메일 주소가 우리 회원이 아닌경우 -> 로그인 페이지로 이동시킴
        if user_session is None:
            return render(request, "user/login.html")

        # 전달된 닉네임을 통해서 프로필로 이동할 유저의 객체를 뽑음
        user = User.objects.filter(nickname=nickname).first()
        if user is None:
            return render(request, "astronaut/main.html")
        # 유저의 객체에서 이메일을 구함
        email = user.email

        # 사용자가 작성한 피드 수 TODO
        user_feed_count = Feed.objects.filter(email=email).count()
        # 사용자가 작성한 피드리스트
        feed_list = Feed.objects.filter(email=email).order_by('-id')
        # 사용자가 좋아요한 피드들의 id 리스트
        like_list = list(Like.objects.filter(email=email).values_list('feed_id', flat=True))
        # 사용자가 좋아요한 피드 리스트
        like_feed_list = Feed.objects.filter(id__in=like_list).order_by('-id')
        # 사용자가 북마크한 피드들의 id 리스트
        bookmark_list = list(Bookmark.objects.filter(email=email).values_list('feed_id', flat=True))
        # 사용자가 북마크한 피드 리스트
        bookmark_feed_list = Feed.objects.filter(id__in=bookmark_list).order_by('-id')
        # 팔로우 여부
        is_follow = Follow.objects.filter(follower=email_session, following=email).exists()
        # 팔로워 팔로잉 수 계산
        follower_count = Follow.objects.filter(follower=email).count()
        following_count = Follow.objects.filter(following=email).count()

        # 사용자가 작성한 각 게시물들의 좋아요와 댓글 수를 조회할 때 필요한 리스트를 구하는 과정
        feed_count_list = []
        for feed in feed_list:
            # 좋아요 수
            like_count = Like.objects.filter(feed_id=feed.id).count()
            # 댓글 수
            reply_count = Reply.objects.filter(feed_id=feed.id).count()
            feed_count_list.append(dict(id=feed.id,
                                        like_count=like_count,
                                        reply_count=reply_count))

        # 사용자가 좋아요한 각 게시물들의 좋아요와 댓글 수를 조회할 때 필요한 리스트를 구하는 과정
        like_count_list = []
        for feed in like_feed_list:
            # 좋아요 수
            like_count = Like.objects.filter(feed_id=feed.id).count()
            # 댓글 수
            reply_count = Reply.objects.filter(feed_id=feed.id).count()
            like_count_list.append(dict(id=feed.id,
                                        like_count=like_count,
                                        reply_count=reply_count))
        # 사용자가 북마크한 각 게시물들의 좋아요와 댓글 수를 조회할 때 필요한 리스트를 구하는 과정
        bookmark_count_list = []
        for feed in bookmark_feed_list:
            # 좋아요 수
            like_count = Like.objects.filter(feed_id=feed.id).count()
            # 댓글 수
            reply_count = Reply.objects.filter(feed_id=feed.id).count()
            bookmark_count_list.append(dict(id=feed.id,
                                            like_count=like_count,
                                            reply_count=reply_count))

        # 정유진: 공유카테고리 피드들의 id 리스트
        shared_category_list = list(ShareCategory.objects.filter(email=email).values_list('feed_id', flat=True))
        # 정유진: 공유카테고리 피드 리스트
        shared_category_feed_list = Feed.objects.filter(id__in=shared_category_list).order_by('-id')
        # 정유진: 공유 중인 각 게시물들의 좋아요와 댓글 수를 조회할 때 필요한 리스트를 구하는 과정
        shared_category_count_list = []
        for feed in shared_category_feed_list:
            # 좋아요 수
            like_count = Like.objects.filter(feed_id=feed.id).count()
            # 댓글 수
            reply_count = Reply.objects.filter(feed_id=feed.id).count()
            shared_category_count_list.append(dict(id=feed.id,
                                                   like_count=like_count,
                                                   reply_count=reply_count))

        # 정유진: 피드 업로드 및 수정 시 필요한 맞팔되어 있는 유저 리스트
        follower_user_email_list = list(Follow.objects.filter(follower=email_session).values_list('following', flat=True))
        following_user_email_list = list(Follow.objects.filter(follower__in=follower_user_email_list, following=email_session).values_list('follower', flat=True))

        shared_category_nickname_list = User.objects.filter(email__in=following_user_email_list)

        # 알림 유무
        alert_exists = Alert.objects.filter(receive_user=email_session).exists()
        # 세션 유저에게 온 채팅 유무
        is_delivered_chat = Chat.objects.filter(receive_user=email_session, is_read=True).exists()

        # 프로필 화면을 요청한 사용자에게 프로필화면과 해당 데이터를 전달
        return render(request, 'content/profile.html', context=dict(feed_list=feed_list,
                                                                    like_feed_list=like_feed_list,
                                                                    bookmark_feed_list=bookmark_feed_list,
                                                                    shared_category_feed_list=shared_category_feed_list,
                                                                    user=user,
                                                                    feed_count_list=feed_count_list,
                                                                    like_count_list=like_count_list,
                                                                    bookmark_count_list=bookmark_count_list,
                                                                    shared_category_count_list=shared_category_count_list,
                                                                    user_session=user_session,
                                                                    user_feed_count=user_feed_count,
                                                                    is_follow=is_follow,
                                                                    follower_count=follower_count,
                                                                    following_count=following_count,
                                                                    shared_category_nickname_list=shared_category_nickname_list,
                                                                    alert_exists=alert_exists,
                                                                    is_delivered_chat=is_delivered_chat))

    # 팔로우는 내 프로필 페이지가 아닌 다른 사용자의 프로필 페이지에 접속했을 때 가능한 것이므로 ReplyProfile 클래스에 post 함수로 추가
    def post(self, request):
        # 팔로우를 하려는 유저
        user_follower = request.session.get('email', None)
        # 팔로우를 당하는 유저
        user_following = request.data.get('user_email', None)
        # 팔로우를 한 내 정보와 팔로우를 당한 상대 정보가 Follow 테이블에 있는지 조회
        follow = Follow.objects.filter(follower=user_follower, following=user_following).first()

        # follow 객체가 있다면 삭제
        if follow is not None:
            follow.delete()
        # Follow 객체가 없다면 follow 테이블에 새로운 튜플을 생성
        else:
            Follow.objects.create(follower=user_follower, following=user_following)
            Alert.objects.create(send_user=user_follower, receive_user=user_following, alert_content='follow')

        return Response(status=200)


# 채팅 친구 목록 클래스
class ChatView(APIView):
    def get(self, request):
        # 현재세션 정보를 받아옴. (네비바의 본인 프로필 정보를 위함)
        email_session = request.session.get('email', None)

        # 세션 정보를 토대로 User 테이블에서 현재 세션 유저의 객체를 뽑아냄 (user와 구분하기 위해서 user_session에 저장)
        user_session = User.objects.filter(email=email_session).first()

        # 세션 유저가 팔로우한 정보를 뽑아냄
        user_following = Follow.objects.filter(follower=email_session).values('following')
        # 다른 유저가 세선유저를 팔로우한 정보를 뽑아냄
        user_follower = Follow.objects.filter(following=email_session).values('follower')

        # 채팅이 할 유저의 목록을 뽑음
        chat_user = User.objects.filter(Q(email__in=user_following) | Q(email__in=user_follower))

        # 내가 해당 유저에게 보낸 채팅과 해당유저가 받은 채팅 객체들 뽑음 (최신순으로 정렬)
        receive_chat = Chat.objects.filter(receive_user=email_session, send_user__in=user_following).order_by('-id')

        # receive_chat에서 중복을 제거하여 발신자(send_user)의 고유한 목록을 저장합니다.
        send_user_set = set(chat.send_user for chat in receive_chat)
        send_chat_list = []

        # 각 발신자(send_user)의 가장 최근 채팅 객체가 저장됩니다. 즉, 각 발신자별로 최신 채팅을 가져와서 send_chat_list에 딕셔너리 형태로 추가합니다.
        for send_user in send_user_set:
            send_user_chat = receive_chat.filter(send_user=send_user).first()  # 해당 send_user의 가장 최근 채팅
            send_chat_list.append(dict(send_user_chat=send_user_chat))

        return render(request, "user/chat_user.html", context=dict(chat_user=chat_user, send_chat_list=send_chat_list))


# 채팅 클래스
class Chatting(APIView):
    def get(self, request):
        # 채팅을 보낼 유저의 이메일
        receive_user_email = request.GET.get('user_email', '')
        # 채팅을 보내는 나 자신의 이메일 (세션정보)
        email = request.session.get('email', None)
        # 세션 유저 객체
        user_session = User.objects.filter(email=email).first()
        # 채팅을 받는 유저 정보
        receive_chat_user = User.objects.filter(email=receive_user_email).first()
        # 내가 해당 유저에게 보낸 채팅과 해당유저가 받은 채팅 객체들
        send_receive_chat = Chat.objects.filter(
            Q(send_user=email, receive_user=receive_user_email) | Q(receive_user=email, send_user=receive_user_email)
        )

        # 채팅을 받은 사용자가 채팅 확인 유무
        is_read_chat = Chat.objects.filter(send_user=receive_user_email, receive_user=email)
        is_read_chat.update(is_read=False)

        # 만약 채팅의 개수가 30개라면 일괄 삭제
        if send_receive_chat.count() > 30:
            send_receive_chat.delete()

        return render(request, "content/chat.html", context=dict(receive_chat_user=receive_chat_user,
                                                                 send_receive_chat=send_receive_chat,
                                                                 user_session=user_session))

    def post(self, request):
        # 서버로 전달된 데이터 ( 채팅 내용, 보낼 유저 )
        chat_content = request.data.get('chat_content', None)
        receive_chat_user = request.data.get('receive_chat_user', None)
        # 세션에 저장된 이메일을 request 요청으로 가져와서 변수 email에 저장 -> 이메일로 세션 유저 객체를 구함
        email = request.session.get('email', None)
        user = User.objects.filter(email=email).first()

        # 서버로 전달된 데이터를 토대로 채팅 테이블에 저장
        Chat.objects.create(send_user=email, receive_user=receive_chat_user, chat_content=chat_content)

        # 성공적으로 전달이 되었다는 응답과 ajax 비동기 처리를 위한 성공 함수 인자인 data에 데이터를 전달하기 위해서 보냄
        return Response(status=200, data=dict(chat_content=chat_content))


# 알림 클래스
class AlertAll(APIView):
    def get(self, request):
        # 세션 유저 이메일을 가져옴
        email = request.session.get('email', None)
        # 나에게 온 알림을 전부 가져옴
        receive_alert_me = Alert.objects.filter(receive_user=email)

        # 알림 리스트 생성후 데이터 채움
        alert_list = []
        for alert in receive_alert_me:
            alert_send_user = User.objects.filter(email=alert.send_user).first()
            alert_feed = Feed.objects.filter(id=alert.feed_id).first()
            # 정유진 댓글 길이가 10자 이상일 경우 글자가 잘리고 '...'이 붙는다
            if len(alert.reply_content) >= 10:
                alert_reply = alert.reply_content[:10] + '...'
            else:
                alert_reply = alert.reply_content
            alert_list.append(dict(alert_id=alert.id,
                                   alert_send_user=alert_send_user,
                                   alert_content=alert.alert_content,
                                   alert_time=alert.alert_time,
                                   alert_feed=alert_feed,
                                   alert_reply=alert_reply))

        return render(request, "content/alert.html", context=dict(alert_list=alert_list))

    def post(self, request):
        # 알림을 삭제할 세션유저의 이메일을 가져옴
        email = request.session.get('email', None)
        # 알림 모두 삭제 메시지 내용
        remove_message = request.data.get('remove_message', None)
        # 삭제할 알림의 id
        alert_id = request.data.get('alert_id', None)
        print(alert_id)

        # 만약 메시지 내용이 모두 삭제이면 해당 유저에게 온 모든 알림을 삭제
        if remove_message == '모두 확인':
            remove_alert = Alert.objects.filter(receive_user=email)
            remove_alert.delete()
        # 개별 삭제일 경우 해당 id를 가진 알림만 삭제
        else:
            remove_alert = Alert.objects.filter(id=alert_id)
            remove_alert.delete()

        return Response(status=200)
