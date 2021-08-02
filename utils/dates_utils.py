import datetime

from pymongo import MongoClient
import pandas as pd


def get_dates_as_firestore_collection(from_, to_, return_as_string=False):
    dt_to = datetime.datetime.strptime(to_, '%Y-%m-%d')
    dt_from = datetime.datetime.strptime(from_, '%Y-%m-%d')
    if dt_to >= dt_from:
        days = (dt_to - dt_from).days

        if return_as_string:
            return [(dt_from + datetime.timedelta(days=n)).strftime('%Y-%m-%d') for n in range(days + 1)]
        return [dt_from + datetime.timedelta(days=n) for n in range(days + 1)]


def get_users_in_range_dates(db_name, day_start, day_end):
    day_start = day_start.replace("T", "-")
    day_end = day_end.replace("T", "-")

    client = MongoClient()
    db_mongo = client[db_name]
    table_day_users = db_mongo['day_users']
    result = None
    days = get_dates_as_firestore_collection(day_start, day_end, return_as_string=True)
    only_errors = True
    for day in days:
        try:
            users_df = pd.DataFrame(list(table_day_users.find({"day": day}))[0]['users'])
            only_errors = False
        except IndexError:
            continue

        if result is None:
            result = users_df
        else:
            result = pd.concat([result, users_df])

    if only_errors:
        return None
    result = result.groupby("sid").first().reset_index()
    return result
