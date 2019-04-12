-- drop materialized view atlas.vm_nbespece_mailles;
CREATE MATERIALIZED VIEW atlas.vm_nbespece_mailles
TABLESPACE pg_default
AS SELECT count(*) AS nb_espece,
    obs.dateobs,
    m.id_maille,
    m.the_geom,
    m.geojson_maille
   FROM atlas.vm_observations obs
     JOIN atlas.t_mailles_territoire m ON st_intersects(obs.the_geom_point, m.the_geom)
  GROUP BY obs.cd_ref, m.id_maille, m.the_geom, m.geojson_maille,obs.dateobs
WITH DATA;

-- View indexes:
CREATE INDEX index_gist_atlas_vm_nbespece_mailles_geom ON atlas.vm_nbespece_mailles USING gist (the_geom);
CREATE INDEX vm_nbespece_mailles_geojson_maille_idx ON atlas.vm_nbespece_mailles USING btree (geojson_maille);
CREATE INDEX vm_nbespece_mailles_id_maille_idx ON atlas.vm_nbespece_mailles USING btree (id_maille);


-- Permissions

ALTER TABLE atlas.vm_nbespece_mailles OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_nbespece_mailles TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_nbespece_mailles TO geonatatlasuser;
