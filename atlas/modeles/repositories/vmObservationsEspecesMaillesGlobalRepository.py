# -*- coding:utf-8 -*-

from .. import utils
from sqlalchemy.sql import text
import json


def getObservationsMaillesChilds(connection):
    sql = """SELECT Distinct
            nb_espece,
            id_maille,
            geojson_maille
        FROM atlas.vm_nbespece_mailles
        ORDER BY id_maille"""
    observations = connection.execute(text(sql))
    tabObs = list()
    for o in observations:
        temp = {
            "id_maille": o.id_maille,
            "nb_espece": o.nb_espece,
            "geojson_maille": json.loads(o.geojson_maille),
        }
        tabObs.append(temp)
    return tabObs


