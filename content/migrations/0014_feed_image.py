# Generated by Django 3.2.18 on 2023-06-15 02:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0013_merge_20230614_1456'),
    ]

    operations = [
        migrations.AddField(
            model_name='feed',
            name='image',
            field=models.TextField(default=1),
            preserve_default=False,
        ),
    ]
