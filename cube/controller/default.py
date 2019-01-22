import datetime, json, re
from collections import OrderedDict

from controller.controller import Controller
from utils.response import Response

class Default(Controller):
    faceCodes = {
        "f": "front",
        "b": "back",
        "l": "left",
        "r": "right",
        "u": "up",
        "d": "down"
    }

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
            faces = None

            match = re.match(r'.*?(\[((?:[fblrud]:[^;:]+;?){1,6})\]).*', path)
            if match != None:
                match = match.groups()

                path = path.replace(match[0], "", 1)
                faces = self.extractFaceOverrides(match[1])

            if path.endswith("/"):
                path = path + "index.html"

            contents = self.getTemplate(path, faces)
            if contents != None:
                response = Response(code=200, content=contents)
                response.guessMimeType(path)

        return response

    def extractFaceOverrides(self, sFaces):
        faces = None

        for code, name in self.faceCodes.items():
            sFaces = sFaces.replace("%s:" % code, "%s:" % name)

        sFaces = re.sub(r'([^{}:,]+)', r'"\1"', sFaces)
        sFaces = "{\"faces\":{%s}}" % sFaces

        faces = json.loads(sFaces, object_pairs_hook=OrderedDict)

        return faces
