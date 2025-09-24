---
title: Django RestFramework 自定义显示字段
categories:
  - 开发
tags:
  - Python
  - drf
  - django
abbrlink: lqz1imdm
cover: 'https://s3.babudiu.com/iuxt//images/202401042236989.png'
date: 2024-01-04 18:04:11
---
有的时候序列化出来的字段并不是我们想要的， 比如说返回的用户id，而我们想要返回的是用户名， 这个时候可以用到django rest framework的自定义字段功能。

## 先看一下原始数据

```json
[
    {
        "id": 1,
        "name": "1",
        "desc": "sdg",
        "user": 1
    },
    {
        "id": 5,
        "name": "1",
        "desc": "sdg",
        "user": 2
    }
]
```
这里user显示的是id, 并不是我们想要的username

## 增加一个字段, 显示username

### models:
```python
from django.db import models


# Create your models here.
class Game(models.Model):
    name = models.CharField(verbose_name='游戏名字', max_length=10)
    desc = models.CharField(verbose_name='描述', max_length=20)
    user = models.ForeignKey(to='auth.User', on_delete=models.CASCADE)
```

### serializers:
```python
from rest_framework import serializers
from .models import Game
from django.contrib.auth.models import User


class GameSerializer(serializers.ModelSerializer):

    # 这里使用StringRelatedField来获取系统自带用户的username(依赖于models里面定义个__str__方法), 详情见下图
    user_val = serializers.StringRelatedField(source='user', read_only=True, )

    class Meta:
        model = Game
        fields = '__all__'
        # exclude = ('user',)
        
        # 如果不需要user字段, 下面可以去掉, 上面exclude = ('user',)
        extra_kwargs = {
            "user": {"read_only": True}
        }
```

![image.png](https://s3.babudiu.com/iuxt//images/202401041811348.png)

### views:
```python
class GameList(generics.ListCreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    # 这里重写了perform_create, 保存数据的时候, user使用当前登录的用户.
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
```

### 返回结果:

```json
[
    {
        "id": 1,
        "user_val": "iuxt",
        "name": "1",
        "desc": "sdg",
        "user": 1
    },
    {
        "id": 5,
        "user_val": "test",
        "name": "1",
        "desc": "sdg",
        "user": 2
    }
]
```
## 返回用户的多个字段

### 首先需要自定义一个序列化器

```python
from rest_framework import serializers
from .models import Game
from django.contrib.auth.models import User


# 自定义一个序列化, 使用django 自带的user 模型类
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email'] # 指定序列化的字段


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'
        # exclude = ('user',)

        extra_kwargs = {
            "user": {"read_only": True}
        }

    def to_representation(self, instance):
        representation = super(GameSerializer, self).to_representation(instance)
        # 这里修改user字段, 使用自定义序列化器.
        # representation['user'] = CustomUserSerializer(instance.user, context=self.context).data
        representation['user'] = CustomUserSerializer(instance.user, context=self.context).data.get('username')
        return representation
```

### 这个时候返回结果:

```json
[
    {
        "id": 1,
        "name": "1",
        "desc": "sdg",
        "user": {
            "username": "iuxt",
            "email": "iuxt@qq.com"
        }
    },
    {
        "id": 5,
        "name": "1",
        "desc": "sdg",
        "user": {
            "username": "test",
            "email": "test@qq.com"
        }
    }
```