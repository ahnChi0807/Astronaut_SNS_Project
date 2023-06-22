import random
from uuid import uuid4
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from Astronaut.settings import MEDIA_ROOT
from .models import Feed, Reply, Like, Bookmark, Hashtag, Follow, Image, ShareCategory, Alert, Chat
from user.models import User
import os
import json
from django.http import HttpResponse
from django.db.models import Q


# 메인 페이지를 보여주는 클래스
class Main(APIView):
    # noinspection PyMethodMayBeStatic
    def get(self, request):
        # 세션 정보에 저장된 이메일을 request 요청으로 가져와서 변수 email에 저장
        email = request.session.get('email', None)
        # 팔로우 스위치 버튼 여부
        is_checked = request.GET.get('is_checked', None)

        # 만약 팔로우 스위치 버튼 여부가 checked면 True
        if is_checked == 'checked':
            is_checked = True
        else:
            is_checked = False

        # 세션에 이메일 정보가 없는경우 -> 로그인을 하지 않고 메인페이지에 접속했다는 뜻 -> 로그인 페이지로 이동시킴
        if email is None:
            return render(request, "user/login.html")

        # 현재 세션 정보의 이메일로 현재 세션 유저의 객체를 뽑아냄 , user_session 과 user와 겹치지 않기 위해서 세션 정보는 user_session에 저장
        user_session = User.objects.filter(email=email).first()
        # 세션에 이메일 정보가 있는데 그 이메일 주소가 우리 회원이 아닌 경우 -> 로그인 페이지로 이동시킴
        if user_session is None:
            return render(request, "user/login.html")

        # 내가 팔로우한 리스트 뽑음
        following_email_list = Follow.objects.filter(follower=email).values_list('following', flat=True)

        feed_list = []
        # 팔로우 보기면 팔로우한 사람의 피드만 아니라면 모든 피드를 보여줌
        if is_checked:
            feed_object_list = Feed.objects.filter(email__in=following_email_list).order_by('-id')
        else:
            feed_object_list = Feed.objects.all().order_by('-id')

        # 유저를 검색하기 위해서 유저 정보를 모두 가져옴
        user_object_list = User.objects.all()

        # 아래 반복문은 메인 페이지에 전달할 정보를 각종 여러 테이블의 필터링을 통해서 구하는 과정
        for feed in feed_object_list:
            count = 0
            user = User.objects.filter(email=feed.email).first()
            # 댓글의 2개만 가져온다. -> 나머지 댓글은 더보기로 보여줄 예정, 댓글리스트 생성
            reply_object_list = Reply.objects.filter(feed_id=feed.id)[:2]
            reply_list = []
            # 해당 feed_id에 존재하는 해시태그들을 가져옴 ,해시태그 리스트 생성
            hashtag_object_list = Hashtag.objects.filter(feed_id=feed.id)
            hashtag_list = []
            # 댓글 리스트에 채울 데이터를 여러 테이블의 필터링을 통해서 채움
            for reply in reply_object_list:
                reply_user = User.objects.filter(email=reply.email).first()
                reply_list.append(dict(reply_content=reply.reply_content,
                                       nickname=reply_user.nickname, profile_image=reply_user.profile_image,
                                       id=reply.id))
            # 해시태그 리스트에 채울 데이터를 여러 테이블의 필터링을 통해서 채움
            for hashtag in hashtag_object_list:
                hashtag_feed = Feed.objects.filter(id=feed.id).first()
                hashtag_list.append(dict(feed_id=hashtag_feed, content=hashtag.content))
                # 이미지 추가
            images_object_list = Image.objects.filter(feed_id=feed.id)
            images_list = []
            for image in images_object_list:
                images_feed = Feed.objects.filter(id=feed.id).first()
                images_list.append(dict(feed_id=images_feed, image=image.image, count=count, now_count=count + 1))
                count = count + 1
            # 좋아요 수, 좋아요 여부, 북마크 여부
            like_count = Like.objects.filter(feed_id=feed.id).count()
            is_liked = Like.objects.filter(feed_id=feed.id, email=email).exists()
            is_marked = Bookmark.objects.filter(feed_id=feed.id, email=email).exists()
            # 정유진: 카테고리 정보
            if feed.category == 'travel':
                category_kr = '여행'
            elif feed.category == 'food':
                category_kr = '음식'
            elif feed.category == 'daily':
                category_kr = '일상'
            elif feed.category == 'sports':
                category_kr = '스포츠'
            elif feed.category == 'companion_animal':
                category_kr = '반려동물'

            # 정유진: 피드의 공유 유무.
            shared_category_user_list = ShareCategory.objects.filter(feed_id=feed.id).values_list('email', flat=True)
            is_shared_category = shared_category_user_list.exists()
            is_shared_category_user = ShareCategory.objects.filter(feed_id=feed.id, email=email).exists()

            # 정유진: 피드의 공유 유저 리스트
            if is_shared_category:
                shared_category_user_nickname_list = User.objects.filter(email__in=shared_category_user_list).values_list('nickname', flat=True)
            else:
                shared_category_user_nickname_list = []
            # 각종 데이터를 feed_list에 담음
            feed_list.append(dict(id=feed.id,
                                  images_list=images_list,
                                  content=feed.content,
                                  like_count=like_count,
                                  profile_image=user.profile_image,
                                  nickname=user.nickname,
                                  reply_list=reply_list,
                                  is_liked=is_liked,
                                  is_marked=is_marked,
                                  create_at=feed.create_at,
                                  hashtag_list=hashtag_list,
                                  category=feed.category,
                                  category_kr=category_kr,
                                  image_count=count,
                                  is_shared_category=is_shared_category,
                                  is_shared_category_user=is_shared_category_user,
                                  shared_category_user_nickname_list=shared_category_user_nickname_list
                                  ))
        # 정유진: 피드 업로드 및 수정 시 필요한 맞팔되어 있는 유저 리스트
        follower_user_email_list = list(
            Follow.objects.filter(follower=user_session.email).values_list('following', flat=True))
        following_user_email_list = list(
            Follow.objects.filter(follower__in=follower_user_email_list, following=user_session.email).values_list(
                'follower', flat=True))

        shared_category_nickname_list = User.objects.filter(email__in=following_user_email_list)

        # 세션 유저에게 온 알림 유무
        alert_exists = Alert.objects.filter(receive_user=email).exists()

        # 세션 유저에게 온 채팅 유무
        is_delivered_chat = Chat.objects.filter(receive_user=email, is_read=True).exists()

        # 내가 팔로우한 사람들의 이메일을 리스트로 뽑음
        my_follow_list = list(
            Follow.objects.filter(follower=email).values_list('following', flat=True))
        # 내가 팔로우한 사람들은 배제
        not_follow_list = user_object_list.exclude(email__in=my_follow_list)

        follow_recommend_list = []

        for index in not_follow_list:
            # 내가 팔로우 한 사람이 해당 사람도 팔로우 하고 있는 수, 나 자신은 제외
            if index.email != email and index.email != 'acy87@naver.com':
                follow_count = Follow.objects.filter(follower__in=my_follow_list, following=index.email).count()
                is_follow = Follow.objects.filter(follower=email, following=index.email).exists()
                follow_recommend_list.append(dict(follow_recommend_user=index, follow_count=follow_count, is_follow=is_follow))

        # 메인에서 팔로우 추천이 보여줄 4명보다 적은지 판단
        if len(follow_recommend_list) < 4:
            main_recommend_follow_list = follow_recommend_list
        else:
            main_recommend_follow_list = random.sample(follow_recommend_list, 4)

        # 메인페이지 url을 요청한 사용자에게 메인페이지와 각종 데이터를 전달
        return render(request, "astronaut/main.html",
                      context=dict(feeds=feed_list, user_session=user_session, user_object_list=user_object_list,
                                   alert_exists=alert_exists, is_delivered_chat=is_delivered_chat,
                                   shared_category_nickname_list=shared_category_nickname_list, is_checked=is_checked,
                                   follow_recommend_list=follow_recommend_list,
                                   main_recommend_follow_list=main_recommend_follow_list,
                                   ))


