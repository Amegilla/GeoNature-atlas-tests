
-- Creation des vues materializees pour le portail chiro, page d'acceuil
drop MATERIALIZED VIEW atlas.vm_nbespece_mailles_chiro;
CREATE MATERIALIZED VIEW atlas.vm_nbespece_mailles_chiro
AS SELECT count(DISTINCT t.cd_ref) AS nb_espece,
    string_agg(DISTINCT t.lb_nom::text, ', '::text) AS liste_espece_scien,
    string_agg(DISTINCT split_part(nom_vern,',', 1)::text, ', '::text) AS liste_espece_vern,
    string_agg(DISTINCT t.cd_ref::text, ', '::text) AS liste_cd_ref,
    min(obs.dateobs) AS date_min,
    max(obs.dateobs) AS date_max,
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
				  WHERE obs.cd_ref in (
					        SELECT * FROM atlas.find_all_taxons_childs(186233)
						    )
						    OR obs.cd_ref = 186233

						  GROUP BY m.id_maille, m.geojson_maille, c.area_code
						WITH DATA;

						-- View indexes:
CREATE INDEX vm_nbespece_mailles_chiro_geojson_maille_idx ON atlas.vm_nbespece_mailles_chiro USING btree (geojson_maille);
CREATE INDEX vm_nbespece_mailles_chiro_id_maille_idx ON atlas.vm_nbespece_mailles_chiro USING btree (id_maille);

-- Permissions

ALTER TABLE atlas.vm_nbespece_mailles_chiro OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_nbespece_mailles_chiro TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_nbespece_mailles_chiro TO geonatatlasuser;

