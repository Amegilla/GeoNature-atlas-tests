
# -*- coding:utf-8 -*-

from flask import current_app

import unicodedata

from sqlalchemy.sql import text
from .. import utils


def deleteAccent(string):
    return unicodedata.normalize('NFD', string).encode('ascii', 'ignore')


# With distinct the result in a array not an object, 0: lb_nom, 1: nom_vern
def getTaxonsCommunes(connection, insee):
    sql = """
        SELECT DISTINCT
            o.cd_ref, max(date_part('year'::text, o.dateobs)) as last_obs,
            COUNT(o.id_observation) AS nb_obs, t.nom_complet_html, t.nom_vern,
            t.group2_inpn, t.patrimonial, t.protection_stricte,
            m.url, m.chemin, m.id_media
        FROM atlas.vm_observations o
        JOIN atlas.vm_taxons t ON t.cd_ref=o.cd_ref
        LEFT JOIN atlas.vm_medias m ON m.cd_ref=o.cd_ref AND m.id_type={}
        WHERE o.insee = :thisInsee
        GROUP BY o.cd_ref, t.nom_vern, t.nom_complet_html, t.group2_inpn,
            t.patrimonial, t.protection_stricte, m.url, m.chemin, m.id_media
        ORDER BY nb_obs DESC
    """.format(current_app.config['ATTR_MAIN_PHOTO'])
    req = connection.execute(text(sql), thisInsee=insee)
    taxonCommunesList = list()
    nbObsTotal = 0
    for r in req:
        temp = {
            'nom_complet_html': r.nom_complet_html,
            'nb_obs': r.nb_obs,
            'nom_vern': r.nom_vern,
            'cd_ref': r.cd_ref,
            'last_obs': r.last_obs,
            'group2_inpn': deleteAccent(r.group2_inpn),
            'patrimonial': r.patrimonial,
            'protection_stricte': r.protection_stricte,
            'path': utils.findPath(r),
            'id_media': r.id_media
        }
        taxonCommunesList.append(temp)
        nbObsTotal = nbObsTotal + r.nb_obs
    return {'taxons': taxonCommunesList, 'nbObsTotal': nbObsTotal}


def getTaxonsChildsList(connection, cd_ref):
    sql = """
        SELECT DISTINCT nom_complet_html, nb_obs, nom_vern, tax.cd_ref,
            yearmax, group2_inpn, patrimonial, protection_stricte,
            chemin, url, m.id_media
        FROM atlas.vm_taxons tax
        JOIN atlas.bib_taxref_rangs bib_rang
        ON trim(tax.id_rang)= trim(bib_rang.id_rang)
        LEFT JOIN atlas.vm_medias m
        ON m.cd_ref = tax.cd_ref AND m.id_type={}
        WHERE tax.cd_ref IN (
            SELECT * FROM atlas.find_all_taxons_childs(:thiscdref)
        ) """.format(str(current_app.config['ATTR_MAIN_PHOTO']))
    req = connection.execute(text(sql), thiscdref=cd_ref)
    taxonRankList = list()
    nbObsTotal = 0
    for r in req:
        temp = {
            'nom_complet_html': r.nom_complet_html,
            'nb_obs': r.nb_obs,
            'nom_vern': r.nom_vern,
            'cd_ref': r.cd_ref,
            'last_obs': r.yearmax,
            'group2_inpn': utils.deleteAccent(r.group2_inpn),
            'patrimonial': r.patrimonial,
            'protection_stricte': r.protection_stricte,
            'path': utils.findPath(r),
            'id_media': r.id_media
        }
        taxonRankList.append(temp)
        nbObsTotal = nbObsTotal + r.nb_obs
    return {'taxons': taxonRankList, 'nbObsTotal': nbObsTotal}


def getINPNgroupPhotos(connection):
    """
        Get list of INPN groups with at least one photo
    """

    sql = """
        SELECT DISTINCT count(*) AS nb_photos, group2_inpn
        FROM atlas.vm_taxons T
        JOIN atlas.vm_medias M on M.cd_ref = T.cd_ref
        GROUP BY group2_inpn
        ORDER BY nb_photos DESC
    """
    req = connection.execute(text(sql))
    groupList = list()
    for r in req:
        temp = {
            'group': utils.deleteAccent(r.group2_inpn),
            'groupAccent': r.group2_inpn
        }
        groupList.append(temp)
    return groupList


