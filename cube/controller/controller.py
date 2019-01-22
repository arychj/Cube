import jinja2, os, sys

from utils.tools import Tools

class Controller:
    def __init__(self, assetsPath, templatesPath, parameters):
        directory = os.path.abspath(os.path.dirname(sys.modules['__main__'].__file__))

        self._assetsDirectory = os.path.normpath(os.path.join(directory, assetsPath))
        self._templatesDirectory = os.path.normpath(os.path.join(directory, templatesPath))
        
        self._parameters = parameters

    def getAsset(self, asset):
        content = None

        path = os.path.join(self._assetsDirectory, asset)
        path = os.path.normpath(path)
        
        if path.startswith(self._assetsDirectory):
            if os.path.exists(path):
                with open(path, "rb") as file:
                    content = file.read()

        return content

    def getTemplate(self, template, overrides=None):
        parameters = self._parameters.copy()
        if overrides != None:
            Tools.mergeDict(parameters, overrides)

        try:
            jinja = jinja2.Environment(loader=jinja2.FileSystemLoader(self._templatesDirectory), trim_blocks=True)
            contents = jinja.get_template(template).render(parameters)

            return contents
        except jinja2.exceptions.TemplateNotFound:
            return None

    def handle(self, path):
        return None
