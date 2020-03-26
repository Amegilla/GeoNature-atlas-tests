
# -*- coding:utf-8 -*-

from sqlalchemy.sql import text


def getYearlyObservationsChilds(connection, cd_ref):
    sql = """
    SELECT
        date_part('year',dateobs)::integer as year, count(*) as nb_obs
        from atlas.vm_observations obs
        WHERE obs.cd_ref in (
            select * from atlas.find_all_taxons_childs(:thiscdref)
        )
        OR obs.cd_ref = :thiscdref
        GROUP BY date_part('year',dateobs)::integer 
        ORDER BY year;
    """

    mesAnnees = connection.execute(text(sql), thiscdref=cd_ref)
    data = []
    for a in mesAnnees:
        data.append(
            {
                "year":a.year,
                "nb_obs":a.nb_obs
            }
        )
    
    bins = [1700,1990,2000,2005,2010,2015,2017,3000]
    bins_labels = ["<1990","1990-2000","2000-2005","2005-2010","2010-2015","2015-2017",">2017"]
    

    databin = []
    for o in range(len(bins)-1) :
        nbobs_bin = 0
        for d in data :
            if d["year"] >= bins[o] and d["year"] < bins[o+1] :
                nbobs_bin = nbobs_bin + d["nb_obs"]
        databin.append(
            {
                "year":bins_labels[o],
                "nb_obs":nbobs_bin
            }
        )
    return databin



def getYearlyObservationsAll(connection):
    sql = """
    SELECT
        date_part('year',dateobs)::integer as year, count(*) as nb_obs
        from atlas.vm_observations obs
        GROUP BY date_part('year',dateobs)::integer 
        ORDER BY year;
    """

    mesAnnees = connection.execute(text(sql))
    data = []
    for a in mesAnnees:
        data.append(
            {
                "year":a.year,
                "nb_obs":a.nb_obs
            }
        )
    
    bins = [1700,1990,2000,2005,2010,2015,2017,3000]
    bins_labels = ["<1990","1990-2000","2000-2005","2005-2010","2010-2015","2015-2017",">2017"]
    

    databin = []
    for o in range(len(bins)-1) :
        nbobs_bin = 0
        for d in data :
            if d["year"] >= bins[o] and d["year"] < bins[o+1] :
                nbobs_bin = nbobs_bin + d["nb_obs"]
        databin.append(
            {
                "year":bins_labels[o],
                "nb_obs":nbobs_bin
            }
        )
    return databin