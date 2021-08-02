# BASE APP BLE
import base64
import uuid
from os.path import (join, dirname)
import tornado.web

from tornado.web import (RequestHandler)
from tornado.web import RequestHandler, Application

from modules.base.handlers.api.base import CommsAPI
from modules.base.handlers.api.base import SensorsAPI
from modules.base.handlers.api.base import TagsAPI
from modules.base.handlers.api.core import TenantsAPI
from modules.base.handlers.api.core import UsersAPI
from modules.base.handlers.auth.Base import BaseHandler, DeniedHandler
# BASE APP LIBS PLATFORM
from modules.base.handlers.auth.Session import AuthLoginHandler, AuthLogoutHandler
from modules.base.handlers.web.base import Comms
# base imports
from modules.base.handlers.web.base import Sensors
from modules.base.handlers.web.base import Tags
from modules.base.handlers.web.core import Tenants
# core imports
from modules.base.handlers.web.core import Users
from modules.base.ui.cards import (card_d1, card_d1pb)
from modules.base.ui.datatable import (datatable)
from modules.base.ui.footers import (version)
from modules.base.ui.modals import (modal, modal_del)
from modules.base.ui.sidebarnav import sidebarnav
# BASE APP UI elements
from modules.base.ui.topbarnav import topbarnav
# APP Handlers here
from modules.iot_isafer.handlers.handlers import DeveloperHandler, ArcData, NetPlotData, \
    UploadersData, MostCentralUsers, DayContactsData, \
    IndexHandler, \
    LocationHandler, addAppUserHandler, \
    modifyAppUserHandler, AllUserGetter, AddUserCellphone, ModifyUserCellphone, DayContactsRiskData
from modules.iot_isafer.handlers.location_handlers import LocationCloseContacts, UsersPerLocation
from modules.iot_isafer.handlers.tracer_handlers import TracerHandler, TracerArcDataRange, \
    TracerArcDataByPhoneRange, TraceHourTracerRange, TraceHourTracerByPhoneRange, TraceUsersRangeDays, \
    TraceHourTracerRange2CSVByPhone, TraceHourTracerRange2CSV


# data base imports


class MainHandler(RequestHandler):
    def get(self):
        self.redirect('/auth/login')


class StaticFileHandler(BaseHandler):
    def get(self):
        path = self.request.path
        print("PATH:", path)
        self.redirect(BASE_URI + path)


