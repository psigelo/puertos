import json
import socket

import networkx as nx
import numpy as np
import pandas as pd
import requests
import tornado.web
from pymongo import MongoClient
from tornado.web import RequestHandler

from modules.base.db.base.Comm import Comm
from modules.base.db.base.Sensor import Sensor
from modules.base.db.core.User import User
from modules.base.handlers.auth.Base import BaseHandler
from modules.iot_isafer.utils.tracer_utils import arc_data


class IndexHandler(BaseHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']
        super(IndexHandler, self).initialize()

    @tornado.web.authenticated
    def get(self):
        hostname = socket.gethostname()
        ip = socket.gethostbyname(hostname)
        username = self.get_current_user()
        tenant = User.objects.get(username=username).tenant
        sensors = Sensor.objects()
        comms = Comm.objects(tenant=tenant)
        url = self.templates_dir+"index.html"
        self.render(url, hostname=hostname, ip=ip, sensors=sensors, comms=comms)


class LocationHandler(BaseHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']
        super(LocationHandler, self).initialize()

    @tornado.web.authenticated
    def get(self):
        hostname = socket.gethostname()
        ip = socket.gethostbyname(hostname)
        username = self.get_current_user()
        tenant = User.objects.get(username=username).tenant
        sensors = Sensor.objects()
        comms = Comm.objects(tenant=tenant)
        url = self.templates_dir+"location.html"
        self.render(url, hostname=hostname, ip=ip, sensors=sensors, comms=comms)


class addAppUserHandler(BaseHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']
        super(addAppUserHandler, self).initialize()

    @tornado.web.authenticated
    def get(self):
        hostname = socket.gethostname()
        ip = socket.gethostbyname(hostname)
        username = self.get_current_user()
        tenant = User.objects.get(username=username).tenant
        sensors = Sensor.objects()
        comms = Comm.objects(tenant=tenant)
        url = self.templates_dir + "add_app_user.html"
        self.render(url, hostname=hostname, ip=ip, sensors=sensors, comms=comms)


class modifyAppUserHandler(BaseHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']
        super(modifyAppUserHandler, self).initialize()

    @tornado.web.authenticated
    def get(self):
        hostname = socket.gethostname()
        ip = socket.gethostbyname(hostname)
        username = self.get_current_user()
        tenant = User.objects.get(username=username).tenant
        sensors = Sensor.objects()
        comms = Comm.objects(tenant=tenant)
        url = self.templates_dir + "modify_app_user.html"
        self.render(url, hostname=hostname, ip=ip, sensors=sensors, comms=comms)


class MainHandler(BaseHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    @tornado.web.authenticated
    def get(self):
        self.render("../templates/index.html")


class DeveloperHandler(BaseHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']
        super(DeveloperHandler, self).initialize()

    @tornado.web.authenticated
    def get(self):
        client = MongoClient()
        db_mongo = client[self.config["database"]["name"]]
        table_users_registered = db_mongo['all_users']
        data = list(table_users_registered.find())[0]
        users_df = pd.DataFrame(list(table_users_registered.find())[0]['all_users'])
        last_update = data["ts"].strftime("%d/%m/%Y %H:%M:%S")

        total_contacts_registered = db_mongo['total_contacts']

        # TODO: OBTENER ESTO EN UPDATE MONGODB
        # ====================================
        pipe = [
            {
                '$group': {
                    '_id': {},
                    'suma': {
                        '$sum': '$total_contacts'
                    }
                }
            }
        ]
        total_contacts_registered.aggregate(pipe)
        total_contactos = list(total_contacts_registered.aggregate(pipe))[0]["suma"]


        table_connections = db_mongo["connections_and_ts"]
        pipe_2 = [
            {
                '$unwind': {
                    'path': '$connections_and_ts',
                    'includeArrayIndex': 'string',
                    'preserveNullAndEmptyArrays': True
                }
            }, {
                '$project': {
                    'conncts': '$connections_and_ts.count'
                }
            }, {
                '$match': {
                    'conncts': {
                        '$gt': 4
                    }
                }
            }, {
                '$group': {
                    '_id': {},
                    'suma': {
                        '$sum': 1
                    }
                }
            }
        ]
        total_contactos_riesgosos = list(table_connections.aggregate(pipe_2))[0]["suma"]
        # ====================================

        phone_users = users_df.loc[users_df.tipo_sensor == "celular"]
        total_celulares = len(phone_users.index)
        registrados_celulares = len(phone_users.sid.dropna().index)
        total_sensores = len(users_df.loc[users_df.tipo_sensor != "celular"].index)
        self.render("../templates/developer.html", total_celulares=total_celulares,
                    registrados_celulares=registrados_celulares, last_update=last_update,
                    total_sensores=total_sensores, total_contactos=total_contactos,
                    total_contactos_riesgosos=total_contactos_riesgosos)


class ArcData(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, day, end_day, sum_or_not):
        db_name = self.config["database"]["name"]
        sum_results_or_get_list_of_days = (sum_or_not == "sum")
        result = arc_data(db_name, day, end_day, sum_results_or_get_list_of_days)

        if result is None:
            self.write({"Error": 1})
            self.finish()
            return None

        self.write(result.to_json(orient='records'))
        self.finish()


def to_undirected_graph(network_graph):
    g = nx.Graph()
    g.add_edges_from(network_graph.edges(), weight=0)

    for u, v, d in network_graph.edges(data=True):
        # TODO: why value in d and weight in g??, its all right?
        g[u][v]['weight'] += d['value']
    return g


def get_network_plot_data(network_graph):
    result = list()
    set_of_sources = set()
    set_of_targets = set()
    for name, connections in pd.DataFrame(list(network_graph.edges())).groupby(0):
        link_with = []
        for target in list(connections.iloc[:, 1].values):
            target_name = target
            link_with.append(target_name)
        client_name = name
        result.append({'name': client_name, 'linkWith': link_with})
        # we need to know who target is never a source to add at tail without links, is for amchart needs
        set_of_targets = set_of_targets.union(set(link_with))
        set_of_sources = set_of_sources.union([client_name])

    for client_name in set_of_targets.difference(set_of_sources):
        result.append({'name': client_name})
    return result


class NetPlotData(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, day_start, day_end):
        day_start = day_start.replace("T", "-")
        day_end = day_end.replace("T", "-")
        db_name = self.config["database"]["name"]
        arc_df = arc_data(db_name, day_start, day_end)

        if arc_df is None:
            self.write({"Error": 1})
            self.finish()
            return None

        network_graph = nx.from_pandas_edgelist(arc_df, 'from', 'to', 'value', create_using=nx.MultiDiGraph())
        network_graph = to_undirected_graph(network_graph)
        net_plot_data = get_network_plot_data(network_graph)

        self.write(json.dumps(net_plot_data))
        self.flush()
        self.finish()


class UploadersData(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        client = MongoClient()
        db_mongo = client[self.config["database"]["name"]]
        table_uploaders = db_mongo['upload_stats']
        upload_stats = pd.DataFrame(table_uploaders.find().sort("_id", -1).limit(100))
        result = pd.DataFrame()
        for row, df in upload_stats.iterrows():
            counts_by_type = np.unique(pd.DataFrame(df['uploaders']).tipo_sensor.values,
                                       return_counts=True)
            counts_by_type_dict = {counts_by_type[0][it]: counts_by_type[1][it] for it in range(len(counts_by_type[0]))}
            counts_by_type_dict.update({"day": df["day"]})
            result = result.append(counts_by_type_dict, ignore_index=True)
        result.fillna(0, inplace=True)
        result.sort_values(by="day", inplace=True)
        result.set_index("day", inplace=True)
        self.write(json.dumps(result.reset_index().to_dict("records")))
        self.finish()


class DayContactsData(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        client = MongoClient()
        db_mongo = client[self.config["database"]["name"]]
        table_day_contacts = db_mongo['total_contacts']
        day_contacts = pd.DataFrame(table_day_contacts.find().sort("_id", -1).limit(100))
        day_contacts.columns = ["_id", "date", "value", "ts"]
        day_contacts.value = day_contacts.value.apply(lambda x: int(x))
        result = day_contacts[["date", "value"]].sort_values('date').to_json(orient="records")
        self.write(result)
        self.finish()


class DayContactsRiskData(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        client = MongoClient()
        db_mongo = client[self.config["database"]["name"]]
        table_day_contacts = db_mongo['connections_and_ts']

        pipe = [
            {
                '$unwind': {
                    'path': '$connections_and_ts',
                    'includeArrayIndex': 'string',
                    'preserveNullAndEmptyArrays': True
                }
            }, {
                '$project': {
                    'conncts': '$connections_and_ts.count',
                    'day': 1
                }
            }, {
                '$match': {
                    'conncts': {
                        '$gt': 4
                    }
                }
            }, {
                '$group': {
                    '_id': '$day',
                    'suma': {
                        '$sum': 1
                    }
                }
            }, {
                '$sort': {
                    '_id': 1
                }
            }
        ]

        day_contacts = pd.DataFrame(table_day_contacts.aggregate(pipe))
        day_contacts.columns = ["date", "value"]
        day_contacts.value = day_contacts.value.apply(lambda x: int(x))
        result = day_contacts[["date", "value"]].sort_values('date').to_json(orient="records")

        self.write(result)
        self.finish()


class ModifyUserCellphone(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, nombre, rut, telefono, empresa, marca, equipo, habilitado, estado, firebase_id):
        nombre = nombre[1:].replace("_", " ")
        rut = rut[1:].replace("_", " ").replace("T", "-")
        telefono = telefono[1:].replace("_", " ")
        empresa = empresa[1:].replace("_", " ")
        marca = marca[1:].replace("_", " ")
        equipo = equipo[1:].replace("_", " ")
        estado = estado[1:].replace("_", " ")
        print(nombre, rut, telefono, empresa, marca, equipo, habilitado, estado, firebase_id)
        client = MongoClient()
        db_mongo = client['iot-isafer-anglo']
        table_link_modify_user_cellphone = db_mongo["link_modify_user_cellphone"]
        link = list(table_link_modify_user_cellphone.find())[0]['link_modify_user_cellphone']
        ret = requests.post(link, json={"data": {"nombre": nombre, "rut": rut, "equipo": equipo,
                                                 "estado": estado, "empresa": empresa, "marca": marca,
                                                 "tel": telefono, "habilitado": habilitado, "id": firebase_id}})
        print(ret)
        self.write({"result": "OK"})
        self.finish()


class AddUserCellphone(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, nombre, rut, telefono, empresa, marca, equipo, habilitado, estado):
        nombre = nombre[1:].replace("_", " ")
        rut = rut[1:].replace("_", " ").replace("T", "-")
        telefono = telefono[1:].replace("_", " ")
        empresa = empresa[1:].replace("_", " ")
        marca = marca[1:].replace("_", " ")
        equipo = equipo[1:].replace("_", " ")
        estado = estado[1:].replace("_", " ")

        print(nombre, rut, telefono, empresa, marca, equipo, habilitado, estado)
        client = MongoClient()
        db_mongo = client['iot-isafer-anglo']
        table_link_add_user_cellphone = db_mongo["link_add_user_cellphone"]
        link = list(table_link_add_user_cellphone.find())[0]['link_add_user_cellphone']
        ret = requests.post(link, json={"data": {"nombre": nombre, "rut": rut, "equipo": equipo,
                                                 "estado": estado, "empresa": empresa, "marca": marca,
                                                 "tel": telefono, "habilitado": habilitado}})
        print(ret)
        self.write({"result": "OK"})
        self.finish()


class AllUserGetter(tornado.web.RequestHandler):
    # TODO: revisar casos de uso y si estan correctos, veo posibilidad de fallo aca
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, type):
        client = MongoClient()
        db_mongo = client[self.config["database"]["name"]]
        table_users_registered = db_mongo['all_users']
        try:
            users_df = pd.DataFrame(list(table_users_registered.find())[0]['all_users'])
        except IndexError:
            self.write({"Error": 1})
            self.finish()
            return None
        correct_type_users = users_df.loc[users_df.tipo_sensor == type]
        correct_type_users = correct_type_users[["rut", "nombre", "tel", "empresa",
                                                 "habilitado", "marca", "equipo", "estado", "firestore_id"]]
        correct_type_users = correct_type_users.loc[~((correct_type_users.rut == "") &
                                                      (correct_type_users.nombre == ""))]
        self.write(correct_type_users.to_json(orient="records"))
        self.finish()


class MostCentralUsers(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, day):
        day = day.replace("T", "-")
        client = MongoClient()
        db_mongo = client[self.config["database"]["name"]]
        table_critical_users = db_mongo['critical_users']
        try:
            most_critical_users = pd.DataFrame(list(table_critical_users.find({"day": day}))[0]['most_critical_users'])
        except IndexError:
            self.write({"Error": 1})
            self.finish()
            return None

        result = most_critical_users.to_json(orient='records')

        self.write(result)
        self.finish()
