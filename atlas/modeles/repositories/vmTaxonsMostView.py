
# -*- coding:utf-8 -*-

from .. import utils
from sqlalchemy.sql import text


def mostViewTaxon(connection):
    sql = "SELECT * FROM atlas.vm_taxons_plus_observes"
    req = connection.execute(text(sql))
    tabTax = list()
    for r in req:
        if r.nom_vern != None:
            nom_verna = r.nom_vern.split(',')
            taxonName = nom_verna[0]+' | ' + r.lb_nom
        else:
            taxonName = r.lb_nom
        temp = {
            'cd_ref': r.cd_ref,
            'taxonName': taxonName,
            'path': utils.findPath(r),
            'group2_inpn': utils.deleteAccent(r.group2_inpn),
            'id_media': r.id_media
        }
        tabTax.append(temp)
    return tabTax


def portal_taxon_list(connection,cd_ref):
    # deux comportements selon si la variable cd_ref est une liste ou un nombre unique
    if not isinstance(cd_ref, list):
        sql = """SELECT * FROM atlas.vm_taxons_plus_observes WHERE cd_ref in (
                select * from atlas.find_all_taxons_childs(:thiscdref)
            )"""
        req = connection.execute(text(sql), thiscdref=cd_ref)
        
    elif len(cd_ref) > 1 :
        sql = """SELECT * FROM atlas.vm_taxons_plus_observes WHERE cd_ref in 
                 ( {} );""".format(','.join([str(x) for x in cd_ref]))
        req = connection.execute(text(sql))

    tabTax = list()
    for r in req:
        if r.nom_vern != None:
            nom_verna = r.nom_vern.split(',')
            taxonName = nom_verna[0]+' | ' + r.lb_nom
        else:
            taxonName = r.lb_nom
        temp = {
            'cd_ref': r.cd_ref,
            'taxonName': taxonName,
            'path': utils.findPath(r),
            'group2_inpn': utils.deleteAccent(r.group2_inpn),
            'id_media': r.id_media
        }
        tabTax.append(temp)
    return tabTax