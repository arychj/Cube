#!/usr/bin/env python3

import argparse, http.server, inspect, json, os
from collections import OrderedDict
from importlib import import_module
from socketserver import ThreadingMixIn

from controller.controller import Controller
from utils.response import Response


class CubeServer():
    def start(self):
        self._httpd = self._threading_server(("", args.port), self._server_request_handler)
        self._httpd.serve_forever()

    def _injector_stop(self):
        self._httpd.shutdown()

    class _threading_server(ThreadingMixIn, http.server.HTTPServer):
        pass

    class _server_request_handler(http.server.BaseHTTPRequestHandler):
        _parameters = None
        _controllers = None

        def get_parameters(self):
            if self._parameters == None:
                path = os.path.join(os.path.dirname(__file__), args.parameters)
                if os.path.exists(path):
                    self._parameters = json.load(open(path), object_pairs_hook=OrderedDict)
                else:
                    self._parameters = {}

            return self._parameters

        def get_controllers(self):
            if self._controllers == None:
                parameters = self.get_parameters()

                self._controllers = []
                for name in parameters["controllers"]:
                    module = import_module("controller." + name)
                    class_ = getattr(module, name.capitalize())
                    controller = class_(args.assets, args.templates, parameters)
                    self._controllers.append(controller)

            return self._controllers


        def do_GET(self):
            response = Response(code=404, content="not found")

            try:
                for controller in self.get_controllers():
                    response = controller.handle(self.path)

                    if response != None:
                        break
            except Exception as e:
                response = Response(code=500, content=str(e))

            response.respond(self)

parser = argparse.ArgumentParser()
parser.add_argument("--port", dest="port", type=int, default="4096", help="Port to serve on")
parser.add_argument("--templates", dest="templates", default="./web/templates", help="The directory containing templates")
parser.add_argument("--assets", dest="assets", default="./web/assets", help="The directory containing web assets")
parser.add_argument("--parameters", dest="parameters", default="parameters.json", help="The parameters file")
args = parser.parse_args()

server = CubeServer()
server.start()
