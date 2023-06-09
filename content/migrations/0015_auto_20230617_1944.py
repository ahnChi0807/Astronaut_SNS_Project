# Generated by Django 3.2.18 on 2023-06-17 19:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0014_feed_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='Alert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('feed_id', models.IntegerField(default=0)),
                ('send_user', models.EmailField(default='', max_length=254)),
                ('receive_user', models.EmailField(default='', max_length=254)),
                ('alert_content', models.TextField()),
                ('alert_time', models.DateTimeField(auto_now_add=True)),
                ('reply_content', models.TextField(default='')),
            ],
        ),
        migrations.CreateModel(
            name='ShareCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('feed_id', models.IntegerField(default=0)),
                ('email', models.EmailField(default='', max_length=254)),
            ],
        ),
        migrations.AddField(
            model_name='chat',
            name='is_read',
            field=models.BooleanField(default=True),
        ),
    ]
