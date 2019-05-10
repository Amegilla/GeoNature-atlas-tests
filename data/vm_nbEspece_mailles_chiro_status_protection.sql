-- ajout des tables avec les statuts de protection en table distantes dans l'atlas
IMPORT FOREIGN SCHEMA taxonomie
	LIMIT TO (
		taxonomie.taxref_protection_especes,
		taxonomie.taxref_protection_articles,
		taxonomie.taxref_liste_rouge_fr
		)
    FROM SERVER geonaturedbserver INTO taxonomie ;

GRANT SELECT ON TABLE taxonomie.taxref_protection_especes TO geonatatlasuser;
GRANT SELECT ON TABLE taxonomie.taxref_protection_articles TO geonatatlasuser;
GRANT SELECT ON TABLE taxonomie.taxref_liste_rouge_fr TO geonatatlasuser;
   

-- creation de la vue materializée pour les status de protection
drop materialized view atlas.vm_status_protection_chiro;
create materialized view atlas.vm_status_protection_chiro as 
select  t.cd_ref, t.nom_vern,string_agg(a.article,',') as article ,string_agg(p.cd_protection,',') as protection,l.id_categorie_france
from	taxonomie.taxref t
join	taxonomie.taxref_protection_especes p  using (cd_nom)
join	taxonomie.taxref_protection_articles a on p.cd_protection = a.cd_protection
join	taxonomie.taxref_liste_rouge_fr l on t.cd_nom = l.cd_nom
where t.ordre like 'Chiroptera' and (a.article like 'Annexe II' or a.article like 'Annexe 2')
and t.cd_nom = t.cd_ref
group by t.nom_vern,t.cd_ref,l.id_categorie_france
;

CREATE INDEX vm_status_protection_chiro_idx ON atlas.vm_status_protection_chiro USING btree (cd_ref);

ALTER TABLE atlas.vm_status_protection_chiro OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_status_protection_chiro TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_status_protection_chiro TO geonatatlasuser;

-- creation de la vue pour les especes annexe II

CREATE MATERIALIZED VIEW atlas.vm_nbespece_mailles_chiro_annexeII
AS 
SELECT count(DISTINCT t.cd_ref) AS nb_espece,
    string_agg(DISTINCT t.lb_nom::text, ', '::text) AS liste_espece_scien,
    string_agg(DISTINCT t.cd_ref::text, ', '::text) AS liste_cd_ref,
    min(obs.dateobs) AS date_min,
    max(obs.dateobs) AS date_max,
    m.id_maille,
    c.area_code,
    m.geojson_maille
   FROM atlas.vm_observations obs
     JOIN atlas.t_mailles_territoire m ON st_intersects(obs.the_geom_point, m.the_geom)
     JOIN ref_geo.l_areas c ON m.id_maille = c.id_area
     join atlas.vm_status_protection_chiro p ON obs.cd_ref = p.cd_ref
     JOIN ( SELECT vm_taxref.cd_ref,
            vm_taxref.nom_vern,
            vm_taxref.lb_nom
           FROM atlas.vm_taxref
          WHERE vm_taxref.cd_nom = vm_taxref.cd_ref) t ON t.cd_ref = obs.cd_ref
  WHERE (obs.cd_ref IN ( SELECT find_all_taxons_childs.find_all_taxons_childs
           FROM atlas.find_all_taxons_childs(186233) find_all_taxons_childs(find_all_taxons_childs))) OR obs.cd_ref = 186233
           and p.protection like '%CDH2%'
  GROUP BY m.id_maille, m.geojson_maille, c.area_code
WITH DATA;

-- View indexes:
CREATE INDEX vm_nbespece_mailles_chiro_annexeII_id_maille_idx ON atlas.vm_nbespece_mailles_chiro_annexeII USING btree (id_maille);

-- Permissions

ALTER TABLE atlas.vm_nbespece_mailles_chiro_annexeII OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_nbespece_mailles_chiro_annexeII TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_nbespece_mailles_chiro_annexeII TO geonatatlasuser;

-- creation de la vue pour les especes CR / EN

