from django.contrib import admin

from content.models import Feed, Reply, Image, Hashtag, ShareCategory, Chat

# Register your models here.
class FeedAdmin(admin.ModelAdmin):
    readonly_fields = ('email', 'image', 'category')
class ReplyAdmin(admin.ModelAdmin):
    readonly_fields = ('email', 'feed_id',)

admin.site.register(Reply, ReplyAdmin)
admin.site.register(Feed, FeedAdmin)
