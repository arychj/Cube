#!/usr/bin/env python3

# icalevents doesn't have full coverage of the VEVENT component, so use local copy
from .icalevents.icalevents import events as iCalEvents
from datetime import datetime, timedelta
from dateutil.parser import parse as parse_date
from dateutil.tz import tzlocal
import dateutil, datetime, re, requests

_agenda = None
_agendaTtl = None
_agendaLastUpdated = None

class Agenda():
    calendars = {}

    def __init__(self, calendars, ttl=None):
        self.calendars = calendars
        self.agendaTtl = (ttl if ttl is not None else 60 * 60) # default: 1 hour

    def get_last_updated(self):
        global _agendaLastUpdated
        return _agendaLastUpdated

    def get_events(self):
        global _agenda, _agendaLastUpdated

        if (_agenda == None) or (_agendaLastUpdated == None) or ((datetime.datetime.now() - _agendaLastUpdated) > timedelta(seconds=self.agendaTtl)):
            _agenda = []

            for name, urls in self.calendars.items():
                if isinstance(urls, str):
                    urls = [urls]

                for url in urls:
                    events = self.parse_calendar(url)
                    self.set_side(events, name)

                    self.consolidate_events(events)

                    _agenda = _agenda + events

            _agendaLastUpdated = datetime.datetime.now()

        return _agenda

    def parse_calendar(self, url):
        events = []

        if len(url) > 0:
            now = datetime.datetime.now(tzlocal())
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

            sCalendar = requests.get(url).text
            sCalendar = self.sanitize(sCalendar)
            sCalendar = sCalendar.encode() # bug in icaleevents cal as string processing
            
            es = iCalEvents(
                string_content=sCalendar,
                start=start,
                end=end
            )

            for e in es:
                events.append({
                    'uid': str(e.uid),
                    'sequence': str(e.sequence),
                    'start': str(e.start),
                    'end': str(e.end),
                    'title': e.summary,
                    'description': e.description,
                    'location': e.location
                })

        return events

    def sanitize(self, s):
        # bug in dateutils RRULE hoses mixed localization rules, so force them all into localized times
        patternRRULE = re.compile('(RRULE:.*?UNTIL=([\dT]+Z?).*?\n)')
        rrules = patternRRULE.findall(s)
        for rrule, until in rrules:
            dt = parse_date(until)
            if type(dt) is datetime.date:
                dt = datetime.datetime.combine(dt, datetime.time.min)
                
            dt.replace(tzinfo=tzlocal())

            new_rrule = rrule.replace(until, dt.strftime('%Y%m%dT%H%M%SZ'))

            s = s.replace(rrule, new_rrule)

        return s

    def set_side(self, events, side):
        for e in events:
            e['side'] = side

    # consolidates events which are exceptions to a sequences and preservers only the newest version
    def consolidate_events(self, events):
        sequences = {}

        for e in events:
            if e['uid'] not in sequences:
                sequences[e['uid']] = e
            else:
                if e['sequence'] >= sequences[e['uid']]['sequence']:
                    events.remove(sequences[e['uid']])
                    sequences[e['uid']] = e
                else:
                    events.remove(e)

        return e

    def is_tz_naive(self, d):
        return (d.tzinfo is None or d.tzinfo.utcoffset(d) is None)
