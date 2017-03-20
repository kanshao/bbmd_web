from rest_framework.renderers import BaseRenderer


class TxtRenderer(BaseRenderer):

    media_type = 'text/plain'
    format = 'txt'

    def render(self, txt, accepted_media_type, renderer_context):
        return txt


class DocxRenderer(BaseRenderer):

    media_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    format = '.docx'

    def render(self, docx, accepted_media_type, renderer_context):
        return docx


class XLSXRenderer(BaseRenderer):

    media_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    format = '.xlsx'

    def render(self, xlsx, accepted_media_type, renderer_context):
        return xlsx
