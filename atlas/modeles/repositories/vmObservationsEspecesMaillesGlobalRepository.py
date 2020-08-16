# -*- coding:utf-8 -*-

from .. import utils
from sqlalchemy.sql import text
import json


def getObservationsMaillesChilds(connection):
    sql = """SELECT
            nb_espece,
            id_maille,
            area_code,
            liste_espece_vern,
            liste_observateurs,
            geojson_maille
        FROM atlas.vm_nbespece_mailles
        ORDER BY id_maille"""
    observations = connection.execute(text(sql))
    tabObs = list()
    for o in observations:
        temp = {
            "area_code": o.area_code,
            "nb_espece": o.nb_espece,
            "liste_espece_vern": o.liste_espece_vern,
            "liste_observateurs": ', '.join(set(o.liste_observateurs.split(', '))),
            "geojson_maille": json.loads(o.geojson_maille),
        }
        tabObs.append(temp)
    return tabObs

def getObservationsMaillesChilds_chiro(connection):
    sql = """SELECT
            nb_espece,
            id_maille,
            area_code,
            liste_espece_vern,
            liste_observateurs,
            geojson_maille
        FROM atlas.vm_nbespece_mailles_chiro
        ORDER BY id_maille"""
    observations = connection.execute(text(sql))
    tabObs = list()
    for o in observations:
        temp = {
            "area_code": o.area_code,
            "nb_espece": o.nb_espece,
            "liste_espece_vern": o.liste_espece_vern,
            "liste_observateurs": ', '.join(set(o.liste_observateurs.split(', '))),
            "geojson_maille": json.loads(o.geojson_maille),
        }
        tabObs.append(temp)
    return tabObs

def getObservationsMaillesChilds_chiro_annexeII(connection):
    sql = """SELECT
            nb_espece,
            id_maille,
            area_code,
            liste_espece_vern,
            liste_observateurs,
            geojson_maille
        FROM atlas.vm_nbespece_mailles_chiro_annexeII
        ORDER BY id_maille"""
    observations = connection.execute(text(sql))
    tabObs = list()
    for o in observations:
        temp = {
            "area_code": o.area_code,
            "nb_espece": o.nb_espece,
            "liste_espece_vern": o.liste_espece_vern,
            "liste_observateurs": ', '.join(set(o.liste_observateurs.split(', '))),
            "geojson_maille": json.loads(o.geojson_maille),
        }
        tabObs.append(temp)
    return tabObs

def getObservationsMaillesChilds_chiro_CR_EN(connection):
    sql = """SELECT
            nb_espece,
            id_maille,
            area_code,
            liste_espece_vern,
            liste_observateurs,
            geojson_maille
        FROM atlas.vm_nbespece_mailles_chiro_CR_EN
        ORDER BY id_maille"""
    observations = connection.execute(text(sql))
    tabObs = list()
    for o in observations:
        temp = {
            "area_code": o.area_code,
            "nb_espece": o.nb_espece,
            "liste_espece_vern": o.liste_espece_vern,
            "liste_observateurs": ', '.join(set(o.liste_observateurs.split(', '))),
            "geojson_maille": json.loads(o.geojson_maille),
        }
        tabObs.append(temp)
    return tabObs

def getObservationsMaillesChilds_chiro_VU(connection):
    sql = """SELECT
            nb_espece,
            id_maille,
            area_code,
            liste_espece_vern,
            liste_observateurs,
            geojson_maille
        FROM atlas.vm_nbespece_mailles_chiro_VU
        ORDER BY id_maille"""
    observations = connection.execute(text(sql))
    tabObs = list()
    for o in observations:
        temp = {
            "area_code": o.area_code,
            "nb_espece": o.nb_espece,
            "liste_espece_vern": o.liste_espece_vern,
            "liste_observateurs": ', '.join(set(o.liste_observateurs.split(', '))),
            "geojson_maille": json.loads(o.geojson_maille),
        }
        tabObs.append(temp)
    return tabObs


def getObservationsMaillesChilds_petitMams(connection):
    sql = """SELECT
            nb_espece,
            id_maille,
            area_code,
            liste_espece_vern,
            liste_observateurs,
            geojson_maille
        FROM atlas.vm_nbespece_mailles_petitmams
        ORDER BY id_maille"""
    observations = connection.execute(text(sql))
    tabObs = list()
    for o in observations:
        temp = {
            "area_code": o.area_code,
            "nb_espece": o.nb_espece,
            "liste_espece_vern": o.liste_espece_vern,
            "liste_observateurs": ', '.join(set(o.liste_observateurs.split(', '))),
            "geojson_maille": json.loads(o.geojson_maille),
        }
        tabObs.append(temp)
    return tabObs
    