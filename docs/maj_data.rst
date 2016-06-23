======================
MISE A JOUR DU CONTENU
======================
.. image:: http://geotrek.fr/images/logo-pne.png
    :target: http://www.ecrins-parcnational.fr

-----


Les donn�es contenues dans les vues mat�rialis�es n'int�grent pas en temps r�el les mises � jours faites dans GeoNature; Pour cela ces vues doivent �tre actualis�es grace � une commande ``refresh``.
Une fonction, g�n�r�e lors de la cr�ation de la base de l'atlas permet de mettre � jour toutes les vues mat�rialis�es du sch�ma atlas.

* Pour lancer manuellement cette fonction, ouvrez une console SQL et ex�cut� la commande suivante :

    ::
        
        SELECT RefreshAllMaterializedViews('atlas');

* Pour automatiser la commande, ajouter la dans le crontab de l'utilisateur root : 

    ::
        sudo crontab -e

    ajouter la ligne suivante en prenant soin de mettre � jour les param�tres de connexion � la base de l'atlas :

    ::
        
        0 4 * * * export PGPASSWORD='monpassachanger';psql -h localhost -U geonatatlas -d geonatureatlas -c "SELECT RefreshAllMateriali$

    Pour enregistrer et sortir : ``ctrl + o`` puis ``ctrl + x``