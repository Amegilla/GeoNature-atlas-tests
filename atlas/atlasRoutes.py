# -*- coding:utf-8 -*-

from flask import render_template, redirect, abort, current_app
from .configuration import config
from .modeles.repositories import (
    vmTaxonsRepository,
    vmObservationsRepository,
    vmAltitudesRepository,
    vmMoisRepository,
    vmYearRepository,
    vmTaxrefRepository,
    vmCommunesRepository,
    vmMaillesRepository,
    vmObservationsMaillesRepository,
    vmMedias,
    vmCorTaxonAttribut,
    vmTaxonsMostView,
)
from . import utils

from flask import Blueprint

main = Blueprint("main", __name__)


@main.route(
    "/espece/" + current_app.config["REMOTE_MEDIAS_PATH"] + "<image>",
    methods=["GET", "POST"],
)
def especeMedias(image):
    return redirect(
        current_app.config["REMOTE_MEDIAS_URL"]
        + current_app.config["REMOTE_MEDIAS_PATH"]
        + image
    )


@main.route(
    "/commune/" + current_app.config["REMOTE_MEDIAS_PATH"] + "<image>",
    methods=["GET", "POST"],
)
def communeMedias(image):
    return redirect(
        current_app.config["REMOTE_MEDIAS_URL"]
        + current_app.config["REMOTE_MEDIAS_PATH"]
        + image
    )


@main.route(
    "/liste/" + current_app.config["REMOTE_MEDIAS_PATH"] + "<image>",
    methods=["GET", "POST"],
)
def listeMedias(image):
    return redirect(
        current_app.config["REMOTE_MEDIAS_URL"]
        + current_app.config["REMOTE_MEDIAS_PATH"]
        + image
    )


@main.route(
    "/groupe/" + current_app.config["REMOTE_MEDIAS_PATH"] + "<image>",
    methods=["GET", "POST"],
)
def groupeMedias(image):
    return redirect(
        current_app.config["REMOTE_MEDIAS_URL"]
        + current_app.config["REMOTE_MEDIAS_PATH"]
        + image
    )


@main.route(
    "/" + current_app.config["REMOTE_MEDIAS_PATH"] + "<image>",
    methods=["GET", "POST"],
)
def indexMedias(image):
    return redirect(
        current_app.config["REMOTE_MEDIAS_URL"]
        + current_app.config["REMOTE_MEDIAS_PATH"]
        + image
    )

###################################################  PAGE D ACCEUIL ############
@main.route("/", methods=["GET", "POST"])
def index():
    session = utils.loadSession()
    connection = utils.engine.connect()

    if current_app.config["AFFICHAGE_MAILLE"]:
        observations = vmObservationsMaillesRepository.lastObservationsMailles(
            connection,
            current_app.config["NB_DAY_LAST_OBS"],
            current_app.config["ATTR_MAIN_PHOTO"],
        )
    else:
        observations = vmObservationsRepository.lastObservations(
            connection,
            current_app.config["NB_DAY_LAST_OBS"],
            current_app.config["ATTR_MAIN_PHOTO"],
        )

    mostViewTaxon = vmTaxonsMostView.mostViewTaxon(connection)
    stat = vmObservationsRepository.statIndex(connection)
    customStat = vmObservationsRepository.genericStat(
        connection, current_app.config["RANG_STAT"]
    )
    customStatMedias = vmObservationsRepository.genericStatMedias(
        connection, current_app.config["RANG_STAT"]
    )

    connection.close()
    session.close()

    return render_template(
        "templates/index.html",
        observations=observations,
        mostViewTaxon=mostViewTaxon,
        stat=stat,
        customStat=customStat,
        customStatMedias=customStatMedias,
    )
################################################################################ PORTAIL CHIRO

