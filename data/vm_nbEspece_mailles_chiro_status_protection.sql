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
-- drop materialized view atlas.vm_status_protection_chiro;
-- create materialized view atlas.vm_status_protection_chiro as 
-- select  t.cd_ref, t.nom_vern,string_agg(a.article,',') as article ,string_agg(p.cd_protection,',') as protection,l.id_categorie_france
-- from	taxonomie.taxref t
-- join	taxonomie.taxref_protection_especes p  using (cd_nom)
-- join	taxonomie.taxref_protection_articles a on p.cd_protection = a.cd_protection
-- join	taxonomie.taxref_liste_rouge_fr l on t.cd_nom = l.cd_nom
-- where t.ordre like 'Chiroptera' and (a.article like 'Annexe II' or a.article like 'Annexe 2')
-- and t.cd_nom = t.cd_ref
-- group by t.nom_vern,t.cd_ref,l.id_categorie_france
-- ;

drop MATERIALIZED VIEW atlas.vm_status_protection_chiro cascade;
CREATE MATERIALIZED VIEW atlas.vm_status_protection_chiro as
SELECT t.cd_ref,
    t.nom_vern,
    t.lb_nom,
    case when tl.cdh2 ilike 'O' then 'CDH2'
    else null end as  protection,
    tm."LR France" as id_categorie_france
    from taxonomie.statuts_legaux tl
    left join taxonomie.statuts_moraux tm using(cdref)
    join taxonomie.taxref t ON t.cd_ref = tl.cdref
    where t.cd_nom = t.cd_ref;

-- View indexes:
CREATE INDEX vm_status_protection_chiro_idx ON atlas.vm_status_protection_chiro USING btree (cd_ref);


-- Permissions

ALTER TABLE atlas.vm_status_protection_chiro OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_status_protection_chiro TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_status_protection_chiro TO geonatatlasuser;






-- creation de la vue pour les especes annexe II
drop MATERIALIZED VIEW if exists atlas.vm_nbespece_mailles_chiro_annexeII;
CREATE MATERIALIZED VIEW atlas.vm_nbespece_mailles_chiro_annexeii
AS SELECT count(DISTINCT p.cd_ref) AS nb_espece,
    string_agg(DISTINCT p.lb_nom::text, ', '::text) AS liste_espece_scien,
    string_agg(DISTINCT split_part(p.nom_vern::text, ','::text, 1), ', '::text) AS liste_espece_vern,
    string_agg(DISTINCT p.cd_ref::text, ', '::text) AS liste_cd_ref,
    string_agg(DISTINCT obs.observateurs::text, ', '::text) AS liste_observateurs,
    min(obs.dateobs) AS date_min,
    max(obs.dateobs) AS date_max,
    m.id_maille,
    c.area_code,
    m.geojson_maille
   FROM atlas.vm_observations obs
     JOIN atlas.t_mailles_territoire m ON st_intersects(obs.the_geom_point, m.the_geom)
     JOIN ref_geo.l_areas c ON m.id_maille = c.id_area
     JOIN atlas.vm_status_protection_chiro p ON obs.cd_ref = p.cd_ref
  WHERE obs.effectif_total > 0 AND p.protection ~~ '%CDH2%'::text
  GROUP BY m.id_maille, m.geojson_maille, c.area_code
WITH DATA;

-- View indexes:
CREATE INDEX vm_nbespece_mailles_chiro_annexeII_id_maille_idx ON atlas.vm_nbespece_mailles_chiro_annexeII USING btree (id_maille);

-- Permissions

ALTER TABLE atlas.vm_nbespece_mailles_chiro_annexeII OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_nbespece_mailles_chiro_annexeII TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_nbespece_mailles_chiro_annexeII TO geonatatlasuser;

-- creation de la vue pour les especes CR / EN
drop MATERIALIZED VIEW if exists atlas.vm_nbespece_mailles_chiro_CR_EN;
CREATE MATERIALIZED VIEW atlas.vm_nbespece_mailles_chiro_CR_EN
AS 
SELECT 
count(DISTINCT p.cd_ref) AS nb_espece,
string_agg(DISTINCT p.lb_nom::text, ', '::text) AS liste_espece_scien,
string_agg(DISTINCT split_part(nom_vern,',', 1)::text, ', '::text) AS liste_espece_vern,
string_agg(DISTINCT p.cd_ref::text, ', '::text) AS liste_cd_ref,
string_agg(DISTINCT obs.observateurs, ', '::text) AS liste_observateurs,
min(obs.dateobs) AS date_min,
max(obs.dateobs) AS date_max,
m.id_maille,
c.area_code,
m.geojson_maille
FROM atlas.vm_observations obs
JOIN atlas.t_mailles_territoire m ON st_intersects(obs.the_geom_point, m.the_geom)
JOIN ref_geo.l_areas c ON m.id_maille = c.id_area
join atlas.vm_status_protection_chiro p ON obs.cd_ref = p.cd_ref
WHERE obs.effectif_total > 0 AND (p.id_categorie_france like '%EN%' or p.id_categorie_france like '%CR%')
  GROUP BY m.id_maille, m.geojson_maille, c.area_code
