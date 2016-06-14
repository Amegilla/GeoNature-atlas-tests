============
INSTALLATION
============
.. image:: http://geotrek.fr/images/logo-pne.png
    :target: http://www.ecrins-parcnational.fr

-----

Pr�requis
=========

Application d�velopp�e et install�e sur un serveur contenant :

- Ubuntu 14.04
- PostgreSQL 9.1
- PostGIS 1.5
- Apache

Installation de PostgreSQL
==============================

Voir commandes GeoNature, dbhost ?, utilisateur geonatatlas obligatoire ???

Installation de l'application
=============================

* R�cup�rer le zip de l�application sur le Github du projet (`X.Y.Z � remplacer par le num�ro de version souhait�e <https://github.com/PnEcrins/GeoNature-atlas/releases>`_), d�zippez le dans le r�pertoire de l'utilisateur linux du serveur puis copiez le dans le r�pertoire de l�utilisateur linux :
 
  ::  
  
        cd /home/synthese
        wget https://github.com/PnEcrins/GeoNature-atlas/archive/vX.Y.Z.zip
        unzip vX.Y.Z.zip
        mv GeoNature-X.Y.Z/ geonature/

        
Configuration de la base de donn�es PostgreSQL
==============================================

* Se positionner dans le r�pertoire de l'application ; par exemple ``geonatureatlas`` :
 
  ::  
  
	cd geonatureatlas
        
* Copier et renommer le fichier ``config/settings.ini.sample`` en ``config/settings.ini`` :
 
  ::  
  
        cp config/settings.ini.sample config/settings.ini

* Mettre � jour le fichier ``config/settings.ini`` avec vos param�tres de connexion � la BDD :
 
  ::  
  
	nano config/settings.ini

Renseigner le nom de la base de donn�es, les utilisateurs PostgreSQL et les mots de passe. Il est possible mais non conseill� de laisser les valeurs propos�es par d�faut. 

???? ATTENTION : Les valeurs renseign�es dans ce fichier sont utilis�es par le script d'installation de la base de donn�es ``install_db.sh``. Les utilisateurs PostgreSQL doivent �tre en concordance avec ceux cr��s lors de la derni�re �tape de l'installation du serveur 

???? Param�trer si on veut cr�er la BDD fille bas�e sur GeoNature ou si on veut juste le sch�ma atlas dont on adaptera les vues � son contexte.

???? Je capte pas bien le fichier settings.ini. Et si une structure n'utilise par GeoNature que faire des hosts de la BDD m�re ???

Cr�ation de la base de donn�es
==============================

Par d�faut, la BDD a �t� con�ue pour s'appuyer sur les donn�es pr�sentes dans GeoNature (https://github.com/PnEcrins/GeoNature). 

Pour cela une BDD fille de GeoNature est cr��e dans GeoNature-atlas avec les sch�mas utiles � l'atlas (``synthese``, ``taxonomie``, ``layers``, ``utilisateurs``), aliment�e grace � un Foreign Data Wrapper (http://docs.postgresqlfr.org/9.2/sql-createforeigndatawrapper.html).

Cela permet de cr�er un lien dynamique entre les 2 bases de donn�es. A chaque fois qu'une requ�te est �xecut�e dans une table de l'atlas (BDD fille), le FWD permet d'interroger directement dans le BDD m�re (celle de GeoNature) et ainsi d'avoir les donn�es � jour en temps r�el. 

N�anmoins pour plus de g�n�ricit� et permettre � une structure d'utiliser GeoNature-atls sans disposer de GeoNature, l'application ne requ�te jamais directement dans ces sch�mas li�s � GeoNature. 

En effet elle requ�te uniquement sur des vues cr��es dans le sch�ma sp�cifique ``atlas``.

Ainsi ces vues peuvent �tre adapt�es � volont� pour interroger d'autre sources de donn�es que GeoNature, � partir du moment o� elles retournent les m�mes champs. 

Dans un soucis de performance et pour ne pas requ�ter en permanence sur le base m�re GeoNature, nous avons mis en place des vues mat�rialis�es (http://docs.postgresqlfr.org/9.3/rules-materializedviews.html) pour que les donn�es soient pr�calcul�es, ind�x�es et pr�sentes directement dans le sch�ma ``atlas``. 

**Liste des vues** :

- atlas.vm_taxref qui renvoie toutes les donn�es de taxonomie.vm_taxref.
    Champs � pr�ciser pour ceux qui n'ont pas taxonomie.vm_taxref

- atlas.vm_observations qui renvoie la liste de toutes les observations.
    Champs � renommer et supprimer dans la vue par d�faut. 
    
- atlas.vm_taxons qui renvoie la liste des taxons observ�s au moins une fois sur le territoire.

- atlas.vm_altitudes qui renvoie le nombre d'observations pour chaque classe d'altitude et chaque taxon.

- atlas.vm_phenologies qui renvoie le nombre d'observations pour chaque mois et chaque taxon.

Ins�rer un schema des BDD.

* Lancer le script automatique de cr�ation de la BDD
 
  ::  
  
        sudo ./install_db.sh
        
* Vous pouvez consulter le log de cette installation de la base dans ``log/install_db.log`` et v�rifier qu'aucune erreur n'est intervenue. **Attention, ce fichier sera supprim�** lors de l'ex�cution de ``install_app.sh``

#################################
        
**Connexion � la base de donn�es** 

Cr�ez un fichier de configuration � partir du fichier d'exemple :
::
        cp config/config.py.sample config/config.py

Renseignez vos informations de connexion dans le fichier ``config/config.py``.


**Configuration Apache** 

???? Partir de doc GeoSites ou doc GeoNature pour Apache ???

Cr�ez un fichier de configuration apache ``.htaccess`` � partir du fichier d'exemple :
::
        cp .htaccess.sample .htaccess

Si l'url de votre application n'est pas celle de votre domaine (ou sous domaine), modifiez la partie 
::
        RewriteBase / 

Et indiquez le chemin apr�s le ``/``. Par exemple si votre application se trouve � cette url ``http://mondomaine/atlas``, modifiez la variable ``RewriteBase`` ainsi
::
       RewriteBase /atlas/ 
       

Personnalisation de l'application
=================================

* Cr�ez un fichier de configuration de l'application � partir du fichier d'exemple :

::
        cp static/conf/custom.sample.js static/conf/custom.js

* Adapter le contenu du fichier ``static/conf/custom.js``
        
* Modifier �ventuellement les vues dans le sch�ma ``atlas``

Vous pouvez alimenter l'atlas avec une autre source de donn�es que GeoNature � condition de respecter le nom des champs retourn�s par la vue.

Ou vous simplement d�cider de l'adapter � votre GeoNature par exemple en changeant l'``id_organisme`` dont vous souhaitez afficher les donn�es dans la condition WHERE de ``atlas.vm_observations``.

Modifiez les images dans le r�pertoire ``/static/images/``.

!!!! Dissocier les images de l'atlas (pictos, boutons...), les images li�es � la custo (� mettre dans un dossier � part comme /medias/, voir Geotrek et les images li�es au contenu)

Vous pouvez modifier les pages d'information en �ditant les fichiers HTML dans le r�pertoire ``/templates/`` et notamment, adaptez le contenu des fichiers :

!!!!! Modifier le texte de pr�sentation g�n�rale, quelques labels dans une surcouche ???

!!!!! Pensez � la proc�dure de mise � jour de l'appli et regrouper le plus possibl les fichiers de customisation et de surcouche pour les rapatrier facilement au moment d'une mise � jour. 
    

D�veloppement
=============

G�n�ricit� � compl�ter...