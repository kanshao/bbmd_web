from rest_framework import serializers


def raise_field_validation_error(field, text):
    err = {}
    err[field] = [text]
    raise serializers.ValidationError(err)
