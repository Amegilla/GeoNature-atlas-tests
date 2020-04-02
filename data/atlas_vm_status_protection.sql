/*
Construction des vues et tables our l'affichage des statuts de protection sur les fiches espèces

VM pour les statuts réglementaires
VM et table pour les statuts de liste rouge

 */


drop MATERIALIZED VIEW atlas.vm_dhff_pn;
CREATE MATERIALIZED VIEW atlas.vm_dhff_pn
as SELECT DISTINCT t.cd_ref,
    COALESCE(
        CASE
            WHEN p.cd_protection::text ~~ 'CD%'::text THEN 'DHFF'::text
            ELSE NULL::text
        END,
        CASE
            WHEN p.cd_protection::text ~~ 'NM%'::text THEN 'PN'::text
            ELSE NULL::text
        END) AS status,
        COALESCE(
        CASE
            WHEN p.cd_protection::text ~~ 'CD%'::text THEN a.arrete 
            ELSE NULL::text
        END,
        CASE
            WHEN p.cd_protection::text ~~ 'NM%'::text THEN a.arrete 
            ELSE NULL::text
        END) AS arrete,
        COALESCE(
        CASE
            WHEN p.cd_protection::text ~~ 'CD%'::text THEN a.intitule 
            ELSE NULL::text
        END,
        CASE
            WHEN p.cd_protection::text ~~ 'NM%'::text THEN a.intitule 
            ELSE NULL::text
        END) AS intitule,
        COALESCE(
        CASE
            WHEN p.cd_protection::text ~~ 'CD%'::text THEN a.date_arrete::text
            ELSE NULL::text
        END,
        CASE
            WHEN p.cd_protection::text ~~ 'NM%'::text THEN a.date_arrete::text 
            ELSE NULL::text
        END) AS date,
        COALESCE(
        CASE
            WHEN p.cd_protection::text ~~ 'CD%'::text THEN a.url 
            ELSE NULL::text
        END,
        CASE
            WHEN p.cd_protection::text ~~ 'NM%'::text THEN a.url 
            ELSE NULL::text
        END) AS url
   FROM atlas.vm_taxons t
     LEFT JOIN taxonomie.taxref_protection_especes p ON p.cd_nom = t.cd_ref
     LEFT JOIN taxonomie.taxref_protection_articles a ON a.cd_protection = p.cd_protection
  WHERE p.cd_protection::text !~~ 'IB%'::text and p.cd_protection::text !~~ 'NM'::text 
  ORDER BY t.cd_ref;
  
 grant select on table atlas.vm_dhff_pn to geonatatlasuser;
 
-- creation d'une table avec les détail des statuts de la liste rouge en toute lettre :
drop table if exists atlas.lr_text_info;
create table atlas.lr_text_info (statut varchar(3),info text);
grant select on table atlas.lr_text_info to geonatatlasuser;
insert into atlas.lr_text_info (statut,info)
values ('EX', 'Espèce disparue'),
('EW', 'Espèce ayant disparu de la nature et ne survivant qu''en captivité'),
('CR', 'En danger critique d''extinction'),
('EN', 'En danger'),
('VU','Vulnérable'),
('NT','Quasi-menacé'),
('LC','Préoccupation mineure'),
('DD','Données insuffisantes'),
('NE','Non évalué');


-- a mettre a jour à partir de la bdc quand elle sera mise à jour
drop MATERIALIZED view atlas.vm_liste_rouges;
CREATE MATERIALIZED VIEW atlas.vm_liste_rouges
TABLESPACE pg_default
AS SELECT t.cd_ref,
    m."LR Europe" as categorie_lr_europe,
    ieu.info as text_lr_europe, 
    m."LR France" as categorie_lr_france,
    ifr.info as text_lr_france
   FROM atlas.vm_taxons t
     --left JOIN taxonomie.taxref_liste_rouge_fr lr ON lr.cd_ref = t.cd_ref
     left join taxonomie.statuts_moraux m on m.cdref = t.cd_ref 
     left join atlas.lr_text_info ifr on ifr.statut = m."LR France" 
     left join atlas.lr_text_info ieu on ieu.statut = m."LR Europe" 
     --left join atlas.lr_text_info ifr on ifr.statut = lr.id_categorie_france
     --left join atlas.lr_text_info ieu on ieu.statut = lr.categorie_lr_europe
WITH DATA;
 grant select on table atlas.vm_liste_rouges to geonatatlasuser;
refresh  MATERIALIZED VIEW atlas.vm_liste_rouges;

-- on rajoute les statuts pour la loutre
INSERT INTO taxonomie.statuts_moraux
(cdref,  "LR Europe", "LR France")
VALUES(60630, 'NT', 'LC');

-- comparaison des status
select t.nom_vern ,t.cd_ref , lr.categorie_lr_europe ,m."LR Europe" ,lr.id_categorie_france ,m."LR France" 
FROM atlas.vm_taxons t
left JOIN taxonomie.taxref_liste_rouge_fr lr ON lr.cd_ref = t.cd_ref
left join taxonomie.statuts_moraux m on m.cdref = t.cd_ref 
where t.cd_ref =  60630;