@main.route("/portail_chiro", methods=["GET", "POST"])
def portail_chiro():
    session = utils.loadSession()
    connection = utils.engine.connect()

    if current_app.config["AFFICHAGE_MAILLE"]:
        observations = vmObservationsMaillesRepository.lastObservationsMailles(
            connection,
            current_app.config["NB_DAY_LAST_OBS"],
            current_app.config["ATTR_MAIN_PHOTO"],
        )
    else:
        observations = vmObservationsRepository.lastObservations(
            connection,
            current_app.config["NB_DAY_LAST_OBS"],
            current_app.config["ATTR_MAIN_PHOTO"],
        )

    mostViewTaxon = vmTaxonsMostView.mostViewTaxon(connection)
    stat = vmObservationsRepository.statIndex(connection)
    customStat = vmObservationsRepository.genericStat(
        connection, current_app.config["RANG_STAT"]
    )
    customStatMedias = vmObservationsRepository.genericStatMedias(
        connection, current_app.config["RANG_STAT"]
    )

    connection.close()
    session.close()

    return render_template(
        "templates/portail_chiro.html",
        observations=observations,
        mostViewTaxon=mostViewTaxon,
        stat=stat,
        customStat=customStat,
        customStatMedias=customStatMedias,
    )
#-------------------------------------------------------------------------------# PORTAIL LOUTRE
@main.route("/portail_loutre", methods=["GET", "POST"])
def portail_loutre():
    session = utils.loadSession()
    connection = utils.engine.connect()

    cd_ref = int(60630)
    taxon = vmTaxrefRepository.searchEspece(connection, cd_ref)
    altitudes = vmAltitudesRepository.getAltitudesChilds(connection, cd_ref)
    months = vmMoisRepository.getMonthlyObservationsChilds(connection, cd_ref)
    synonyme = vmTaxrefRepository.getSynonymy(connection, cd_ref)
    communes = vmCommunesRepository.getCommunesObservationsChilds(connection, cd_ref)
    mailles = vmMaillesRepository.getMaillesObservationsChilds(connection, cd_ref)
    taxonomyHierarchy = vmTaxrefRepository.getAllTaxonomy(session, cd_ref)
    firstPhoto = vmMedias.getFirstPhoto(
        connection, cd_ref, current_app.config["ATTR_MAIN_PHOTO"]
    )
    photoCarousel = vmMedias.getPhotoCarousel(
        connection, cd_ref, current_app.config["ATTR_OTHER_PHOTO"]
    )
    videoAudio = vmMedias.getVideo_and_audio(
        connection,
        cd_ref,
        current_app.config["ATTR_AUDIO"],
        current_app.config["ATTR_VIDEO_HEBERGEE"],
        current_app.config["ATTR_YOUTUBE"],
        current_app.config["ATTR_DAILYMOTION"],
        current_app.config["ATTR_VIMEO"],
    )
    articles = vmMedias.getLinks_and_articles(
        connection,
        cd_ref,
        current_app.config["ATTR_LIEN"],
        current_app.config["ATTR_PDF"],
    )
    taxonDescription = vmCorTaxonAttribut.getAttributesTaxon(
        connection,
        cd_ref,
        # current_app.config["ATTR_DESC"],
        # current_app.config["ATTR_COMMENTAIRE"],
        # current_app.config["ATTR_MILIEU"],
        # current_app.config["ATTR_CHOROLOGIE"],
        current_app.config["ATTR_DESC"],
        current_app.config["ATTR_HABITATS"],
        current_app.config["ATTR_AIRE"],
        current_app.config["ATTR_POP"],
        current_app.config["ATTR_MENACES"],
    )
    observers = vmObservationsRepository.getObservers(connection, cd_ref)
    
    connection.close()
    session.close()

    return render_template(
        "templates/ficheEspece_loutre.html",
        taxon=taxon,
        listeTaxonsSearch=[],
        observations=[],
        cd_ref=cd_ref,
        altitudes=altitudes,
        months=months,
        synonyme=synonyme,
        communes=communes,
        mailles=mailles,
        taxonomyHierarchy=taxonomyHierarchy,
        firstPhoto=firstPhoto,
        photoCarousel=photoCarousel,
        videoAudio=videoAudio,
        articles=articles,
        taxonDescription=taxonDescription,
        observers=observers,
    )
