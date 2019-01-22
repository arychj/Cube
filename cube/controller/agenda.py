import json

from controller.controller import Controller
from utils.icalagenda import iCalAgenda
from utils.response import Response

class Agenda(Controller):
    def handle(self, path):
        response = None

        if path.startswith("/agenda"):
            if 'agenda' in self._parameters:
                calendars = self._parameters["agenda"]["calendars"]
                ttl = (int(self._parameters["agenda"]["ttl"]) if "ttl" in self._parameters["agenda"] else None)

                agenda = iCalAgenda(calendars, ttl)

                response = Response(
                    code = 200,
                    mimetype = "application/json",
                    content = json.dumps({
                        "events": agenda.get_events(),
                        "updated": str(agenda.get_last_updated())
                    })
                )
            else:
                response = Response(code=500, content="Agenda not configured")

        return response
