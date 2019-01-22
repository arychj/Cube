from mimetypes import MimeTypes

class Response:
    def __init__(self, code = 500, mimetype = "text/plain", content = "unknown error"):
        self.code = code
        self.mimetype = mimetype
        self.content = content
         
    def setResponseCode(self, code):
        self.code = code

    def setMimeType(self, mimetype):
        self.mimetype = mimetype

    def setContent(self, content):
        self.content = content

    def guessMimeType(self, path):
        mime = MimeTypes()
        self.mimetype = mime.guess_type(path)[0]

    def respond(self, request):
        if isinstance(self.content, str):
            self.content = self.content.encode("utf-8")

        request.send_response(self.code)
        request.send_header("Content-type", self.mimetype)
        request.end_headers()

        request.wfile.write(self.content)
