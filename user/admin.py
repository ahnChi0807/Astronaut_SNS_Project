from django.contrib import admin
from .models import User
# Register your models here.

from django.contrib import admin
from .models import User

class UserAdmin(admin.ModelAdmin):
    readonly_fields = ('email', 'password', 'profile_image')

admin.site.register(User, UserAdmin)

