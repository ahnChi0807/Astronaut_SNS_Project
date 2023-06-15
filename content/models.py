from django.db import models

# 피드 테이블
class Feed(models.Model):
    content = models.TextField()                            # 글내용
    image = models.TextField()                              # 피드에 업로드되는 이미지
    email = models.EmailField(default='')                   # 이메일
    create_at = models.DateTimeField(auto_now_add=True)     # 작성일자
    category = models.CharField(max_length=20, default='')  # 카테고리 이름

# 좋아요 테이블
class Like(models.Model):
    feed_id = models.IntegerField(default=0)                # Feed id
    email = models.EmailField(default='')                   # 이메일


# 댓글 테이블
class Reply(models.Model):
    feed_id = models.IntegerField(default=0)                # Feed id
    email = models.EmailField(default='')                   # 이메일
    reply_content = models.TextField()                      # 댓글 내용


# 북마크 테이블
class Bookmark(models.Model):
    feed_id = models.IntegerField(default=0)                # Feed id
    email = models.EmailField(default='')                   # 이메일


# 팔로우 테이블
class Follow(models.Model):
    follower = models.EmailField(default='')                 # 팔로우 하는 유저 이메일
    following = models.EmailField(default='')                # 팔로우 당하는 유저 이메일


# 해시태그 테이블
class Hashtag(models.Model):
    feed_id = models.IntegerField(default=0)                   # Feed id
    content = models.TextField()                               # 해시태그 내용


# 채팅 테이블
class Chat(models.Model):
    send_user = models.EmailField(default='')                   # 채팅 보낸 유저
    receive_user = models.EmailField(default='')                # 채팅을 받은 유저
    chat_content = models.TextField()                           # 채팅 내용
    send_time = models.DateTimeField(auto_now_add=True)         # 채팅 시간


# 알림 테이블
class Alert(models.Model):
    feed_id = models.IntegerField(default=0)                    # Feed id
    send_user = models.EmailField(default='')                   # 알림을 보낼 유저
    receive_user = models.EmailField(default='')                # 알림을 받을 유저
    alert_content = models.TextField()                           # 알림 내용
    alert_time = models.DateTimeField(auto_now_add=True)         # 알림 시간
    reply_content = models.TextField(default='')