CREATE MATERIALIZED VIEW atlas.vm_nbespece_mailles_chiro_CR_EN
AS 
SELECT count(DISTINCT t.cd_ref) AS nb_espece,
    string_agg(DISTINCT t.lb_nom::text, ', '::text) AS liste_espece_scien,
    string_agg(DISTINCT t.cd_ref::text, ', '::text) AS liste_cd_ref,
    min(obs.dateobs) AS date_min,
    max(obs.dateobs) AS date_max,
    m.id_maille,
    c.area_code,
    m.geojson_maille
   FROM atlas.vm_observations obs
     JOIN atlas.t_mailles_territoire m ON st_intersects(obs.the_geom_point, m.the_geom)
     JOIN ref_geo.l_areas c ON m.id_maille = c.id_area
     join atlas.vm_status_protection_chiro p ON obs.cd_ref = p.cd_ref
     JOIN ( SELECT vm_taxref.cd_ref,
            vm_taxref.nom_vern,
            vm_taxref.lb_nom
           FROM atlas.vm_taxref
          WHERE vm_taxref.cd_nom = vm_taxref.cd_ref) t ON t.cd_ref = obs.cd_ref
  WHERE (obs.cd_ref IN ( SELECT find_all_taxons_childs.find_all_taxons_childs
           FROM atlas.find_all_taxons_childs(186233) find_all_taxons_childs(find_all_taxons_childs))) OR obs.cd_ref = 186233
           and (p.id_categorie_france like '%EN%' or p.id_categorie_france like '%CR%')
  GROUP BY m.id_maille, m.geojson_maille, c.area_code
WITH DATA;

-- View indexes:
CREATE INDEX vm_nbespece_mailles_chiro_CR_EN_id_maille_idx ON atlas.vm_nbespece_mailles_chiro_CR_EN USING btree (id_maille);

-- Permissions

ALTER TABLE atlas.vm_nbespece_mailles_chiro_CR_EN OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_nbespece_mailles_chiro_CR_EN TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_nbespece_mailles_chiro_CR_EN TO geonatatlasuser;

-- creation de la vue pour les especes annexe VU

CREATE MATERIALIZED VIEW atlas.vm_nbespece_mailles_chiro_VU
AS 
SELECT count(DISTINCT t.cd_ref) AS nb_espece,
    string_agg(DISTINCT t.lb_nom::text, ', '::text) AS liste_espece_scien,
    string_agg(DISTINCT t.cd_ref::text, ', '::text) AS liste_cd_ref,
    min(obs.dateobs) AS date_min,
    max(obs.dateobs) AS date_max,
    m.id_maille,
    c.area_code,
    m.geojson_maille
   FROM atlas.vm_observations obs
     JOIN atlas.t_mailles_territoire m ON st_intersects(obs.the_geom_point, m.the_geom)
     JOIN ref_geo.l_areas c ON m.id_maille = c.id_area
     join atlas.vm_status_protection_chiro p ON obs.cd_ref = p.cd_ref
     JOIN ( SELECT vm_taxref.cd_ref,
            vm_taxref.nom_vern,
            vm_taxref.lb_nom
           FROM atlas.vm_taxref
          WHERE vm_taxref.cd_nom = vm_taxref.cd_ref) t ON t.cd_ref = obs.cd_ref
  WHERE (obs.cd_ref IN ( SELECT find_all_taxons_childs.find_all_taxons_childs
           FROM atlas.find_all_taxons_childs(186233) find_all_taxons_childs(find_all_taxons_childs))) OR obs.cd_ref = 186233
           and (p.id_categorie_france like '%VU%')
  GROUP BY m.id_maille, m.geojson_maille, c.area_code
WITH DATA;

-- View indexes:
CREATE INDEX vm_nbespece_mailles_chiro_VU_id_maille_idx ON atlas.vm_nbespece_mailles_chiro_VU USING btree (id_maille);

-- Permissions

ALTER TABLE atlas.vm_nbespece_mailles_chiro_VU OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_nbespece_mailles_chiro_VU TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_nbespece_mailles_chiro_VU TO geonatatlasuser;


