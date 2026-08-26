from rest_framework import serializers


class AssistantChatSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=2000)
    context = serializers.DictField(required=False, default=dict)
    history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
    )