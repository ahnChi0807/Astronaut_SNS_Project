from django.db import models
from django.utils.timezone import now


# class TimesModel(models.Model):
#     create_at = models.DateTimeField(auto_now_add=True)     # 작성시간
#
#     class Meta:
#         abstract = True


# 피드 테이블
class Feed(models.Model):
    content = models.TextField()                            # 글내용
    image = models.TextField()                              # 피드에 업로드되는 이미지
    email = models.EmailField(default='')                   # 이메일
    create_at = models.DateTimeField(auto_now_add=True)

# 좋아요 테이블
class Like(models.Model):
    feed_id = models.IntegerField(default=0)                # Feed id
    email = models.EmailField(default='')                   # 이메일
    is_like = models.BooleanField(default=True)             # 좋아요 여부


# 댓글 테이블
class Reply(models.Model):
    feed_id = models.IntegerField(default=0)                # Feed id
    email = models.EmailField(default='')                   # 이메일
    reply_content = models.TextField()                      # 댓글 내용


# 북마크 테이블
class Bookmark(models.Model):
    feed_id = models.IntegerField(default=0)                # Feed id
    email = models.EmailField(default='')                   # 이메일
    is_marked = models.BooleanField(default=True)           # 북마크 여부