WITH DATA;

-- View indexes:
CREATE INDEX vm_nbespece_mailles_chiro_CR_EN_id_maille_idx ON atlas.vm_nbespece_mailles_chiro_CR_EN USING btree (id_maille);

-- Permissions

ALTER TABLE atlas.vm_nbespece_mailles_chiro_CR_EN OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_nbespece_mailles_chiro_CR_EN TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_nbespece_mailles_chiro_CR_EN TO geonatatlasuser;

-- creation de la vue pour les especes annexe VU
drop MATERIALIZED VIEW if exists atlas.vm_nbespece_mailles_chiro_VU;
CREATE MATERIALIZED VIEW atlas.vm_nbespece_mailles_chiro_vu
AS SELECT count(DISTINCT p.cd_ref) AS nb_espece,
    string_agg(DISTINCT p.lb_nom::text, ', '::text) AS liste_espece_scien,
    string_agg(DISTINCT split_part(p.nom_vern::text, ','::text, 1), ', '::text) AS liste_espece_vern,
    string_agg(DISTINCT p.cd_ref::text, ', '::text) AS liste_cd_ref,
    string_agg(DISTINCT obs.observateurs::text, ', '::text) AS liste_observateurs,
    min(obs.dateobs) AS date_min,
    max(obs.dateobs) AS date_max,
    m.id_maille,
    c.area_code,
    m.geojson_maille
   FROM atlas.vm_observations obs
     JOIN atlas.t_mailles_territoire m ON st_intersects(obs.the_geom_point, m.the_geom)
     JOIN ref_geo.l_areas c ON m.id_maille = c.id_area
     JOIN atlas.vm_status_protection_chiro p ON obs.cd_ref = p.cd_ref
  WHERE obs.effectif_total > 0 AND p.id_categorie_france::text ~~ '%VU%'::text
  GROUP BY m.id_maille, m.geojson_maille, c.area_code
WITH DATA;

-- View indexes:
CREATE INDEX vm_nbespece_mailles_chiro_VU_id_maille_idx ON atlas.vm_nbespece_mailles_chiro_VU USING btree (id_maille);

-- Permissions

ALTER TABLE atlas.vm_nbespece_mailles_chiro_VU OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_nbespece_mailles_chiro_VU TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_nbespece_mailles_chiro_VU TO geonatatlasuser;


-----------------------------------------------------------------------------

-- Finalement ces vues ne sont pas à jour donc on part sur une autre voie :
-- Fanny m'envoie ces tableaux de status moreau et légaux :

 -- pour importer, on créé un fdw avec dbeaver puis on copie de table à table.

 CREATE TABLE taxonomie.statuts_moraux (
	cdRef integer,
	"LR Monde" varchar(5),
	"LR Europe" varchar(5),
	"LR France" varchar(5),
	"LR Alsace" varchar(5),
	"LR Aquitaine" varchar(5),
	"LR Auvergne" varchar(5),
	"LR Basse Normandie" varchar(5),
	"LR Bourgogne" varchar(5),
	"LR Bretagne" varchar(5),
	"LR Centre" varchar(5),
	"LR Champagne-Ardenne" varchar(5),
	"LR Corse" varchar(5),
	"LR Franche Comté" varchar(5),
	"LR Haute Normandie" varchar(5),
	"LR Ile de France" varchar(5),
	"LR Languedoc Roussillon" varchar(5),
	"LR Limousin" varchar(5),
	"LR Lorraine" varchar(5),
	"LR Midi-Pyrénées" varchar(5),
	"LR Nord Pas-de-Calais" varchar(5),
	"LR Pays de la Loire" varchar(5),
	"LR Picardie" varchar(5),
	"LR Poitou-Charentes" varchar(5),
	"LR PACA" varchar(5),
	"LR Rhône Alpes" varchar(5)
);


CREATE TABLE taxonomie.statuts_legaux (
	cdRef integer,
	CDH2 varchar(1),
	CDH4 varchar(1),
	IBE2 varchar(1),
	IBE3 varchar(1),
	IBO2 varchar(1),
	IBOEU varchar(1),
	NM varchar(1),
	NM2 varchar(1)
);


