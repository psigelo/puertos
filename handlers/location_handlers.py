import json

import tornado.web
from pymongo import MongoClient
import pandas as pd

from modules.iot_isafer.utils.dates_utils import get_users_in_range_dates, get_dates_as_firestore_collection


class LocationCloseContacts(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, day, end_day):
        day_start = day.replace("T", "-")
        day_end = end_day.replace("T", "-")
        days = get_dates_as_firestore_collection(day_start, day_end, return_as_string=True)

        client = MongoClient()
        db_name = self.config["database"]["name"]
        db_mongo = client[db_name]
        table_connections = db_mongo['connections_and_ts']
        table_users_registered = db_mongo['all_users']
        df_users = pd.DataFrame(list(table_users_registered.find())[0]['all_users'])
        all_data = None
        filter_contacts = df_users.loc[df_users["tipo_sensor"].isin(["sensor_posicion", "sensor_movimiento"])]

        for day in days:
            try:
                day_table = pd.DataFrame(list(table_connections.find({"day": day}))[0]['connections_and_ts'])
            except IndexError:
                continue

            pass_filter = (day_table.target.isin(filter_contacts.sid) | day_table.source.isin(filter_contacts.sid))
            day_table = day_table[pass_filter]
            if all_data is None:
                all_data = day_table
            else:
                all_data = pd.concat([all_data, day_table])

        if all_data is None:
            self.write({"Error": 1})
            self.finish()
            return None

        all_data = all_data.groupby(by=["source", "target"]).sum().reset_index()
        result = dict()
        for row, data in all_data.iterrows():
            if data.source in filter_contacts.sid.values:
                if result.get(data.source) is None:
                    result[data.source] = data["count"]
                else:
                    result[data.source] += data["count"]
            if data.target in filter_contacts.sid.values:
                if result.get(data.target) is None:
                    result[data.target] = data["count"]
                else:
                    result[data.target] += data["count"]

        result_reformat = pd.DataFrame([{"location": filter_contacts.loc[filter_contacts.sid == i[0], "client_view"].iloc[0],
                            "area": filter_contacts.loc[filter_contacts.sid == i[0], "area"].iloc[0],
                            "counts": i[1]} for i in result.items()])

        hierarchy_result = list()
        try:
            for area, df in result_reformat.groupby("area"):
                df.rename(columns={'location': 'name', 'counts': 'value'}, inplace=True)
                hierarchy_result.append({"name": area, "children": df[["name", "value"]].to_dict("records")})
        except KeyError:
            self.write({"Error": 1})
            self.finish()
            return None

        self.write(json.dumps(hierarchy_result))
        self.finish()


class UsersPerLocation(tornado.web.RequestHandler):
    def initialize(self, *args, **kwargs):
        self.config = kwargs['configs']

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self, day, end_day):
        day_start = day.replace("T", "-")
        day_end = end_day.replace("T", "-")
        days = get_dates_as_firestore_collection(day_start, day_end, return_as_string=True)

        client = MongoClient()
        db_name = self.config["database"]["name"]
        db_mongo = client[db_name]
        table_connections = db_mongo['connections_and_ts']
        table_users_registered = db_mongo['all_users']
        df_users = pd.DataFrame(list(table_users_registered.find())[0]['all_users'])
        all_data = None
        filter_contacts = df_users.loc[df_users["tipo_sensor"].isin(["sensor_posicion", "sensor_movimiento"])]

        for day in days:
            try:
                day_table = pd.DataFrame(list(table_connections.find({"day": day}))[0]['connections_and_ts'])
            except IndexError:
                continue

            pass_filter = (day_table.target.isin(filter_contacts.sid) | day_table.source.isin(filter_contacts.sid))
            day_table = day_table[pass_filter]
            if all_data is None:
                all_data = day_table
            else:
                all_data = pd.concat([all_data, day_table])

        if all_data is None:
            self.write({"Error": 1})
            self.finish()
            return None

        all_data = all_data.groupby(by=["source", "target"]).sum().reset_index()
        result = dict()
        for row, data in all_data.iterrows():
            if data.source in filter_contacts.sid.values:
                if result.get(data.source) is None:
                    result[data.source] = [data.target]
                else:
                    if data.target not in result[data.source]:
                        result[data.source].append(data.target)
            if data.target in filter_contacts.sid.values:
                if result.get(data.target) is None:
                    result[data.target] = [data.source]
                else:
                    if data.source not in result[data.target]:
                        result[data.target].append(data.source)

        result = [{"location": filter_contacts.loc[filter_contacts.sid == i[0], "client_view"].iloc[0],
                   "users": len(i[1])} for i in result.items()]
        self.write(json.dumps(result))
        self.finish()