#-------------------------------------------------------------------------------#


################################################################################
@main.route("/espece/<int:cd_ref>", methods=["GET", "POST"])
def ficheEspece(cd_ref):
    session = utils.loadSession()
    connection = utils.engine.connect()

    cd_ref = int(cd_ref)
    taxon = vmTaxrefRepository.searchEspece(connection, cd_ref)
    altitudes = vmAltitudesRepository.getAltitudesChilds(connection, cd_ref)
    months = vmMoisRepository.getMonthlyObservationsChilds(connection, cd_ref)

    if current_app.config["AFFICHAGE_GRAPH_ANNEE_ESPECE"]:
        years = vmYearRepository.getYearlyObservationsChilds(connection, cd_ref)
    else :
        years = None

    if current_app.config["AFFICHAGE_GRAPH_SOURCE_ESPECE"] and cd_ref != 60630:
        sources = vmObservationsRepository.getSources(connection, cd_ref)
    elif current_app.config["AFFICHAGE_GRAPH_SOURCE_ESPECE"] and cd_ref == 60630:
        sources = vmObservationsRepository.getSources_lulu(connection)
    else :
        sources = None

    if current_app.config["AFFICHAGE_GRAPH_CONTACTTYPE_ESPECE"]:
        contacttypes = vmObservationsRepository.getContactTypes(connection, cd_ref)
    else :
        contacttypes = None

    synonyme = vmTaxrefRepository.getSynonymy(connection, cd_ref)
    communes = vmCommunesRepository.getCommunesObservationsChilds(connection, cd_ref)
    mailles = vmMaillesRepository.getMaillesObservationsChilds(connection, cd_ref)
    taxonomyHierarchy = vmTaxrefRepository.getAllTaxonomy(session, cd_ref)
    firstPhoto = vmMedias.getFirstPhoto(
        connection, cd_ref, current_app.config["ATTR_MAIN_PHOTO"]
    )
    photoCarousel = vmMedias.getPhotoCarousel(
        connection, cd_ref, current_app.config["ATTR_OTHER_PHOTO"]
    )
    videoAudio = vmMedias.getVideo_and_audio(
        connection,
        cd_ref,
        current_app.config["ATTR_AUDIO"],
        current_app.config["ATTR_VIDEO_HEBERGEE"],
        current_app.config["ATTR_YOUTUBE"],
        current_app.config["ATTR_DAILYMOTION"],
        current_app.config["ATTR_VIMEO"],
    )
    articles = vmMedias.getLinks_and_articles(
        connection,
        cd_ref,
        current_app.config["ATTR_LIEN"],
        current_app.config["ATTR_PDF"],
    )
    taxonDescription = vmCorTaxonAttribut.getAttributesTaxon(
        connection,
        cd_ref,
        current_app.config["ATTR_DESC"],
        current_app.config["ATTR_HABITATS"],
        current_app.config["ATTR_AIRE"],
        current_app.config["ATTR_POP"],
        current_app.config["ATTR_MENACES"],
    )
    observers = vmObservationsRepository.getObservers(connection, cd_ref)
    connection.close()
    session.close()

    html_template = "templates/ficheEspece.html"
    if cd_ref == 60630:
        html_template = "templates/ficheEspece_loutre.html"

    return render_template(
        html_template,
        taxon=taxon,
        listeTaxonsSearch=[],
        observations=[],
        cd_ref=cd_ref,
        altitudes=altitudes,
        months=months,
        years=years,
        synonyme=synonyme,
        communes=communes,
        mailles=mailles,
        taxonomyHierarchy=taxonomyHierarchy,
        firstPhoto=firstPhoto,
        photoCarousel=photoCarousel,
        videoAudio=videoAudio,
        articles=articles,
        taxonDescription=taxonDescription,
        observers=observers,
        sources=sources,
        contacttypes=contacttypes,
    )


