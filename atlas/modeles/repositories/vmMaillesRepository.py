# -*- coding:utf-8 -*-

import ast
from ..entities.vmMailles import VmMailles
from sqlalchemy import distinct
from sqlalchemy.sql import text


def getAllMailles(session):
    req = session.query(distinct(VmMailles.id_maille), VmMailles.area_code).all()
    mailleList = list()
    for r in req:
        temp = {'label': r[0], 'value': r[1]}
        mailleList.append(temp)
    return mailleList


def getMaillesSearch(session, search, limit=50):
    req = session.query(distinct(VmMailles.id_maille), VmMailles.area_code) \
        .filter(VmMailles.area_code.like('%' + search + '%')).limit(limit).all()
    mailleList = list()
    for r in req:
        temp = {'label': r[0], 'value': r[1]}
        mailleList.append(temp)
    return mailleList


# def getmailleFromInsee(connection, insee):
#     sql = "SELECT m.area_code, \
#            m.insee, \
#            m.maille_geojson \
#            FROM atlas.vm_mailles m \
#            WHERE c.insee = :thisInsee"
#     req = connection.execute(text(sql), thisInsee=insee)
#     mailleObj = dict()
#     for r in req:
#         mailleObj = {
#             'mailleName': r.maille_maj,
#             'insee': str(r.insee),
#             'mailleGeoJson': ast.literal_eval(r.maille_geojson)
#         }
#     return mailleObj

#     return req[0].maille_maj


def getMaillesObservationsChilds(connection, cd_ref):
    sql = """
    SELECT DISTINCT (ma.id_maille) as id_maille, ma.area_code
    FROM atlas.vm_mailles ma
    JOIN atlas.vm_observations_mailles obsma
    ON obsma.id_maille = ma.id_maille
    WHERE obsma.cd_ref in (
            SELECT * from atlas.find_all_taxons_childs(:thiscdref)
        )
        OR obsma.cd_ref = :thiscdref
    ORDER BY ma.area_code ASC
    """
    req = connection.execute(text(sql), thiscdref=cd_ref)
    listMailles = list()
    for r in req:
        temp = {'id_maille': r.id_maille, 'area_code': r.area_code}
        listMailles.append(temp)
    return listMailles
