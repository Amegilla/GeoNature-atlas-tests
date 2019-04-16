-- drop materialized view atlas.vm_nbespece_mailles;
CREATE MATERIALIZED VIEW atlas.vm_nbespece_mailles as
SELECT count(distinct t.cd_ref) AS nb_espece,
    string_agg(distinct t.lb_nom, ', ') as liste_espece_scien,
    string_agg(distinct t.cd_ref::text, ', ') as liste_cd_ref,
    min(obs.dateobs) as date_min,
    max(obs.dateobs) as date_max,
    m.id_maille,
    c.area_code,
    m.geojson_maille
   FROM atlas.vm_observations obs
     JOIN atlas.t_mailles_territoire m ON st_intersects(obs.the_geom_point, m.the_geom)
     join ref_geo.l_areas c on m.id_maille = c.id_area
     join atlas.vm_taxref t on t.cd_ref = obs.cd_ref
  GROUP BY m.id_maille, m.geojson_maille,c.area_code
WITH DATA;


-- View indexes:
CREATE INDEX vm_nbespece_mailles_geojson_maille_idx ON atlas.vm_nbespece_mailles USING btree (geojson_maille);
CREATE INDEX vm_nbespece_mailles_id_maille_idx ON atlas.vm_nbespece_mailles USING btree (id_maille);


-- Permissions

ALTER TABLE atlas.vm_nbespece_mailles OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_nbespece_mailles TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_nbespece_mailles TO geonatatlasuser;
