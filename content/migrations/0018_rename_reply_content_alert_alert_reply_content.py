# Generated by Django 3.2.18 on 2023-06-15 00:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0017_alert_reply_content'),
    ]

    operations = [
        migrations.RenameField(
            model_name='alert',
            old_name='reply_content',
            new_name='alert_reply_content',
        ),
    ]