class Application(Application):
    def __init__(self, config):
        self.config = config.data
        handlers = [
            (r"/", MainHandler),
            (r'/base/static/(.*)', tornado.web.StaticFileHandler,
             {'path': join(dirname(__file__), "..", self.config["app"]["base_name"], "static")}),
            (r"/auth/login", AuthLoginHandler),
            (r"/auth/logout", AuthLogoutHandler),
            (r"/denied", DeniedHandler),

            # Administration API
            (r"/users", Users.UsersWebHandler),
            (r"/users/get", UsersAPI.GetUsers),
            (r"/users/add", UsersAPI.AddUser),
            (r"/users/edit", UsersAPI.EditUser),
            (r"/users/delete", UsersAPI.DeleteUser),
            (r"/tenants", Tenants.TenantsWebHandler),
            (r"/tenants/get", TenantsAPI.GetTenants),
            (r"/tenants/add", TenantsAPI.AddTenant),
            (r"/tenants/edit", TenantsAPI.EditTenant),
            (r"/tenants/delete", TenantsAPI.DeleteTenant),

            # Base API
            # sensors
            (r"/sensors", Sensors.SensorsWebHandler),
            (r"/sensors/status", Sensors.SensorsStatusHandler),
            (r"/sensors/get", SensorsAPI.GetSensors),
            (r"/sensors/status/get", SensorsAPI.GetSensorStatus),
            (r"/sensors/getNumSensors", SensorsAPI.GetNumSensors),
            (r"/sensors/edit", SensorsAPI.EditSensor),
            (r"/sensors/delete", SensorsAPI.DeleteSensor),
            (r"/sensors/add", SensorsAPI.AddSensor),
            (r"/users/profile", Users.ProfileWebHandler),
            (r"/users/profile/edit/email", UsersAPI.UpdateEmail),
            (r"/users/profile/edit/password", UsersAPI.UpdatePassword),

            # comms (beamers)
            (r"/comms", Comms.CommsWebHandler),
            (r"/comms/getNumComms", CommsAPI.GetNumComms),
            (r"/comms/delete", CommsAPI.DeleteComm),
            (r"/comms/add", CommsAPI.AddComm),
            (r"/comms/edit", CommsAPI.EditComm),
            (r"/comms/get", CommsAPI.GetComms),

            # tags
            (r"/tags", Tags.TagsWebHandler),
            (r"/tags/delete", TagsAPI.DeleteTag),
            (r"/tags/add", TagsAPI.AddTag),
            (r"/tags/edit", TagsAPI.EditTag),
            (r"/tags/get", TagsAPI.GetTags),

            # YOUR APP ENDPOINTS HERE
            # Application
            (r"/index", IndexHandler, {"configs": self.config}),
            (r"/developer", DeveloperHandler, {"configs": self.config}),
            (r"/tracer", TracerHandler, {"configs": self.config}),
            (r"/location", LocationHandler, {"configs": self.config}),
            (r"/add_app_user", addAppUserHandler, {"configs": self.config}),
            (r"/modify_app_user", modifyAppUserHandler, {"configs": self.config}),
            (r"/arc_data/(\w{1,30})/(\w{1,30})/(\w{1,30})", ArcData, {"configs": self.config}),
            (r"/most_central_users/(\w{1,30})", MostCentralUsers, {"configs": self.config}),
            (r"/net_plot/(\w{1,30})/(\w{1,30})", NetPlotData, {"configs": self.config}),
            (r"/upload_stats", UploadersData, {"configs": self.config}),
            (r"/day_contacts", DayContactsData, {"configs": self.config}),
            (r"/day_contacts_risk", DayContactsRiskData, {"configs": self.config}),

            # TRACER ENDPOINTS
            (r"/tracer/arc_data/(\w{1,30})/(\w{1,30})/(\w{1,30})/(\w{1,30})", TracerArcDataRange, {"configs": self.config}),
            (r"/tracer/arc_data_by_phone/(\w{1,30})/(\w{1,30})/(\w{1,30})/(\w{1,30})", TracerArcDataByPhoneRange,
             {"configs": self.config}),
            (r"/tracer/trace_hourly/(\w{1,30})/(\w{1,30})/(\w{1,30})", TraceHourTracerRange, {"configs": self.config}),
            (r"/tracer/trace_hourly_by_phone/(\w{1,30})/(\w{1,30})/(\w{1,30})", TraceHourTracerByPhoneRange,
             {"configs": self.config}),
            (r"/tracer/hourly_csv/(\w{1,30})/(\w{1,30})/(\w{1,30})", TraceHourTracerRange2CSV,
             {"configs": self.config}),
            (r"/tracer/hourly_csv_by_phone/(\w{1,30})/(\w{1,30})/(\w{1,30})", TraceHourTracerRange2CSVByPhone,
             {"configs": self.config}),
            (r"/get_all_users_by_type/(\w{1,30})", AllUserGetter, {"configs": self.config}),  # Deprecated
            (r"/tracer/get_users/(\w{1,30})/(\w{1,30})", TraceUsersRangeDays, {"configs": self.config}),

            # LOCATION
            (r"/location/close_contacts/(\w{1,30})/(\w{1,30})", LocationCloseContacts, {"configs": self.config}),
            (r"/location/users_per_location/(\w{1,30})/(\w{1,30})", UsersPerLocation, {"configs": self.config}),

            # FIREBASE USER HANDLERS
            (r"/add_user_cellphone/(\w{1,30})/(\w{1,30})/(\w{1,30})/(\w{1,30})/"
             r"(\w{1,30})/(\w{1,30})/(\w{1,30})/(\w{1,30})",
             AddUserCellphone, {"configs": self.config}),
            (r"/modify_user_cellphone/(\w{1,30})/(\w{1,30})/(\w{1,30})/(\w{1,30})/"
             r"(\w{1,30})/(\w{1,30})/(\w{1,30})/(\w{1,30})/(\w{1,30})",
             ModifyUserCellphone, {"configs": self.config}),

        ]

        settings = dict(
            template_path=join(dirname(__file__), "templates"),
            static_path=join(dirname(__file__), "static"),
            xsrf_cookies=False,
            cookie_secret=base64.b64encode(uuid.uuid4().bytes + uuid.uuid4().bytes),
            debug=True,
            ui_modules=[topbarnav, sidebarnav, card_d1, card_d1pb, modal, modal_del, datatable, version],
            login_url="/auth/login"
        )
        super(Application, self).__init__(handlers, **settings)
