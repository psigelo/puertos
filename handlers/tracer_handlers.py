import io

from tornado.web import RequestHandler

from modules.iot_isafer.utils.dates_utils import  get_users_in_range_dates
from modules.base.handlers.auth.Base import BaseHandler
import socket
import tornado.web

from modules.base.db.core.User import User
from modules.base.db.base.Sensor import Sensor
from modules.base.db.base.Comm import Comm
from modules.iot_isafer.utils.tracer_utils import trace_hour_range, tracer_arc_data_range

    
class TracerHandler(BaseHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']
        super(TracerHandler, self).initialize()

    @tornado.web.authenticated
    def get(self):
        hostname = socket.gethostname()
        ip = socket.gethostbyname(hostname)
        username = self.get_current_user()
        tenant = User.objects.get(username=username).tenant
        sensors = Sensor.objects()
        comms = Comm.objects(tenant=tenant)
        url = self.templates_dir+"tracer.html"
        self.render(url, hostname=hostname, ip=ip, sensors=sensors, comms=comms)


class TraceUsersRangeDays(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, day_start, day_end):
        day_start = day_start.replace("T", "-")
        day_end = day_end.replace("T", "-")

        result = get_users_in_range_dates(self.config["database"]["name"], day_start, day_end)

        if result is None:
            self.write({"Error": 1})
            self.finish()
            return None

        if "rut" not in result.columns:
            result["rut"] = ""

        result = result[["rut", "client_view", "tel"]]
        self.write(result.to_json(orient="records"))
        self.finish()


class TracerArcDataByPhoneRange(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, day, end_day, phone_number, sum_or_not):
        db_name = self.config["database"]["name"]
        sum_results_or_get_list_of_days = (sum_or_not == "sum")
        result = tracer_arc_data_range(db_name, day, end_day, "tel", phone_number, sum_results_or_get_list_of_days)

        if result is None:
            self.write({"Error": 1})
            self.finish()
            return None

        self.write(result.to_json(orient='records'))
        self.finish()


class TracerArcDataRange(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, day, end_day, rut, sum_or_not):
        rut = rut.replace("T", "-")
        db_name = self.config["database"]["name"]
        sum_results_or_get_list_of_days = (sum_or_not == "sum")
        result = tracer_arc_data_range(db_name, day, end_day, "rut", rut, sum_results_or_get_list_of_days)

        if result is None:
            self.write({"Error": 1})
            self.finish()
            return None

        self.write(result.to_json(orient='records'))
        self.finish()


class TraceHourTracerByPhoneRange(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, day, end_day, phone_number):
        db_name = self.config["database"]["name"]

        result = trace_hour_range(db_name, day, end_day, "tel", phone_number)
        if result is None:
            self.write({"Error": 1})
            self.finish()
            return None
        self.write(result.to_json(orient='records'))
        self.finish()


class TraceHourTracerRange(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, day, end_day, rut):
        db_name = self.config["database"]["name"]
        rut = rut.replace("T", "-")
        result = trace_hour_range(db_name, day, end_day, "rut", rut)
        if result is None:
            self.write({"Error": 1})
            self.finish()
            return None
        self.write(result.to_json(orient='records'))
        self.finish()


class TraceHourTracerRange2CSV(RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def get(self, day, end_day, rut):
        db_name = self.config["database"]["name"]
        rut = rut.replace("T", "-")
        result = trace_hour_range(db_name, day, end_day, "rut", rut)
        if result is None:
            self.write({"Error": 1})
            self.finish()
            return None

        self.set_header('Content-Type', 'text/csv')
        self.set_header('content-Disposition', 'attachement; filename=tracer' + str(day) + str(end_day) + rut + '.csv')

        s = io.StringIO()
        result.drop(['color'], axis=1, inplace=True)
        result.to_csv(s, index=False, decimal=',', sep=';', float_format='%.3f')
        data_to_send = s.getvalue()
        self.write(data_to_send)


class TraceHourTracerRange2CSVByPhone(RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def get(self, day, end_day, phone_number):
        db_name = self.config["database"]["name"]
        result = trace_hour_range(db_name, day, end_day, "tel", phone_number)
        if result is None:
            self.write({"Error": 1})
            self.finish()
            return None

        self.set_header('Content-Type', 'text/csv')
        self.set_header('content-Disposition', 'attachement; filename=tracer' + str(day) + str(end_day) +
                        phone_number + '.csv')
        s = io.StringIO()
        result.drop(['color'], axis=1, inplace=True)
        result.to_csv(s, index=False, decimal=',', sep=';', float_format='%.3f')
        data_to_send = s.getvalue()
        self.write(data_to_send)