def getTaxonsGroup(connection, groupe):
    sql = """
        SELECT t.cd_ref, t.nom_complet_html, t.nom_vern, t.nb_obs,
            t.group2_inpn, t.protection_stricte, t.patrimonial, t.yearmax,
            m.chemin, m.url, m.id_media,
            t.nb_obs
        FROM atlas.vm_taxons t
        LEFT JOIN atlas.vm_medias m
        ON m.cd_ref = t.cd_ref AND m.id_type={}
        WHERE t.group2_inpn = :thisGroupe
        GROUP BY t.cd_ref, t.nom_complet_html, t.nom_vern, t.nb_obs,
            t.group2_inpn, t.protection_stricte, t.patrimonial, t.yearmax,
            m.chemin, m.url, m.id_media
        """.format(current_app.config['ATTR_MAIN_PHOTO'])
    req = connection.execute(text(sql), thisGroupe=groupe)
    tabTaxons = list()
    nbObsTotal = 0
    for r in req:
        nbObsTotal = nbObsTotal+r.nb_obs
        temp = {
            'nom_complet_html': r.nom_complet_html,
            'nb_obs': r.nb_obs,
            'nom_vern': r.nom_vern,
            'cd_ref': r.cd_ref,
            'last_obs': r.yearmax,
            'group2_inpn': utils.deleteAccent(r.group2_inpn),
            'patrimonial': r.patrimonial,
            'protection_stricte': r.protection_stricte,
            'id_media': r.id_media,
            'path': utils.findPath(r)
        }
        tabTaxons.append(temp)
    return {'taxons': tabTaxons, 'nbObsTotal': nbObsTotal}




# get all groupINPN
def getAllINPNgroup(connection):
    sql = """
        SELECT SUM(nb_obs) AS som_obs, group2_inpn
        FROM atlas.vm_taxons
        GROUP BY group2_inpn
        ORDER by som_obs DESC
    """
    req = connection.execute(text(sql))
    groupList = list()
    for r in req:
        temp = {
            'group': utils.deleteAccent(r.group2_inpn),
            'groupAccent': r.group2_inpn
        }
        groupList.append(temp)
    return groupList


def getTaxonsProtection(connection, cd_ref):
    sql = """select lower(categorie_lr_europe) as categorie_lr_europe , 
                    lower(categorie_lr_france) as categorie_lr_france
                    from atlas.vm_liste_rouges
                    where cd_ref = :thiscdref"""
    req = connection.execute(text(sql), thiscdref=cd_ref)
    taxonProtectionList = list()
    for r in req:
        if r.categorie_lr_europe is not None:
            temp = {'picto':'custom/images/pictos_statuts/lreu_'+r.categorie_lr_europe+'.svg',
            'text':'Classement liste rouge Européenne : '+r.categorie_lr_europe}
            taxonProtectionList.append(temp)
        if r.categorie_lr_france is not None:
            temp = {'picto':'custom/images/pictos_statuts/lrfr_'+r.categorie_lr_france+'.svg',
            'text':'Classement liste rouge Française : '+r.categorie_lr_france}
            taxonProtectionList.append(temp)
    sql = """select lower(status) as status from atlas.vm_dhff_pn  where cd_ref = :thiscdref"""
    req = connection.execute(text(sql), thiscdref=cd_ref)
    for r in req:
        if r.status is not None:
            textinfo = 'Protection réglementaire : '+r.status
            if r.status == 'pn':
                textinfo = "Article 2 - Liste des mammifères terrestres protégés sur l'ensemble du territoire français et les modalités de leur protection - Arrêté interministériel du 23 avril 2007 fixant la liste des mammifères terrestres protégés sur l'ensemble du territoire et les modalités de leur protection (modif. arrêté du 15 septembre 2012)"
            if r.status == 'dhff':
                textinfo = "Annexe II - Directive 92/43/CEE (Directive européenne dite Directive Habitats-Faune-Flore) - Directive 92/43/CEE du Conseil du 21 mai 1992 concernant la conservation des habitats naturels ainsi que de la faune et de la flore sauvages (modifiée par la Directive 97/62/CEE du Conseil du 27 octobre 1997, le Règlement (CE) n° 1882/2003 du Parlement et du Conseil du 29 septembre 2003 et la Directive 2006/105/CE du 20 novembre 2006)"
            temp = {'picto':'custom/images/pictos_statuts/'+r.status+'.svg',
                'text':textinfo}
            taxonProtectionList.append(temp)
    return taxonProtectionList