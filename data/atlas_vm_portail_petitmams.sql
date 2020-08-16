CREATE MATERIALIZED VIEW atlas.vm_nbespece_mailles_petitmams
TABLESPACE pg_default
AS SELECT count(DISTINCT t.cd_ref) AS nb_espece,
    string_agg(DISTINCT t.lb_nom::text, ', '::text) AS liste_espece_scien,
    string_agg(DISTINCT split_part(t.nom_vern::text, ','::text, 1), ', '::text) AS liste_espece_vern,
    string_agg(DISTINCT t.cd_ref::text, ', '::text) AS liste_cd_ref,
    string_agg(DISTINCT obs.observateurs::text, ', '::text) AS liste_observateurs,
    min(obs.dateobs) AS date_min,
    max(obs.dateobs) AS date_max,
    sum(obs.effectif_total) AS eff_tot,
    m.id_maille,
    c.area_code,
    m.geojson_maille
   FROM atlas.vm_observations obs
     JOIN atlas.t_mailles_territoire m ON st_intersects(obs.the_geom_point, m.the_geom)
     JOIN ref_geo.l_areas c ON m.id_maille = c.id_area
     JOIN ( SELECT vm_taxref.cd_ref,
            vm_taxref.nom_vern,
            vm_taxref.lb_nom
           FROM atlas.vm_taxref
          WHERE vm_taxref.cd_nom = vm_taxref.cd_ref) t ON t.cd_ref = obs.cd_ref
  WHERE obs.effectif_total > 0 
  AND obs.cd_ref IN ( select distinct cd_ref from atlas.liste_petits_mams )
  GROUP BY m.id_maille, m.geojson_maille, c.area_code
WITH DATA;

-- View indexes:
CREATE INDEX vm_nbespece_mailles_petitmams_geojson_maille_idx ON atlas.vm_nbespece_mailles_petitmams USING btree (geojson_maille);
CREATE INDEX vm_nbespece_mailles_petitmams_id_maille_idx ON atlas.vm_nbespece_mailles_petitmams USING btree (id_maille);


GRANT SELECT ON TABLE atlas.vm_nbespece_mailles_petitmams TO geonatatlasuser;