# Generated by Django 3.2.18 on 2023-06-14 19:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0014_auto_20230614_1857'),
    ]

    operations = [
        migrations.RenameField(
            model_name='alert',
            old_name='alert_receive_user',
            new_name='receive_user',
        ),
        migrations.RenameField(
            model_name='alert',
            old_name='alert_send_user',
            new_name='send_user',
        ),
    ]
