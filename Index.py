from modules.base.handlers.auth.Base import BaseHandler, DeniedHandler, role
import json, socket, base64, io
import tornado.web

from modules.base.db.core.User import User
from modules.base.db.core.Tenant import Tenant
from modules.base.db.base.Sensor import Sensor
from modules.base.db.base.Comm import Comm

class IndexHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        hostname = socket.gethostname()
        ip = socket.gethostbyname(hostname)
        username = self.get_current_user()
        # tenant = User.objects.get(username=username).tenant
        # sensors = Sensor.objects(tenant=tenant)
        # comms = Comm.objects(tenant=tenant)

        # tenant = User.objects.get(username=username).tenant
        #sensors = Sensor.objects()
        #comms = Comm.objects()

        sensors = []
        comms = []
        url = self.templates_dir+"index.html"
        self.render(url, hostname=hostname, ip=ip, sensors=sensors, comms=comms)