@main.route("/commune/<insee>", methods=["GET", "POST"])
def ficheCommune(insee):
    session = utils.loadSession()
    connection = utils.engine.connect()

    listTaxons = vmTaxonsRepository.getTaxonsCommunes(connection, insee)
    commune = vmCommunesRepository.getCommuneFromInsee(connection, insee)
    if current_app.config["AFFICHAGE_MAILLE"]:
        observations = vmObservationsMaillesRepository.lastObservationsCommuneMaille(
            connection, current_app.config["NB_LAST_OBS"], insee
        )
    else:
        observations = vmObservationsRepository.lastObservationsCommune(
            connection, current_app.config["NB_LAST_OBS"], insee
        )

    observers = vmObservationsRepository.getObserversCommunes(connection, insee)

    session.close()
    connection.close()

    return render_template(
        "templates/ficheCommune.html",
        listTaxons=listTaxons,
        referenciel=commune,
        observations=observations,
        observers=observers,
        DISPLAY_EYE_ON_LIST=True,
    )


@main.route("/liste/<cd_ref>", methods=["GET", "POST"])
def ficheRangTaxonomie(cd_ref):
    session = utils.loadSession()
    connection = utils.engine.connect()

    listTaxons = vmTaxonsRepository.getTaxonsChildsList(connection, cd_ref)
    referenciel = vmTaxrefRepository.getInfoFromCd_ref(session, cd_ref)
    taxonomyHierarchy = vmTaxrefRepository.getAllTaxonomy(session, cd_ref)
    observers = vmObservationsRepository.getObservers(connection, cd_ref)

    connection.close()
    session.close()

    return render_template(
        "templates/ficheRangTaxonomique.html",
        listTaxons=listTaxons,
        referenciel=referenciel,
        taxonomyHierarchy=taxonomyHierarchy,
        observers=observers,
        DISPLAY_EYE_ON_LIST=False,
    )


@main.route("/groupe/<groupe>", methods=["GET", "POST"])
def ficheGroupe(groupe):
    session = utils.loadSession()
    connection = utils.engine.connect()

    groups = vmTaxonsRepository.getAllINPNgroup(connection)
    listTaxons = vmTaxonsRepository.getTaxonsGroup(connection, groupe)
    observers = vmObservationsRepository.getGroupeObservers(connection, groupe)

    session.close()
    connection.close()

    return render_template(
        "templates/ficheGroupe.html",
        listTaxons=listTaxons,
        referenciel=groupe,
        groups=groups,
        observers=observers,
        DISPLAY_EYE_ON_LIST=False,
    )


@main.route("/photos", methods=["GET", "POST"])
def photos():
    session = utils.loadSession()
    connection = utils.engine.connect()

    groups = vmTaxonsRepository.getINPNgroupPhotos(connection)

    session.close()
    connection.close()
    return render_template("templates/galeriePhotos.html", groups=groups)


@main.route("/<page>", methods=["GET", "POST"])
def get_staticpages(page):
    session = utils.loadSession()
    if page not in current_app.config["STATIC_PAGES"]:
        abort(404)
    static_page = current_app.config["STATIC_PAGES"][page]
    session.close()
    return render_template(static_page["template"])



@main.route("/test_carto", methods=["GET", "POST"])
def test_carto():
    
    html_template = "templates/test_carto.html"
    return render_template(html_template)




