#!/usr/bin/env python3

import argparse, http.server, json, os, jinja2 
from mimetypes import MimeTypes
from socketserver import ThreadingMixIn

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
        _web_directory = None

        def get_parameters(self):
            if self._parameters == None:
                path = os.path.join(os.path.dirname(__file__), args.parameters)
                if os.path.exists(path):
                    self._parameters = json.load(open(path))
                else:
                    self._parameters = {}

            return self._parameters

        def get_assets_directory(self):
            if self._web_directory == None:
                directory = os.path.abspath(os.path.dirname(__file__))
                self._assets_directory = os.path.normpath(os.path.join(directory, args.assets))

            return self._assets_directory

        def get_template(self, template):
            try:
                templates = os.path.normpath(os.path.join(os.path.dirname(__file__), args.templates))
                jinja = jinja2.Environment(loader=jinja2.FileSystemLoader(templates), trim_blocks=True)
                contents = jinja.get_template(template).render(self.get_parameters())

                return contents
            except jinja2.exceptions.TemplateNotFound:
                return None

        def do_GET(self):
            response = 500
            mimetype = "text/plain"
            contents = "unknown error"

            mime = MimeTypes()
            
            if self.path.startswith("/assets"):
                assets = self.get_assets_directory()
                
                path = self.path.replace("..", "").replace("/assets", "", 1).strip("/")
                path = os.path.join(assets, path)
                path = os.path.normpath(path)

                if path.startswith(assets):
                    print(path)
                    if os.path.exists(path):
                        with open(path, "rb") as file:
                            contents = file.read()

                        response = 200
                        mimetype = mime.guess_type(path)[0]
                    else:
                        response = 404
                        contents = "not found"
                else:
                    response = 404
                    contents = "shennaigans"
            else:
                if self.path.endswith("/"):
                    path = self.path + "index.html"
                else:
                    path = self.path

                contents = self.get_template(path)
                if contents == None:
                    response = 404
                    contents = "template not found"
                else:
                    response = 200
                    mimetype = mime.guess_type(path)[0]


            if isinstance(contents, str):
                contents = contents.encode("utf-8")

            self.send_response(response)
            self.send_header("Content-type", mimetype)
            self.end_headers()

            self.wfile.write(contents)

parser = argparse.ArgumentParser()
parser.add_argument("--port", dest="port", type=int, default="4096", help="Port to serve on")
parser.add_argument("--templates", dest="templates", default="./web/templates", help="The directory containing templates")
parser.add_argument("--assets", dest="assets", default="./web/assets", help="The directory containing web assets")
parser.add_argument("--parameters", dest="parameters", default="parameters.json", help="The parameters file")
args = parser.parse_args()

server = CubeServer()
server.start()
