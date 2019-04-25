-- vue materialisee pour nb obs par type de contact
drop materialized view atlas.vm_contact_types;
CREATE MATERIALIZED VIEW atlas.vm_contact_types as
select 
	s.unique_id_sinp as id,
	case when TRIM(BOTH FROM s.comment_description) ilike '%?%' then 'inconnu'
	when TRIM(BOTH FROM s.comment_description) is NULL then 'non renseigné'
	else TRIM(BOTH FROM s.comment_description) end as contact_type,
	t.cd_ref
from synthese.synthese s
LEFT JOIN taxonomie.taxref t ON s.cd_nom = t.cd_nom
where s.count_min>0;

CREATE UNIQUE INDEX on atlas.vm_contact_types (id);

-- Permissions

ALTER TABLE atlas.vm_contact_types OWNER TO geonatatlasowner;
GRANT ALL ON TABLE atlas.vm_contact_types TO geonatatlasowner;
GRANT SELECT ON TABLE atlas.vm_contact_types TO geonatatlasuser;
;