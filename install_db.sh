#!/bin/bash

# Make sure only root can run our script
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

. main/configuration/settings.ini

function database_exists () {
    # /!\ Will return false if psql can't list database. Edit your pg_hba.conf as appropriate.
    if [ -z $1 ]
        then
        # Argument is null
        return 0
    else
        # Grep db name in the list of database
        sudo -n -u postgres -s -- psql -tAl | grep -q "^$1|"
        return $?
    fi
}

# Suppression du fichier de log d'installation si il existe d�j� puis cr�ation de ce fichier vide.
rm  -f ./log/install_db.log
touch ./log/install_db.log

# Si la BDD existe, je verifie le parametre qui indique si je dois la supprimer ou non
if database_exists $db_name
then
        if $drop_apps_db
            then
            echo "Suppression de la BDD..."
            sudo -n -u postgres -s dropdb $db_name  &>> log/install_db.log
        else
            echo "La base de donn�es existe et le fichier de settings indique de ne pas la supprimer."
        fi
fi 

# Sinon je cr�� la BDD
if ! database_exists $db_name 
then
	
	echo "Cr�ation de la BDD..."

    sudo -u postgres psql -c "CREATE USER $user_pg WITH PASSWORD '$user_pg_pass' "  &>> log/install_db.log
    sudo -u postgres psql -c "CREATE USER $admin_pg WITH PASSWORD '$admin_pg_pass' "  &>> log/install_db.log
    sudo -n -u postgres -s createdb -O $admin_pg $db_name
    echo "Ajout de postGIS et pgSQL � la base de donn�es"
    sudo -n -u postgres -s psql -d $db_name -c "CREATE EXTENSION IF NOT EXISTS postgis;"  &>> log/install_db.log
    sudo -n -u postgres -s psql -d $db_name -c "CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog; COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';"  &>> log/install_db.log
    # Si j'utilise GeoNature ($geonature_source = True), alors je cr�� les connexions en FWD � la BDD GeoNature
    if $geonature_source
	then
        echo "Ajout du FDW et connexion � la BDD m�re GeoNature"
        sudo -n -u postgres -s psql -d $db_name -c "CREATE EXTENSION IF NOT EXISTS postgres_fdw;"  &>> log/install_db.log
        sudo -n -u postgres -s psql -d $db_name -c "CREATE SERVER geonaturedbserver FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host '$db_source_host', dbname '$db_source_name', port '$db_source_port');"  &>> log/install_db.log
        sudo -n -u postgres -s psql -d $db_name -c "ALTER SERVER geonaturedbserver OWNER TO $admin_pg;"  &>> log/install_db.log
        sudo -n -u postgres -s psql -d $db_name -c "CREATE USER MAPPING FOR $admin_pg SERVER geonaturedbserver OPTIONS (user '$atlas_source_user', password '$atlas_source_pass') ;"  &>> log/install_db.log
    fi

    # Cr�ation des sch�mas de la BDD

    sudo -n -u postgres -s psql -d $db_name -c "CREATE SCHEMA atlas AUTHORIZATION $admin_pg;"  &>> log/install_db.log
	if ($install_taxonomie = false)
	then
        sudo -n -u postgres -s psql -d $db_name -c "CREATE SCHEMA taxonomie AUTHORIZATION $admin_pg;"  &>> log/install_db.log
    fi
	sudo -n -u postgres -s psql -d $db_name -c "CREATE SCHEMA synthese AUTHORIZATION $admin_pg;"  &>> log/install_db.log
    
    # Import du shape des limites du territoire ($limit_shp) dans la BDD / atlas.t_layer_territoire
    ogr2ogr -f "ESRI Shapefile" -t_srs EPSG:3857 data/ref/emprise_territoire_3857.shp $limit_shp
    export PGPASSWORD=$admin_pg_pass;shp2pgsql -W "LATIN1" -s 3857 -D -I ./data/ref/emprise_territoire_3857.shp atlas.t_layer_territoire | psql -h $db_host -U $admin_pg $db_name  &>> log/install_db.log
    rm data/ref/emprise_territoire_3857.*
    # Creation de l'index GIST sur la couche territoire atlas.t_layer_territoire
    export PGPASSWORD=$admin_pg_pass; psql -h $db_host -U $admin_pg -d $db_name -c "CREATE INDEX index_gist_t_layer_territoire
                                                                                    ON atlas.t_layer_territoire
                                                                                    USING gist(geom);
                                                                                    ALTER TABLE atlas.t_layer_territoire RENAME COLUMN geom TO the_geom;"  &>> log/install_db.log
    # Conversion des limites du territoire en json
    rm  -f ./static/custom/territoire.json
    ogr2ogr -f "GeoJSON" -t_srs "EPSG:4326" ./static/custom/territoire.json $limit_shp

    # Import du shape des communes ($communes_shp) dans la BDD (si parametre import_commune_shp = TRUE) / atlas.l_communes
    if $import_commune_shp 
	then
        ogr2ogr -f "ESRI Shapefile" -t_srs EPSG:3857 ./data/ref/communes_3857.shp $communes_shp
        export PGPASSWORD=$admin_pg_pass;shp2pgsql -W "LATIN1" -s 3857 -D -I ./data/ref/communes_3857.shp atlas.l_communes | psql -h $db_host -U $admin_pg $db_name  &>> log/install_db.log
        psql -h $db_host -U $admin_pg $db_name -c "ALTER TABLE atlas.l_communes RENAME COLUMN $colonne_nom_commune TO commune_maj;"  &>> log/install_db.log
        psql -h $db_host -U $admin_pg $db_name -c "ALTER TABLE atlas.l_communes RENAME COLUMN $colonne_insee TO insee;"  &>> log/install_db.log
        psql -h $db_host -U $admin_pg $db_name -c "ALTER TABLE atlas.l_communes RENAME COLUMN geom TO the_geom;"  &>> log/install_db.log
        psql -h $db_host -U $admin_pg $db_name -c "CREATE INDEX index_gist_t_layers_communes
                                                    ON atlas.l_communes USING gist (the_geom);"  &>> log/install_db.log
        rm ./data/ref/communes_3857.*
    fi
    
    echo "Cr�ation de la structure de la BDD..."
    # Si j'utilise GeoNature ($geonature_source = True), alors je cr�� les tables filles en FDW connect�es � la BDD de GeoNature
    if $geonature_source 
	then
        # Creation des tables filles en FWD
        echo "Cr�ation de la connexion a GeoNature"
		sudo cp data/atlas_geonature.sql /tmp/atlas_geonature.sql
        sudo sed -i "s/myuser;$/$admin_pg;/" /tmp/atlas_geonature.sql
        export PGPASSWORD=$admin_pg_pass;psql -h $db_host -U $admin_pg -d $db_name -f /tmp/atlas_geonature.sql  &>> log/install_db.log
    # Sinon je cr�� un table synthese.syntheseff avec 2 observations exemple
	else
		echo "Cr�ation de la table exemple syntheseff"
		psql -h $db_host -U $admin_pg $db_name -c "CREATE TABLE synthese.syntheseff
			(
			  id_synthese serial NOT NULL,
			  id_organisme integer DEFAULT 2,
			  cd_nom integer,
			  insee character(5),
			  dateobs date NOT NULL DEFAULT now(),
			  observateurs character varying(255),
			  altitude_retenue integer,
			  supprime boolean DEFAULT false,
			  the_geom_point geometry('POINT',3857),
			  effectif_total integer
			);
			INSERT INTO synthese.syntheseff 
			  (cd_nom, insee, observateurs, altitude_retenue, the_geom_point, effectif_total)
			  VALUES (67111, 05122, 'Mon observateur', 1254, '0101000020110F0000B19F3DEA8636264124CB9EB2D66A5541', 3);
			INSERT INTO synthese.syntheseff 
			  (cd_nom, insee, observateurs, altitude_retenue, the_geom_point, effectif_total)
			  VALUES (67111, 05122, 'Mon observateur 3', 940, '0101000020110F00001F548906D05E25413391E5EE2B795541', 2);" &>> log/install_db.log
	fi
    
    # Si j'installe le sch�ma taxonomie de TaxHub dans la BDD de GeoNature-atlas ($install_taxonomie = True), alors je r�cup�re les fichiers dans le d�p�t de TaxHub et les �x�cute
    if $install_taxonomie 
	then
        echo "Cr�ation et import du schema taxonomie"
		cd data
		mkdir taxonomie
		cd taxonomie
        wget https://raw.githubusercontent.com/PnX-SI/TaxHub/master/data/taxhubdb.sql
        export PGPASSWORD=$admin_pg_pass;psql -h $db_host -U $admin_pg -d $db_name -f taxhubdb.sql  &>> ../../log/install_db.log
        wget https://github.com/PnX-SI/TaxHub/raw/master/data/inpn/TAXREF_INPN_v9.0.zip
        unzip TAXREF_INPN_v9.0.zip -d /tmp
		wget https://github.com/PnX-SI/TaxHub/raw/master/data/inpn/ESPECES_REGLEMENTEES.zip
		unzip ESPECES_REGLEMENTEES.zip -d /tmp
        wget https://raw.githubusercontent.com/PnX-SI/TaxHub/master/data/inpn/data_inpn_v9_taxhub.sql
        export PGPASSWORD=$admin_pg_pass;psql -h $db_host -U $admin_pg -d $db_name  -f data_inpn_v9_taxhub.sql &>> ../../log/install_db.log
        wget https://raw.githubusercontent.com/PnX-SI/TaxHub/master/data/vm_hierarchie_taxo.sql
        export PGPASSWORD=$admin_pg_pass;psql -h $db_host -U $admin_pg -d $db_name -f vm_hierarchie_taxo.sql  &>> ../../log/install_db.log
        wget https://raw.githubusercontent.com/PnX-SI/TaxHub/master/data/taxhubdata.sql
        export PGPASSWORD=$admin_pg_pass;psql -h $db_host -U $admin_pg -d $db_name -f taxhubdata.sql  &>> ../../log/install_db.log
        rm /tmp/*.txt
        rm /tmp/*.csv
        cd ../..
		rm -R data/taxonomie
    fi
    
    # Creation des Vues Mat�rialis�es (et remplacement �ventuel des valeurs en dur par les param�tres)
    sudo cp data/atlas.sql /tmp/atlas.sql
    sudo sed -i "s/WHERE id_attribut IN (100, 101, 102, 103);$/WHERE id_attribut  IN ($attr_desc, $attr_commentaire, $attr_milieu, $attr_chorologie);/" /tmp/atlas.sql
    sudo sed -i "s/date - 15$/date - $time/" /tmp/atlas.sql
    sudo sed -i "s/date + 15$/date - $time/" /tmp/atlas.sql
    export PGPASSWORD=$admin_pg_pass;psql -h $db_host -U $admin_pg -d $db_name -f /tmp/atlas.sql  &>> log/install_db.log
    
    # Si j'utilise GeoNature ($geonature_source = True), alors je vais ajouter des droits en lecture � l'utilisateur Admin de l'atlas
    if $geonature_source 
	then
        echo "Affectation des droits de lecture sur la BDD source GeoNature..."
        sudo cp data/grant_geonature.sql /tmp/grant_geonature.sql
        sudo sed -i "s/myuser;$/$admin_pg;/" /tmp/grant_geonature.sql
        export PGPASSWORD=$admin_source_pass;psql -h $db_source_host -U $admin_source_user -d $db_source_name -f /tmp/grant_geonature.sql  &>> log/install_db.log
    fi
    
    # Mise en place des mailles
    echo "D�coupage des mailles et creation de la table des mailles"
    
    cd data/ref
    rm -f L93*.dbf L93*.prj L93*.sbn L93*.sbx L93*.shp L93*.shx
    
    # Si je suis en m�tropole (metropole=true), alors j'utilise les mailles fournies par l'INPN
    if $metropole 
	then
        # Je d�zippe mailles fournies par l'INPN aux 3 �chelles
        unzip L93_1K.zip 
        unzip L93_5K.zip 
        unzip L93_10K.zip
        # Je les reprojete les SHP en 3857 et les renomme
        ogr2ogr -f "ESRI Shapefile" -t_srs EPSG:3857 ./mailles_1.shp L93_1x1.shp
        ogr2ogr -f "ESRI Shapefile" -t_srs EPSG:3857 ./mailles_5.shp L93_5K.shp
        ogr2ogr -f "ESRI Shapefile" -t_srs EPSG:3857 ./mailles_10.shp L93_10K.shp
        # J'importe dans la BDD le SHP des mailles � l'�chelle d�finie en parametre ($taillemaille)
        export PGPASSWORD=$admin_pg_pass;shp2pgsql -W "LATIN1" -s 3857 -D -I mailles_$taillemaille.shp atlas.t_mailles_$taillemaille | psql -h $db_host -U $admin_pg $db_name  &>> ../../log/install_db.log
    
        rm mailles_1.* mailles_5.* mailles_10.*

        cd ../../
        
        # Creation de la table atlas.t_mailles_territoire avec la taille de maille pass�e en parametre ($taillemaille). Pour cela j'intersecte toutes les mailles avec mon territoire
        export PGPASSWORD=$admin_pg_pass;psql -h $db_host -U $admin_pg -d $db_name -c "CREATE TABLE atlas.t_mailles_territoire as
                                                    SELECT m.geom AS the_geom, ST_AsGeoJSON(st_transform(t.the_geom, 4326)) as geojson_maille
                                                    FROM atlas.t_mailles_"$taillemaille" m, atlas.t_layer_territoire t
                                                    WHERE ST_Intersects(m.geom, t.the_geom);
                                                    CREATE INDEX index_gist_t_mailles_territoire
                                                    ON atlas.t_mailles_territoire
                                                    USING gist (the_geom); 
                                                    ALTER TABLE atlas.t_mailles_territoire
                                                    ADD COLUMN id_maille serial;
                                                    ALTER TABLE atlas.t_mailles_territoire
                                                    ADD PRIMARY KEY (id_maille);"  &>> log/install_db.log
    
    # Sinon j'utilise un SHP des mailles fournies par l'utilisateur
    else 
        ogr2ogr -f "ESRI Shapefile" -t_srs EPSG:3857 custom_mailles_3857.shp $chemin_custom_maille 
        export PGPASSWORD=$admin_pg_pass;shp2pgsql -W "LATIN1" -s 3857 -D -I custom_mailles_3857.shp atlas.t_mailles_custom | psql -h $db_host -U $admin_pg $db_name  &>> log/install_db.log

        export PGPASSWORD=$admin_pg_pass;psql -h $db_host -U $admin_pg -d $db_name -c "CREATE TABLE atlas.t_mailles_territoire as
                                            SELECT m.geom AS the_geom, ST_AsGeoJSON(st_transform(t.the_geom, 4326))
                                            FROM atlas.t_mailles_custom m, atlas.t_layer_territoire t
                                            WHERE ST_Intersects(m.geom, t.the_geom);
                                            CREATE INDEX index_gist_t_mailles_custom
                                            ON atlas.t_mailles_territoire
                                            USING gist (the_geom); 
                                            ALTER TABLE atlas.t_mailles_territoire
                                            ADD COLUMN id_maille serial;
                                            ALTER TABLE atlas.t_mailles_territoire
                                            ADD PRIMARY KEY (id_maille);"  &>> log/install_db.log
    fi


    echo "Creation de la VM des observations de chaque taxon par mailles..."
    # Cr�ation de la vue mat�rialis�e vm_mailles_observations (nombre d'observations par maille et par taxon)
    export PGPASSWORD=$admin_pg_pass;psql -h $db_host -U $admin_pg -d $db_name -f data/observations_mailles.sql  &>> log/install_db.log

    # Affectation de droits en lecture sur les VM � l'utilisateur de l'application ($user_pg)
    echo "Grant..."
    sudo cp data/grant.sql /tmp/grant.sql
    sudo sed -i "s/my_reader_user;$/$user_pg;/" /tmp/grant.sql
    export PGPASSWORD=$admin_pg_pass;psql -h $db_host -U $admin_pg -d $db_name -f /tmp/grant.sql &>> log/install_db.log
    
    # Affectation de droits en lecture sur les VM � l'utilisateur de l'application ($user_pg)
    cd data/ref
    rm -f L*.shp L*.dbf L*.prj L*.sbn L*.sbx L*.shx output_clip.*
    cd ../..

fi
