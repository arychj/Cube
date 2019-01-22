import datetime

from controller.controller import Controller
from utils.response import Response

class Default(Controller):
    def handle(self, path):
        response = None

        if path.startswith("/assets"):
            path = path.replace("..", "").replace("/assets", "", 1).strip("/")

            asset = self.getAsset(path)
            if asset != None:
                response = Response(code=200, content=asset)
                response.guessMimeType(path)
        elif path.startswith("/datetime"):
            response = Response(code=200, content=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        else:
            if path.endswith("/"):
                path = path + "index.html"

            contents = self.getTemplate(path)
            if contents != None:
                response = Response(code=200, content=contents)
                response.guessMimeType(path)

        return response