# 피드 업로드 클래스
class UploadFeed(APIView):
    # noinspection PyMethodMayBeStatic
    def post(self, request):
        # 서버로 전달된 폼 데이터 객체에서 파일을 꺼냄
        file_length = int(request.data['file_length'])
        content = request.data.get('content')
        email = request.session.get('email', None)
        # 정유진: 카테고리 추가
        category = request.data.get('category')
        # 정유진: 공유카테고리 추가
        shared_category_list = request.data.getlist('shared_category_list[]')

        # 서버로 전달된 해시태그 내용을 받고 해당 해시태그의 공백와 줄바꿈을 제거
        hashtags_content = request.data.get('hashtags_content')
        hashtags_content = hashtags_content.replace(" ", "");
        hashtags_content = hashtags_content.replace("\n", "");
        # 해시태그를 #으로 구분
        hashtags_list = hashtags_content.split("#")
        # 만일 첫번째 글자에 #이 안들어 갔을 경우 값을 지움
        if (hashtags_content.find("#") != 0):
            del hashtags_list[0]

        # 해시태그 중복을 제거한 결과를 저장할 해시태그 리스트
        hashtags_lists = []

        # 같은 해시태그의 중복 제거, set-list로 하면 랜덤 배정이 되어 for문으로 바꿈
        for value in hashtags_list:
            if value not in hashtags_lists:
                hashtags_lists.append(value)
        # #으로 구분 했을때 #앞에 아무것 없는 공백이 저장 되는 부분을 삭제
        hashtags_list = list(filter(None, hashtags_lists))
        # 피드 테이블에 튜플을 만들고 그 튜플을 feed_id 객체로 저장

        # 이미지는 여러개라 반복문으로 튜플 생성
        for i in range(file_length):
            file = request.FILES.get('file[' + str(i) + ']')
            # uuid 값 생성
            uuid_name = uuid4().hex
            # 파일을 어디에 저장할 것 인지 경로를 설정 (미디어 루트 + uuid_name)
            save_path = os.path.join(MEDIA_ROOT, uuid_name)
            if i == 0:
                feed_id = Feed.objects.create(content=content, email=email, category=category, image=uuid_name)
            # media 폴더에 파일이 저장됨
            with open(save_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            # 폼 데이터객체에서 나머지 일반 데이터(글내용, 작성자 이메일)를 꺼냄
            Image.objects.create(image=uuid_name, feed_id=feed_id.id)

        # 해시태그는 여러개라 반복문으로 테이블 튜플을 생성 ( 해시태그 리스트는 리스트 형태 )
        for hashtags_list in hashtags_list:
            Hashtag.objects.create(content=hashtags_list, feed_id=feed_id.id)

        # 정유진: 공유카테고리. 작성자 추가.
        if shared_category_list:
            ShareCategory.objects.create(feed_id=feed_id.id, email=email)
        # 정유진: 공유카테고리는 여러개라 반복문으로 테이블 튜플을 생성.
        for shared_category in shared_category_list:
            # 정유진: 닉네임으로 email 찾기
            shared_category_email = User.objects.filter(nickname=shared_category).first()
            ShareCategory.objects.create(feed_id=feed_id.id, email=shared_category_email.email)

        return Response(status=200)


# 댓글 업로드 클래스
class UploadReply(APIView):
    # noinspection PyMethodMayBeStatic
    def post(self, request):
        # 서버로 전달된 데이터를 받아서 처리(피드id, 댓글 내용,
        feed_id = request.data.get('feed_id', None)
        reply_content = request.data.get('reply_content', None)
        # 피드 작성자 닉네임
        feed_user_nickname = request.data.get('feed_user_nickname', True)

        # 알림을 받을 유저 정보를 구함
        receive_user = User.objects.filter(nickname=feed_user_nickname).first()
        receive_user_email = receive_user

        # 세션에 저장된 이메일을 request 요청으로 가져와서 변수 email에 저장 -> 이메일로 세션 유저 객체를 구함
        email = request.session.get('email', None)
        user = User.objects.filter(email=email).first()

        # 세션이메일과 알림 받을 유저의 이메일의 타입 형식을 문자열로 변환
        email_str = str(email)
        receive_user_email_str = str(receive_user_email)

        # 서버로 전달된 데이터를 토대로 Reply 테이블에 새로운 튜플을 생성한 뒤 생성된 객체의 id값을 변수 reply_id에 저장
        reply_id = Reply.objects.create(feed_id=feed_id, reply_content=reply_content, email=email).id
        # 자기 자신의 게시물에 댓글을 작성한 경우 알림이 가지 않게 함 TODO
        if email_str != receive_user_email_str:
            Alert.objects.create(send_user=email, receive_user=receive_user_email, alert_content='reply',
                                 feed_id=feed_id, reply_content=reply_content)
        # 성공적으로 전달이 되었다는 응답과 ajax 비동기 처리를 위한 성공 함수 인자인 data에 데이터를 전달하기 위해서 보냄
        return Response(status=200, data=dict(user_nickname=user.nickname,
                                              user_profile_image=user.profile_image,
                                              user_reply_id=reply_id))


# 좋아요 클래스
class ToggleLike(APIView):
    # noinspection PyMethodMayBeStatic
    def post(self, request):
        # 사용자가 좋아요시 서버로 전달된 데이터를 받음 (feed_id는 몇번 피드에 좋아요를 눌렀는지 알기 위함 )
        feed_id = request.data.get('feed_id', None)
        # 좋아요 아이콘의 색 여부를 통해서 판별
        favorite_color = request.data.get('favorite_color', True)
        # 세션에 저장된 이메일을 request 요청으로 가져와서 변수 email에 저장 -> 이메일로 세션 유저 객체를 구함
        email = request.session.get('email', None)
        # 피드 작성자 닉네임
        feed_user_nickname = request.data.get('feed_user_nickname', True)

        # 알림을 받을 유저 정보를 구함
        receive_user = User.objects.filter(nickname=feed_user_nickname).first()
        receive_user_email = receive_user

        # 해당 피드에 현재 세션의 사용자가 좋아요를 누른 정보가 있다면 뽑아서 like에 저장
        like = Like.objects.filter(feed_id=feed_id, email=email).first()

        # 세션이메일과 알림 받을 유저의 이메일의 타입 형식을 문자열로 변환
        email_str = str(email)
        receive_user_email_str = str(receive_user_email)

        # 뽑은 객체가 존재 한다면 like객체를 삭제
        if like is not None:
            like.delete()
        # like 객체가 존재하지 않다면 좋아요 테이블에 새로운 튜플을 생성
        else:
            Like.objects.create(feed_id=feed_id, email=email)
            # 자기 자신의 게시물에 좋아요를 누른경우 알림이 가지 않게 함 TODO
            if receive_user_email_str != email_str:
                Alert.objects.create(send_user=email, receive_user=receive_user_email, alert_content='like',
                                     feed_id=feed_id)

        # 비동기 처리를 위한 좋아요 수
        async_like_count = Like.objects.filter(feed_id=feed_id).count()

        # ajax 비동기 처리를 위한 성공 함수 인자인 data에 데이터를 전달하기 위한 과정
        data = {
            'async_like_count': async_like_count
        }

        json_data = json.dumps(data)
        return HttpResponse(json_data, content_type='application/json')


# 북마크 클래스
class ToggleBookmark(APIView):
    # noinspection PyMethodMayBeStatic
    def post(self, request):
        # 사용자가 북마크시 서버로 전달된 데이터를 받음 (feed_id는 몇번 피드에 북마크를 눌렀는지 알기 위함 )
        feed_id = request.data.get('feed_id', None)
        # 북마크 아이콘의 색 여부를 통해서 판별
        bookmark_color = request.data.get('bookmark_color', True)
        # 세션에 저장된 이메일을 request 요청으로 가져와서 변수 email에 저장 -> 이메일로 세션 유저 객체를 구함
        email = request.session.get('email', None)

        # 해당 피드에 현재 세션의 사용자가 북마크를 누른 정보가 있다면 뽑아서 bookmark에 저장
        bookmark = Bookmark.objects.filter(feed_id=feed_id, email=email).first()

        # 뽑은 객체가 존재 한다면 bookmark객체를 삭제
        if bookmark is not None:
            bookmark.delete()
        # bookmark객체가 존재하지 않다면 북마크 테이블에 새로운 튜플을 생성
        else:
            Bookmark.objects.create(feed_id=feed_id, email=email)

        return Response(status=200)


# 피드 삭제 클래스
class RemoveFeed(APIView):
    def post(self, request):
        # 서버로 전달된 데이터를 받아서 처리(피드id, 몇번 피드를 지울 것인지에 대한 정보)
        feed_id = request.data.get('feed_id')

        # 전달된 피드id를 통해서 삭제할 피드 객체를 뽑음
        feeds = Feed.objects.filter(id=feed_id).first()

        # 전달된 피드id를 통해서 작제할 이미지들을 뽑음
        images = Image.objects.filter(feed_id=feed_id)
        images.delete()
        # 전달된 피드id를 통해서 삭제할 댓글 객체를 뽑음
        reply = Reply.objects.filter(feed_id=feed_id)
        reply.delete()
        # 전달된 피드id를 통해서 삭제할 해시태그 객체를 뽑음
        hashtags = Hashtag.objects.filter(feed_id=feeds.id)
        hashtags.delete()
        # 전달된 피드id를 통해서 삭제할 좋아요 북마크 객체를 뽑음
        like = Like.objects.filter(feed_id=feeds.id)
        like.delete()
        bookmark = Bookmark.objects.filter(feed_id=feeds.id)
        bookmark.delete()
        # 정유진: 전달된 피드id를 통해서 삭제할 공유카테로기 객체를 뽑음
        shared_category = ShareCategory.objects.filter(feed_id=feeds.id)
        shared_category.delete()
        feeds.delete()

        return Response(status=200)


# 검색 클래스
class SearchFeed(APIView):
    def get(self, request):
        # 카테고리 옵션 1, 2
        category_option1 = request.GET.get('category_option1', None)
        category_option2 = request.GET.get('category_option2', None)
        # 서버로 전달된 데이터를 받아서 처리(검색 키워드)
        searchKeyword = request.GET.get("search", "")
        # 필터링 시작 날짜
        start_date = request.GET.get('start_date', None)
        # 필터링 끝 날짜
        end_date = request.GET.get('end_date', None)
        # 현재 보고 있는 정렬 방식 (최신, 좋아요, 댓글)
        show_recent = request.GET.get('show_recent', '')
        show_like = request.GET.get('show_like', '')
        show_reply = request.GET.get('show_reply', '')
        # 세션에 저장된 이메일을 request 요청으로 가져와서 변수 email에 저장 -> 이메일로 세션 유저 객체를 구함
        email = request.session.get('email', None)
        # 현재 세션 정보의 이메일로 현재 세션 유저의 객체를 뽑아냄 , user
        user_session = User.objects.filter(email=email).first()
        # 만약 검색 키워드가 유저 닉네임중 포함되는 닉네임이 있다면 뽑아냄
        user_object_list = User.objects.filter(nickname__contains=searchKeyword)

        print(category_option2)
        print(category_option1)
        print(start_date)
        print(end_date)
        print(searchKeyword)
        print(show_recent)
        print(show_reply)
        print(show_like)

        # 검색창에 검색시 기본 정렬을 최신순으로 한다.
        if show_recent == '' and show_like == '' and show_reply == '':
            show_recent = 'recent_sort'
        # 해시태그 검색
        if (searchKeyword.find("#") == 0):
            # 해시태그의 #을 제거
            text = searchKeyword.replace("#", "");
            # 해시태그 테이블에서 검색키워드 텍스트랑 같은게 있다면 해당 객체에서 feed_id만 리스트형태로 반환
            if '모음보기' in text:
                text = text.replace("모음보기", "")
                print(text)
                hashtag_content_lists = list(
                    Hashtag.objects.filter(content__contains=text).values_list('feed_id', flat=True))
            else:
                hashtag_content_lists = list(
                    Hashtag.objects.filter(content=text).values_list('feed_id', flat=True))

            # 검색결과 여부를 판정할 변수 리스트에 값이 없다면 불린 값을 반환
            is_exist_feed = bool(hashtag_content_lists)

            # 검색결과가 없을경우 해당 페이지를 보여줌
            if not is_exist_feed:
                return render(request, 'astronaut/noresult.html', context=dict(user_session=user_session))

            # 메인 대표 이미지를 위한 객체 하나 뽑음 ( 기본 )
            if category_option1 is None and category_option2 is None and start_date is None and end_date is None:
                feed_main_image = Feed.objects.filter(id__in=hashtag_content_lists).first()
                print("기본 최신순")
            # 메인 대표 이미지를 위한 객체 하나 뽑음 ( 카테고리 시간 함께 필터링 )
            elif category_option1 is not None and category_option2 is not None and start_date is not None and end_date is not None:
                feed_main_image = Feed.objects.filter(id__in=hashtag_content_lists,
                                                      create_at__range=[start_date, end_date],
                                                      category__in=[category_option1, category_option2]).first()
                print("카테고리 시간 모두 필터링")
            # 메인 대표 이미지를 위한 객체 하나 뽑음 ( 시간 값으로 필터링 )
            elif start_date is not None and end_date is not None:
                feed_main_image = Feed.objects.filter(id__in=hashtag_content_lists,
                                                      create_at__range=[start_date, end_date]).first()
                print("시간 순으로 필터링")
            else:
                feed_main_image = Feed.objects.filter(id__in=hashtag_content_lists,
                                                      category__in=[category_option1, category_option2]).first()
                print("카테고리로 필터링")

            # 해당 날짜 범위의 피드가 있는지?
            is_exist_feed = feed_main_image is not None

            # 없을경우 해당 페이지를 보여줌
            if not is_exist_feed:
                return render(request, 'astronaut/noresult.html', context=dict(user_session=user_session))

            # 이미지 리스트
            image_list = []

            # 피드 리스트와 해당 피드에 좋아요와 댓글수를 저장할 리스트 선언
            feed_search_list = []
            feed_count_list = []

            # 기본 정렬 ( 단순 키워드가 포함된 )피드 객체들을 뽑음
            if category_option1 is None and category_option2 is None and start_date is None and end_date is None:
                feed_hashtag_list = Feed.objects.filter(id__in=hashtag_content_lists).order_by('-id')
                print("피드 기본 최신순")
            # 카테고리 정렬 ( 단순 키워드와 카테고리가 포함된 )피드 객체들을 뽑음
            elif category_option1 is not None and category_option2 is not None and start_date is not None and end_date is not None:
                feed_hashtag_list = Feed.objects.filter(id__in=hashtag_content_lists,
                                                        create_at__range=[start_date, end_date],
                                                        category__in=[category_option1, category_option2]).order_by('-id')
                print("피드 카테고리 시간 모두 필터링")
            # 날짜 정렬 ( 단순 키워드와 날짜가 포함된 )피드 객체들을 뽑음
            elif start_date is not None and end_date is not None:
                feed_hashtag_list = Feed.objects.filter(id__in=hashtag_content_lists,
                                                        create_at__range=[start_date, end_date]).order_by('-id')
                print("피드 시간 순으로 필터링")
            # 일괄 정렬 ( 단순 키워드와 카테고리 날짜가 포함된 )피드 객체들을 뽑음
            else:
                feed_hashtag_list = Feed.objects.filter(id__in=hashtag_content_lists,
                                                        category__in=[category_option1, category_option2]).order_by('-id')
                print("피드 카테고리로 필터링")

            # 피드 객체들을 순회하며 필요한 정보를 추출
            for feed in feed_hashtag_list:
                # 좋아요 수
                like_count = Like.objects.filter(feed_id=feed.id).count()
                # 댓글 수
                reply_count = Reply.objects.filter(feed_id=feed.id).count()
                # 리스트에 해당 데이터들을 넣음
                feed_search_list.append(
                    dict(id=feed.id, image=feed.image, like_count=like_count, reply_count=reply_count))
                feed_count_list.append(dict(id=feed.id, like_count=like_count, reply_count=reply_count))

            # 최신 순으로 보기
            if show_recent:
                # 최근에 추가된 게시물 순으로 정렬 람다식 이용
                feed_search_list = sorted(feed_search_list, key=lambda x: x['id'], reverse=True)
            # 좋아요 순으로 보기
            elif show_like:
                # 좋아요가 많은 게시물 순으로 정렬 람다식 이용
                feed_search_list = sorted(feed_search_list, key=lambda x: x['like_count'],
                                          reverse=True)
            # 댓글 순으로 보기
            elif show_reply:
                # 댓글이 많은 게시물 순으로 정렬 람다식 이용
                feed_search_list = sorted(feed_search_list, key=lambda x: x['reply_count'],
                                          reverse=True)
            # 총 게시물 수
            feed_all_count = feed_all_count = len(feed_search_list)

        # 일반 키워드 검색
        else:
            # 기본 정렬 ( 단순 키워드가 포함된 )피드 객체들을 뽑음
            if category_option1 is None and category_option2 is None and start_date is None and end_date is None:
                feed_search_object_list = Feed.objects.filter(content__contains=searchKeyword)
                print("기본 최신순")
            # 카테고리 정렬 ( 단순 키워드와 카테고리가 포함된 )피드 객체들을 뽑음
            elif category_option1 is not None and category_option2 is not None and start_date is not None and end_date is not None:
                feed_search_object_list = Feed.objects.filter(content__contains=searchKeyword,
                                                              create_at__range=[start_date, end_date],
                                                              category__in=[category_option1, category_option2])
                print("카테고리 시간 모두 필터링")
            # 날짜 정렬 ( 단순 키워드와 날짜가 포함된 )피드 객체들을 뽑음
            elif start_date is not None and end_date is not None:
                feed_search_object_list = Feed.objects.filter(content__contains=searchKeyword,
                                                              create_at__range=[start_date, end_date])
                print("시간 순으로 필터링")
            # 일괄 정렬 ( 단순 키워드와 카테고리 날짜가 포함된 )피드 객체들을 뽑음
            else:
                feed_search_object_list = Feed.objects.filter(content__contains=searchKeyword,
                                                              category__in=[category_option1, category_option2])
                print("카테고리로 필터링")

            # 대표 이미지를 위한 객체 하나를 뽑음
            feed_main_image = feed_search_object_list.first()
            # 검색 키워드가 포함된 피드 개수를 구함
            feed_all_count = feed_search_object_list.count()
            # 검색 키워드가 포함된 피드가 있는지?
            is_exist_feed = feed_search_object_list.exists()

            # 검색결과가 없을경우 해당 페이지를 보여줌
            if not is_exist_feed:
                return render(request, 'astronaut/noresult.html', context=dict(user_session=user_session))

            # 검색키워드가 포함된 게시물들의 좋아요와 댓글 수를 조회할 때 필요한 데이터를 구하는 과정
            feed_count_list = []
            feed_search_list = []
            for feed in feed_search_object_list:
                # 좋아요 수 확인.
                like_count = Like.objects.filter(feed_id=feed.id).count()
                # 댓글 수 확인.
                reply_count = Reply.objects.filter(feed_id=feed.id).count()
                # 피드 객체들의 정보를 리스트에 추가
                feed_search_list.append(
                    dict(id=feed.id, image=feed.image, reply_count=reply_count, like_count=like_count))

            # 최신 순으로 보기
            if show_recent:
                # 최근에 추가된 게시물 순으로 정렬 람다식 이용
                feed_search_list = sorted(feed_search_list, key=lambda x: x['id'], reverse=True)
            # 좋아요 순으로 보기
            elif show_like:
                # 좋아요가 많은 게시물 순으로 정렬 람다식 이용
                feed_search_list = sorted(feed_search_list, key=lambda x: x['like_count'],
                                          reverse=True)
            # 댓글 순으로 보기
            elif show_reply:
                # 댓글이 많은 게시물 순으로 정렬 람다식 이용
                feed_search_list = sorted(feed_search_list, key=lambda x: x['reply_count'],
                                          reverse=True)
        # 세션 유저에게 온 알림 유무
        alert_exists = Alert.objects.filter(receive_user=email).exists()

        # 세션 유저에게 온 채팅 유무
        is_delivered_chat = Chat.objects.filter(receive_user=email, is_read=True).exists()

        # 검색결과를 검색결과 페이지랑 데이터를 사용자에게 반환
        return render(request, "astronaut/search.html",
                      context=dict(user_session=user_session,
                                   user_object_list=user_object_list, feed_search_list=feed_search_list,
                                   searchKeyword=searchKeyword, feed_main_image=feed_main_image,
                                   start_date=start_date, end_date=end_date, show_method_recent=show_recent,
                                   show_method_like=show_like, show_method_reply=show_reply,
                                   feed_all_count=feed_all_count, category_option1=category_option1,
                                   category_option2=category_option2, alert_exists=alert_exists,
                                   is_delivered_chat=is_delivered_chat))


# 댓글 삭제 클래스
class RemoveReply(APIView):
    def post(self, request):
        # 삭제할 댓글 id
        reply_id = request.data.get('reply_id')
        # 댓글id를 통해 삭제할 댓글 객체를 뽑음
        replys = Reply.objects.filter(id=reply_id)
        # 댓글 삭제
        replys.delete()

        return Response(status=200)


#  피드 수정 클래스
class UpdateFeed(APIView):
    def post(self, request):
        # 수정을 위한 서버로 전달된 데이터 (해시태그, 글내용, 수정될 피드id)
        hashtag_content = request.data.get('hashtag_content')
        content = request.data.get('content')
        feed_id = request.data.get('feed_id')
        email = request.session.get('email', None)
        # 정유진: 수정을 위한 서버로 전달된 데이터 (카테고리)
        category = request.data.get('category')
        # 정유진: 수정을 위한 서버로 전달된 데이터 (공유카테고리)
        shared_category_list = request.data.getlist('shared_category_list[]')
        # 피드id를 통한 피드에 달린 기존 해시태그들 삭제
        hashtags = Hashtag.objects.filter(feed_id=feed_id)
        hashtags.delete()
        # 전달된 해시태그를 공백과 줄바꿈을 제거
        hashtag_content = hashtag_content.replace(" ", "");
        hashtag_content = hashtag_content.replace("\n", "");
        # 해시태그들을 #으로 구분
        hashtags_list = hashtag_content.split("#")
        # 만일 첫번째 글자에 #이 안들어 갔을 경우 값을 지움
        if (hashtag_content.find("#") != 0):
            del hashtags_list[0]

        # 수정 작업을 거친 해시태그들을 저장할 리스트
        hashtags_lists = []

        # 같은 해시태그의 중복 제거, set-list로 하면 랜덤 배정이 되어 for문으로 바꿈
        for value in hashtags_list:
            if value not in hashtags_lists:
                hashtags_lists.append(value)

        # 맨 앞에 공백을 제거
        hashtags_lists = list(filter(None, hashtags_list))

        # 수정할 해시태그 값들을 해시태그 테이블에 생성
        for hashtags_lists in hashtags_lists:
            Hashtag.objects.create(content=hashtags_lists, feed_id=feed_id)

        # 수정할 피드 객체를 뽑음
        feed = Feed.objects.filter(id=feed_id)
        # 피드 수정
        feed.update(id=feed_id, content=content, category=category)

        # 정유진: 공유카테고리. 삭제(feed_id, 맞팔) 후 다시 추가
        follower_user_email_list = list(Follow.objects.filter(follower=email).values_list('following', flat=True))
        following_user_email_list = list(
            Follow.objects.filter(follower__in=follower_user_email_list, following=email).values_list('follower',
                                                                                                      flat=True))

        delete_shared_category_user_list = ShareCategory.objects.filter(feed_id=feed_id,
                                                                        email__in=following_user_email_list)

        delete_shared_category_user_list.delete()

        for shared_category_nickname in shared_category_list:
            shared_category_email = User.objects.filter(nickname=shared_category_nickname).first()
            ShareCategory.objects.create(feed_id=feed_id, email=shared_category_email)

        return Response(status=200)


# 댓글 수정 클래스
class UpdateReply(APIView):
    def post(self, request):
        # 서버로 전달된 데이터를 처리 (수정할 댓글의 아이디와 댓글 내용)
        content = request.data.get('content')
        reply_id = request.data.get('reply_id')
        # 댓글 id를 통해 수정할 댓글 객체를 뽑음
        reply = Reply.objects.filter(id=reply_id)
        # 댓글 수정
        reply.update(id=reply_id, reply_content=content)

        return Response(status=200)


# 피드를 모달창으로 여는 클래스
class FeedModal(APIView):
    def get(self, request):
        # 서버로 전달된 모달로 열 피드 id를 받음
        feed_id = int(request.GET.get('feed_id', None))
        # 세션 정보에 저장된 이메일을 request 요청으로 가져와서 변수 email에 저장
        email = request.session.get('email', None)

        # feed_id를 통해 모달로 열 피드의 객체를 뽑음
        feed_modal = Feed.objects.filter(id=feed_id).first()

        # 게시물을 쓴 유저의 객체를 뽑아냄
        feed_modal_writer = User.objects.filter(email=feed_modal.email).first()

        if feed_modal.category == 'travel':
            category_kr = '여행'
        elif feed_modal.category == 'food':
            category_kr = '음식'
        elif feed_modal.category == 'daily':
            category_kr = '일상'
        elif feed_modal.category == 'sports':
            category_kr = '스포츠'
        elif feed_modal.category == 'companion_animal':
            category_kr = '반려동물'

        # 게시물에 달린 해시태그들을 뽑아냄
        feed_modal_hashtag_object_list = Hashtag.objects.filter(feed_id=feed_id)
        # 해시태그 내용을 전달하기 위해서 리스트를 선언한 뒤 반복문을 통해 해시태그를 채움
        # 해시태그 내용을 리스트로 추출 TODO 수정 완료
        hashtag_list = list(feed_modal_hashtag_object_list.values_list('content', flat=True))

        # 게시물에 달린 댓글 정보
        feed_modal_reply_object_list = Reply.objects.filter(feed_id=feed_id)
        # 댓글 내용을 전달하기 위해서 리스트를 선안한 뒤 반복문을 통해 여러 테이블의 데이터를 채움 (댓글을 쓴 유저의 정보)
        reply_list = []
        for reply in feed_modal_reply_object_list:
            reply_user = User.objects.filter(email=reply.email).first()
            reply_list.append(dict(reply_content=reply.reply_content,
                                   nickname=reply_user.nickname,
                                   profile_image=reply_user.profile_image))
        # 피드의 좋아요 수
        like_count = Like.objects.filter(feed_id=feed_modal.id).count()
        # 피드의 좋아요 여부
        is_liked = Like.objects.filter(feed_id=feed_modal.id, email=email).exists()
        # 피드의 북마크 여부
        is_marked = Bookmark.objects.filter(feed_id=feed_modal.id, email=email).exists()
        # 정유진: 피드의 공유 유무.
        is_shared_category = ShareCategory.objects.filter(feed_id=feed_modal.id).exists()

        # 이미지 추가
        count = 0
        images_object_list = Image.objects.filter(feed_id=feed_id)
        images_list = []
        for image in images_object_list:
            images_feed = Feed.objects.filter(id=feed_id).first()
            images_list.append(dict(feed_id=images_feed.id, image=image.image, count=count, now_count=count + 1))
            count = count + 1
        # 사용자로 보낼 json 형식의 데이터
        data = {
            'id': feed_modal.id,
            'image': feed_modal.image,
            'images_list': images_list,
            'feed_content': feed_modal.content,
            'hashtag_list': hashtag_list,

            # 데이터를 JSON 형식으로 변환
            'feed_create_at': feed_modal.create_at.strftime('%b %d, %Y, %I:%M %p'),

            'writer_profile_image': feed_modal_writer.profile_image,
            'writer_nickname': feed_modal_writer.nickname,

            'category': feed_modal.category,
            'category_kr': category_kr,

            'reply_list': reply_list,

            'is_liked': is_liked,
            'is_marked': is_marked,
            'like_count': like_count,

            'is_shared_category': is_shared_category
        }

        json_data = json.dumps(data)
        # 응답 repsponse와 동일하지만 약간의 차이가 있음
        return HttpResponse(json_data, content_type='application/json')


# 자동완성 클래스
class Autocomplete(APIView):
    def get(self, request):
        # 서버로 전달된 검색창에 있는 키워드
        search_box_value = request.GET.get('search_box_value', None)
        # 정유진: 세션 유저의 email
        email = request.session.get('email', None)

        # 데이터를 저장할 리스트를 선언
        autocomplete_user_list = []
        autocomplete_hashtag_list = []
        prioritize_list = []

        # 만약 검색창에 # 키워드가 있는 경우
        if '#' in search_box_value:
            # 키워드 앞에 붙은 #제거
            search_box_value = search_box_value.replace("#", "")
            # TODO 우선 해시태그 키워드가 포함된 해시태그 내용만 리스트로 뽑아서 저장(10개만 가져옴) 수정 필요
            hashtag_content_lists = Hashtag.objects.filter(content__contains=search_box_value).distinct().values_list(
                'content', flat=True)

            # 정유진: 해시태그 모음 보기
            hashtag_bundle_count = Hashtag.objects.filter(content__contains=search_box_value).distinct().values_list(
                'feed_id', flat=True).count()
            print(hashtag_bundle_count)

            # 반복문을 통해 특정 해시태그가 달린 게시물 수 와 해시태그를 리스트에 저장
            for hashtag in hashtag_content_lists:
                # 해당 해시태그가 포함된 게시글 수. 같은 게시물에 같은 해시태그는 미포함.
                hashtag_count = Hashtag.objects.filter(content=hashtag).distinct().values_list('feed_id',
                                                                                               flat=True).count()
                autocomplete_hashtag_list.append(dict(content=hashtag,
                                                      hashtag_count=hashtag_count))

            # 해시태그가 달린 게시물 수가 많은 순으로 정렬 람다식 이용
            autocomplete_hashtag_list = sorted(autocomplete_hashtag_list, key=lambda x: x['hashtag_count'],
                                               reverse=True)
            autocomplete_hashtag_list.insert(0, dict(content=search_box_value,
                                                     hashtag_count=hashtag_bundle_count))


        # 만약 유저 검색일 경우
        else:
            # TODO 검색키워드가 닉네임 또는 이름에 포함되는지 객체를 10개만 뽑아냄
            users = User.objects.filter(
                Q(nickname__contains=search_box_value) | Q(name__contains=search_box_value)).exclude(Q(email="acy87@naver.com") | Q(email=email)).order_by('nickname')
            # print(users)
            # users를 그대로 쓰면 이메일만 나온다. 필요한 데이터만 뽑아서 리스트에 저장
            for user in users:
                autocomplete_user_list.append(dict(profile_image=user.profile_image,
                                                   nickname=user.nickname,
                                                   name=user.name))

        # 자동완성에는 해시태그와 유저 둘 다 필요하기 때문에 두 개의 리스트를 더해서 전달 해줌
        prioritize_list = autocomplete_user_list + autocomplete_hashtag_list

        data = {
            'prioritize_list': prioritize_list
        }

        json_data = json.dumps(data)
        return HttpResponse(json_data, content_type='application/json')


# 피드 수정시 이전 정보를 수정창에 불러오는 클래스
class FeedUpdateIMG(APIView):
    def get(self, request):
        # 서버로 전달된 수정될 피드id
        feed_id = int(request.GET.get('feed_id', None))
        # 수정될 피드를 객체로 뽑음
        feed = Feed.objects.filter(id=feed_id).first()
        # 피드 아이디를 통해 피드에 달린 해시태그 내용만 리스트형태로 뽑음
        hashtag_content_lists = list(Hashtag.objects.filter(feed_id=feed_id).values_list('content', flat=True))
        # 공백 제거
        hashtag_content_lists = list(filter(None, hashtag_content_lists))
        # 해시태그를 띄여쓰기로 구분
        hashtag_content = '#' + '#'.join(hashtag_content_lists)

        i = 0
        images_list = []
        images_object_list = Image.objects.filter(feed_id=feed.id)
        for images_object_list in images_object_list:
            images_list.append(images_object_list.image)
            i = i + 1

        # 정유진: 기존 공유카테고리
        shared_category_email = list(ShareCategory.objects.filter(feed_id=feed_id).values_list('email', flat=True))
        shared_category_nickname = list(
            User.objects.filter(email__in=shared_category_email).values_list('nickname', flat=True))

        # 사용자로 보낼 데이터
        data = {
            'id': feed.id,
            'count': i,
            'image[]': images_list,
            'feed_content': feed.content,
            'hashtag_content': hashtag_content,
            'category': feed.category,
            'shared_category': shared_category_nickname
        }

        json_data = json.dumps(data)
        # ajax를 이용해서 html 추가하거나 변경할려면 이런방식을 써야한다.
        return HttpResponse(json_data, content_type='application/json')


# 유재우 : 이미지 삭제
class Removeimg(APIView):
    def post(self, request):
        now_img_count = request.data.get('now_img_count')
        img_content = request.data.get('img_content')
        img = Image.objects.filter(image=img_content)
        img_feed_id = request.data.get('img_feed_id')
        img.delete()
        if now_img_count == "0":
            img_feed = Feed.objects.filter(id=img_feed_id).first()
            img = Image.objects.filter(feed_id=img_feed_id).first()
            img_feed.image = img.image
            img_feed.save()

        return Response(status=200)


# 유재우 : 이미지 추가
class Updateimages(APIView):
    def post(self, request):
        file_length = int(request.data['file_length'])
        feed_id = int(request.data['feed_id'])
        for i in range(file_length):
            file = request.FILES.get('file[' + str(i) + ']')
            # uuid 값 생성
            uuid_name = uuid4().hex
            # 파일을 어디에 저장할 것 인지 경로를 설정 (미디어 루트 + uuid_name)
            save_path = os.path.join(MEDIA_ROOT, uuid_name)
            # media 폴더에 파일이 저장됨
            with open(save_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            # 폼 데이터객체에서 나머지 일반 데이터(글내용, 작성자 이메일)를 꺼냄
            Image.objects.create(image=uuid_name, feed_id=feed_id)

            # 해시태그는 여러개라 반복문으로 테이블 튜플을 생성 ( 해시태그 리스트는 리스트 형태 )

        return Response(status=200)
