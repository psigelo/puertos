from datetime import timedelta
import pandas as pd
from pymongo import MongoClient
from modules.iot_isafer.utils.dates_utils import get_dates_as_firestore_collection, get_users_in_range_dates
from modules.iot_isafer.utils.firebase_utils import use_names_instead_of_sid
from modules.iot_isafer.utils.globaldata import MINUTES_OF_INTERACTION, INTERACTIONS_NEEDED_TO_COUNT


def trace_hour_range(db_name, day, end_day, inspect_table, inspect_value):
    day_start = day.replace("T", "-")
    day_end = end_day.replace("T", "-")
    days = get_dates_as_firestore_collection(day_start, day_end, return_as_string=True)

    df_users = get_users_in_range_dates(db_name, day, end_day)
    if df_users is None:
        return None

    try:
        df_users.tel = df_users.tel.apply(lambda x: x.replace("+", "") if isinstance(x, str) else x)
        user_info = df_users.loc[df_users[inspect_table] == inspect_value]
    except KeyError:
        return None

    try:
        user_sid = user_info.sid.values[0]
    except IndexError:
        return None

    df_2 = df_users[["sid", "client_view"]]
    sid_2_name = df_2.set_index("sid").to_dict()["client_view"]

    client = MongoClient()
    db_mongo = client[db_name]
    table_connections = db_mongo['connections_and_ts']
    result = None
    for day in days:
        try:
            day_table = pd.DataFrame(list(table_connections.find({"day": day}))[0]['connections_and_ts'])
        except IndexError:
            continue
        # TODO: explicar paso a paso
        sub_1 = day_table.source == user_sid
        sub_2 = day_table.target == user_sid
        d1 = day_table.loc[sub_1]
        d2 = day_table.loc[sub_2]
        d1["interest"] = d1["target"]
        d2["interest"] = d2["source"]
        d1 = d1.append(d2)
        d1 = d1[["ts", "interest", "count"]]

        d1 = d1.set_index("ts")
        d1 = d1.groupby("interest").resample(str(MINUTES_OF_INTERACTION)+"T").sum()
        try:
            d1 = d1.reset_index().set_index("ts").sort_index()
        except KeyError:
            continue
        d1 = d1.loc[d1["count"] >= INTERACTIONS_NEEDED_TO_COUNT]
        d1["interest"] = d1["interest"].apply(lambda x: sid_2_name[x] if x in sid_2_name.keys() else x)
        d1["startTime"] = d1.index.strftime('%Y-%m-%d %H:%M')
        d1["endTime"] = (d1.index + timedelta(minutes=MINUTES_OF_INTERACTION)).strftime('%Y-%m-%d %H:%M')

        d1.columns = ["name", "interactions", "fromDate", "toDate"]
        d1["color"] = d1["interactions"].apply(lambda x: "rgb(200,0,0)" if x > 10 else "rgb(200,200,0)")
        if result is None:
            result = d1
        else:
            result = pd.concat([result, d1])
    return result


def arc_data(db_name, day, end_day, return_sum_interactions=True):
    day = day.replace("T", "-")
    end_day = end_day.replace("T", "-")
    days = get_dates_as_firestore_collection(day, end_day, return_as_string=True)

    client = MongoClient()
    db_mongo = client[db_name]
    table_arc_plot = db_mongo['arc_plot_weight_hours']

    df_users = get_users_in_range_dates(db_name, day, end_day)
    if df_users is None:
        return None

    result = None
    for day_it in days:
        try:
            arc_data = pd.DataFrame(list(table_arc_plot.find({"day": day_it}))[0]['arc_plot_weight_hours'])
        except IndexError:
            continue

        arc_data['day'] = day_it
        sub_arc_data = arc_data
        # use_names_instead_of_sid(sub_arc_data, df_users)

        sub_arc_data.columns = ["from", "to", "value", "day"]
        if result is None:
            result = sub_arc_data
        else:
            result = pd.concat([result, sub_arc_data])

    if return_sum_interactions:
        result = result.groupby(by=["from", "to"]).sum().reset_index()  # sum of different days with same from and to
        return result
    else:
        return result


def tracer_arc_data_range(db_name, day, end_day, inspection_table, inspection_value, return_sum_interactions=True):
    day = day.replace("T", "-")
    end_day = end_day.replace("T", "-")
    days = get_dates_as_firestore_collection(day, end_day, return_as_string=True)

    client = MongoClient()
    db_mongo = client[db_name]
    table_connections = db_mongo['arc_plot_weight_hours']

    df_users = get_users_in_range_dates(db_name, day, end_day)
    if df_users is None:
        return None

    result = None
    for day_it in days:
        try:
            arc_data = pd.DataFrame(list(table_connections.find({"day": day_it}))[0]['arc_plot_weight_hours'])
        except IndexError:
            continue
        arc_data['day'] = day_it
        # filtering by user
        df_users.tel = df_users.tel.apply(lambda x: x.replace("+", "") if isinstance(x, str) else x)
        user_info = df_users.loc[df_users[inspection_table] == inspection_value]
        user_client_view = user_info.client_view.iloc[0]
        source_correct = arc_data.source == user_client_view
        target_correct = arc_data.target == user_client_view
        sub_arc_data = arc_data.loc[(source_correct | target_correct)]

        sub_arc_data.columns = ["from", "to", "value", 'day']
        if result is None:
            result = sub_arc_data
        else:
            result = pd.concat([result, sub_arc_data])

    if return_sum_interactions:
        result = result.groupby(by=["from", "to"]).sum().reset_index()  # sum of different days with same from and to
        return result
    else:
        return result
