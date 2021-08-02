import networkx as nx
import pandas as pd


def get_list_of_biggest_degree_centrality(graph, df_user, max_person_amount=10):
    degree_centrality = nx.degree_centrality(graph)
    list_most_centrality_ones = [{k: v} for k, v in
                                 sorted(degree_centrality.items(), key=lambda item: item[1])][-max_person_amount:]
    df_most_centrality_ones = pd.DataFrame(pd.DataFrame(list_most_centrality_ones).T.
                                           apply(lambda x: max(x.fillna(0)), axis=1))

    result = pd.DataFrame()

    for user, centrality in df_most_centrality_ones.iterrows():
        most_centrality_user = df_user.loc[df_user.sid == user, ['name', 'lastname', 'id', 'tel']]
        most_centrality_user['centrality'] = centrality.values[0]
        result = result.append(most_centrality_user, ignore_index=True)

    return result
