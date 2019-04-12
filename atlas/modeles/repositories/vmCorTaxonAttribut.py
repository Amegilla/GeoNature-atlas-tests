
# -*- coding:utf-8 -*-

from sqlalchemy.sql import text


def getAttributesTaxon(
    connection, cd_ref, attrDesc, attrHabitats, attrAire, attrPopulation, attrMenaces
):
    sql = """
        SELECT *
        FROM atlas.vm_cor_taxon_attribut
        WHERE id_attribut IN (:thisattrDesc, :thisattrHabitats, :thisattrAire, :thisattrPopulation, :thisattrMenaces)
        AND cd_ref = :thiscdref
    """
    req = connection.execute(
        text(sql),
        thiscdref=cd_ref,
        thisattrDesc=attrDesc,
        thisattrHabitats=attrHabitats,
        thisattrAire=attrAire,
        thisattrPopulation=attrPopulation,
        thisattrMenaces=attrMenaces
    )

    descTaxon = {
        'description': None,
        'habitats':None,
        'aire': None,
        'population': None,
        'menaces': None
    }
    for r in req:
        if r.id_attribut == attrDesc:
            descTaxon['description'] = r.valeur_attribut
        elif r.id_attribut == attrHabitats:
            descTaxon['habitats'] = r.valeur_attribut
        elif r.id_attribut == attrAire:
            descTaxon['aire'] = r.valeur_attribut.replace("&" , " | ")
        elif r.id_attribut == attrPopulation:
            descTaxon['population'] = r.valeur_attribut
        elif r.id_attribut == attrMenaces:
            descTaxon['menaces'] = r.valeur_attribut
    return descTaxon
