# Generated by Django 3.2.18 on 2023-06-13 21:49

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0010_auto_20230611_0230'),
    ]

    operations = [
        migrations.AddField(
            model_name='chat',
            name='create_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]