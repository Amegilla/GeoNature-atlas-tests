
drop materialized view atlas.vm_mailles;
CREATE MATERIALIZED VIEW atlas.vm_mailles AS
SELECT 
c.id_area AS id_maille,
c.area_name,
c.area_code,
st_transform(c.geom, 3857) AS the_geom
FROM ref_geo.l_areas c
JOIN ref_geo.bib_areas_types t ON t.id_type = c.id_type 
WHERE t.type_code::text = 'M10'::text 
;

CREATE UNIQUE INDEX on atlas.vm_mailles (area_code);
CREATE UNIQUE INDEX on atlas.vm_mailles (id_maille);
CREATE INDEX index_gist_vm_mailles_the_geom ON atlas.vm_mailles USING gist (the_geom);

-- Permissions

ALTER TABLE atlas.vm_mailles OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_mailles TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_mailles TO geonatatlasuser;

