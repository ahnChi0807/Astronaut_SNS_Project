# Generated by Django 3.2.18 on 2023-05-17 01:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0006_auto_20230517_0108'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='username',
            new_name='nickname',
        ),
    ]
