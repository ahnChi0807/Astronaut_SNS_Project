# Generated by Django 3.2.18 on 2023-06-15 23:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0021_chat_is_read'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chat',
            name='is_read',
            field=models.BooleanField(default=True),
        ),
    ]
