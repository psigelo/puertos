import sys

import google
import pandas as pd
import numpy as np


def use_names_instead_of_sid(connections_table, df_users):
    df_2 = df_users[["sid", "client_view"]]
    sid_2_name = df_2.set_index("sid").to_dict()["client_view"]
    connections_table.source = \
        connections_table.source.apply(lambda x: sid_2_name[x] if x in sid_2_name.keys() else x)
    connections_table.target = \
        connections_table.target.apply(lambda x: sid_2_name[x] if x in sid_2_name.keys() else x)
    return connections_table


def get_users(db) -> pd.DataFrame:
    result = pd.DataFrame()
    emp_ref = db.collection('users')
    docs = emp_ref.stream()
    for doc in docs:
        result = result.append(doc.to_dict(), ignore_index=True)
    result.sid = result.sid.apply(lambda x: x.replace(":", ""))
    return result


def get_day_table(db, day: str):
    users_macs_ref = db.collection('usersMacs')
    docs_macs = users_macs_ref.stream()
    counter = 0
    result = pd.DataFrame()
    for doc_macs in docs_macs:
        counter += 1
        sys.stdout.write('\r' + str(counter) + "/" + " ")
        sys.stdout.flush()

        current_mac = doc_macs.id.replace(":", "")
        collection_str = 'usersMacs/{}/{}'.format(doc_macs.id, day)
        docs_contact_data = db.collection(collection_str).stream()

        for doc_contact in docs_contact_data:
            contact_logs = [i['sid'] for i in doc_contact.to_dict()['datos']]
            unique, counts = np.unique(contact_logs, return_counts=True)
            len_data = len(unique)
            sub_dataframe = pd.DataFrame({'source': [current_mac]*len_data, 'target': list(unique), 'weight': counts})
            # row['node'] = current_mac
            result = result.append(sub_dataframe, ignore_index=True)
    uploaders = set(result['source'].unique())
    all_users_obtained = uploaders.union(set(result['target']))

    return result, uploaders, all_users_obtained
