-- drop materialized view atlas.vm_sources
create materialized view atlas.vm_sources as
select o.id_observation,o.observateurs,s.id_dataset,o.cd_ref
from atlas.vm_observations o
join synthese.synthese s on o.id_observation = s.id_synthese;

CREATE UNIQUE INDEX on atlas.vm_sources (id_observation);

-- Permissions

ALTER TABLE atlas.vm_sources OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_sources TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_sources TO geonatatlasuser;