@main.route("/portal/<portal_name>", methods=["GET", "POST"])
def fiche_portail(portal_name):
    '''
    La page portail se base sur la fiche espèce avec agglomération de taxons
    il faut donc associer le portail à un cd_ref (dans la config)
    Le but est d'avoir sur cette page :
    - info taxonomique (on garde l'encart des fiches espèces, avec nombre de taxons inférieurs)
    - liste d'espèces (on garde le bouton taxons inférieurs, on renomme juste ce bouton et on ajoute vigenttes photo dans la liste comme ce qui est fait sur les pages listes)
    - cartographie avec nb d'espèces par maille / ou par commune    voir mapMailles.js
    - cartographie avec nb d'obs par maille / ou par commune
    - graphique avec observation par années
    - graphique camenbert selon sources
    - les X espèces observés dans les X derniers jours comme sur page d'accueil.

    pour les medias on charge les medias du cd_nom
    '''
      
    session = utils.loadSession()
    connection = utils.engine.connect()

    # recupere les infos du portail depuis le dictionnaire de config.py
    portal_page = current_app.config["PORTAL_PAGES"][portal_name]
    # recupere le cd_ref dans la config du portail
    cd_ref = portal_page['cd_ref']
    cd_ref = int(cd_ref)
    # on récupère les informations taxonomiques
    taxon = vmTaxrefRepository.searchEspece(connection, cd_ref)

    altitudes = vmAltitudesRepository.getAltitudesChilds(connection, cd_ref)
    months = vmMoisRepository.getMonthlyObservationsChilds(connection, cd_ref)

    if current_app.config["AFFICHAGE_GRAPH_ANNEE_ESPECE"]:
        years = vmYearRepository.getYearlyObservationsChilds(connection, cd_ref)
    else :
        years = None

    if current_app.config["AFFICHAGE_GRAPH_SOURCE_ESPECE"] and cd_ref != 60630:
        sources = vmObservationsRepository.getSources(connection, cd_ref)
    elif current_app.config["AFFICHAGE_GRAPH_SOURCE_ESPECE"] and cd_ref == 60630:
        sources = vmObservationsRepository.getSources_lulu(connection)
    else :
        sources = None

    if current_app.config["AFFICHAGE_GRAPH_CONTACTTYPE_ESPECE"]:
        contacttypes = vmObservationsRepository.getContactTypes(connection, cd_ref)
    else :
        contacttypes = None

    synonyme = vmTaxrefRepository.getSynonymy(connection, cd_ref)
    communes = vmCommunesRepository.getCommunesObservationsChilds(connection, cd_ref)
    mailles = vmMaillesRepository.getMaillesObservationsChilds(connection, cd_ref)
    taxonomyHierarchy = vmTaxrefRepository.getAllTaxonomy(session, cd_ref)
    firstPhoto = vmMedias.getFirstPhoto(
        connection, cd_ref, current_app.config["ATTR_MAIN_PHOTO"]
    )
    photoCarousel = vmMedias.getPhotoCarousel(
        connection, cd_ref, current_app.config["ATTR_OTHER_PHOTO"]
    )
    videoAudio = vmMedias.getVideo_and_audio(
        connection,
        cd_ref,
        current_app.config["ATTR_AUDIO"],
        current_app.config["ATTR_VIDEO_HEBERGEE"],
        current_app.config["ATTR_YOUTUBE"],
        current_app.config["ATTR_DAILYMOTION"],
        current_app.config["ATTR_VIMEO"],
    )
    articles = vmMedias.getLinks_and_articles(
        connection,
        cd_ref,
        current_app.config["ATTR_LIEN"],
        current_app.config["ATTR_PDF"],
    )
    taxonDescription = vmCorTaxonAttribut.getAttributesTaxon(
        connection,
        cd_ref,
        current_app.config["ATTR_DESC"],
        current_app.config["ATTR_HABITATS"],
        current_app.config["ATTR_AIRE"],
        current_app.config["ATTR_POP"],
        current_app.config["ATTR_MENACES"],
    )
    observers = vmObservationsRepository.getObservers(connection, cd_ref)

    connection.close()
    session.close()

    return render_template(
        "templates/portal.html",
        taxon=taxon,
        listeTaxonsSearch=[],
        observations=[],
        cd_ref=cd_ref,
        altitudes=altitudes,
        months=months,
        years=years,
        synonyme=synonyme,
        communes=communes,
        mailles=mailles,
        taxonomyHierarchy=taxonomyHierarchy,
        firstPhoto=firstPhoto,
        photoCarousel=photoCarousel,
        videoAudio=videoAudio,
        articles=articles,
        taxonDescription=taxonDescription,
        observers=observers,
        sources=sources,
        contacttypes=contacttypes,
    )