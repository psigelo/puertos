import json, socket, base64, io
import tornado.web
from tornado_http_auth import DigestAuthMixin, BasicAuthMixin, auth_required
from datetime import datetime as dt
from datetime import timedelta as td
from bson.json_util import dumps
import multiprocessing as mp
import redis


from handlers.Base import BaseHandler, DeniedHandler, role
# from handlers.ReportsHandler import TempHourRep, AccHourRep


from modules.base.db.base.Sensor import Sensor
from modules.base.db.data.SensorData import AccelerometerTS, TemperatureTS


class SetSensorDataTS(BasicAuthMixin, BaseHandler):

    def prepare(self):
        self.get_authenticated_user(check_credentials_func=check_pwd,realm='Protected')

    def post(self):
        try:
            js = self.request.body.decode('utf8').replace("'", '"')
            js = json.loads(js)

            if(js):
                for my_json in js:
                    if my_json["type"] == 'Gateway':
                        beamId = Beamer.objects.get(beamerId=my_json["mac"]).beamerId
                        check_redis(self, my_json)

                    elif "rawData" in my_json:
                        if len(my_json["rawData"]) == 52 and my_json["mac"] == "".join(reversed([my_json["rawData"][40:][i:i+2] for i in range(0, len(my_json["rawData"][40:]), 2)])):
                            try:
                                sensor = Sensor.objects(sensorId=my_json["mac"])
                                if sensor:
                                    gts = dt.strptime(my_json['timestamp'], "%Y-%m-%dT%H:%M:%SZ")
                                    current_ts = dt.utcnow()

                                    # get last hour
                                    hour = current_ts.hour

                                    battery = int(my_json["rawData"][26:28], 16)
                                    xaccel = HextoDecimal(my_json["rawData"][28:32])
                                    yaccel = HextoDecimal(my_json["rawData"][32:36])
                                    zaccel = HextoDecimal(my_json["rawData"][36:40])

                                    add_bat_history(self,my_json,battery)
                                    check_redis(self, my_json)
                                    rep = Accelerometer(ts=current_ts, gts=gts, rssi=my_json["rssi"], z=zaccel, x=xaccel, y=yaccel)

                                    #checking sensordataTS
                                    #test
                                    # AccHourRep.CreateHourRep(current_ts,my_json["mac"])
                                    lastReport = SensorDataTS.objects(sensorId=my_json["mac"], beamerId=beamId).order_by("-id").limit(1).fields(slice__data=-1)
                                    if lastReport and lastReport[0].createdAt.hour == current_ts.hour and lastReport[0].createdAt.date() == current_ts.date():
                                        if({zaccel, xaccel, yaccel} != {lastReport[0].data[0].z, lastReport[0].data[0].x, lastReport[0].data[0].y}):
                                            lastReport[0].update(updatedAt=current_ts, push__data=rep)
                                        else:
                                            pass
                                    else:
                                        #begin multiproc
                                        proc = mp.Process(target=AccHourRep.CreateHourRep, args=(current_ts,my_json["mac"],))
                                        proc.start()
                                        SensorDataTS(sensorId=my_json["mac"], beamerId=beamId, createdAt=current_ts, updatedAt=current_ts, data=[rep]).save()

                            except Exception as e:
                                print("acc",e)
                                self.set_status(400)
                        elif len(my_json["rawData"]) == 50 and int(my_json["rawData"][14:16]) == 11:
                            try:
                                sensor = Sensor.objects(sensorId=my_json["mac"])
                                if sensor:
                                    volt = int(my_json["rawData"][26:30], 16)
                                    temp = HextoDecimal(my_json["rawData"][30:34])
                                    if(temp>0):
                                        adv = int(my_json["rawData"][34:42], 16)
                                        secs = int(my_json["rawData"][42:50], 16)
                                        current_ts = dt.utcnow()

                                        sensor[0].update(voltage=volt, temperature=temp, adv_count=adv, secs_count=secs, rssi=my_json["rssi"], updatedAt=current_ts)

                                        gts = dt.strptime(my_json['timestamp'], "%Y-%m-%dT%H:%M:%SZ")
                                        rep = Temperature(val=temp,ts=dt.utcnow(), gts=gts, rssi=my_json["rssi"])
                                        lastReport = TemperatureTS.objects(sensorId=my_json["mac"],beamerId=beamId).order_by("-id").limit(1).fields(slice__data=-1)
                                        #begin multiproc
                                        if lastReport and lastReport[0].createdAt.hour == current_ts.hour and lastReport[0].createdAt.date() == current_ts.date():
                                            if(lastReport[0].data[0].val != temp):
                                                lastReport[0].update(updatedAt=current_ts, push__data=rep)
                                        else:
                                            proc = mp.Process(target=TempHourRep.CreateHourRep, args=(current_ts,my_json["mac"],))
                                            proc.start()
                                            TemperatureTS(sensorId=my_json["mac"], beamerId=beamId, createdAt=current_ts, updatedAt=current_ts, data=[rep]).save()
                            except Exception as e:
                                print("temp",e)
                                self.set_status(400)
                self.set_status(200)
        except Exception as e:
            print(e)
            self.set_status(500)
