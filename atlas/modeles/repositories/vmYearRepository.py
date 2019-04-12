
# -*- coding:utf-8 -*-

from sqlalchemy.sql import text


def getYearlyObservationsChilds(connection, cd_ref):
    sql = """
    SELECT
        date_part('year',dateobs)::integer as year, count(*)
        from atlas.vm_observations obs
        WHERE obs.cd_ref in (
            select * from atlas.find_all_taxons_childs(:thiscdref)
        )
        OR obs.cd_ref = :thiscdref
        GROUP BY date_part('year',dateobs)::integer 
        ORDER BY year;
    
    """

    mesAnnees = connection.execute(text(sql), thiscdref=cd_ref)

    return mesAnnees
