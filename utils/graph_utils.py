import networkx as nx
import pandas as pd


def get_network_plot_data(network_graph):
    result = list()
    for name, connections in pd.DataFrame(list(network_graph.edges())).groupby(0):
        result.append({'name': name, 'linkWith': list(connections.loc[:, 1])})
    return result


def to_undirected_graph(network_graph):
    g = nx.Graph()
    g.add_edges_from(network_graph.edges(), weight=0)

    for u, v, d in network_graph.edges(data=True):
        g[u][v]['weight'] += d['weight']
    return g


def filter_graph(network_graph, min_connections_logs):
    small_w = [(u, v) for (u, v, d) in network_graph.edges(data=True) if d['weight'] <= min_connections_logs]
    network_graph.remove_edges_from(small_w)
    return network_graph
