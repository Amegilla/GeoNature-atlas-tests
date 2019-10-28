
# -*- coding:utf-8 -*-

from flask import jsonify, Blueprint, request, current_app
from werkzeug.wrappers import Response
from . import utils
from .modeles.repositories import (
    vmSearchTaxonRepository, 
    vmObservationsRepository,
    vmObservationsMaillesRepository, 
    vmObservationsEspecesMaillesGlobalRepository, 
    vmMedias, 
    vmCommunesRepository,
    vmMaillesRepository,
    vm_lulu_morta_Repository
)
from .configuration import config

api = Blueprint('api', __name__)


@api.route('/searchTaxon/', methods=['GET'])
def searchTaxonAPI():
    session = utils.loadSession()
    search = request.args.get('search')
    limit = request.args.get('limit', 50)
    results = vmSearchTaxonRepository.listeTaxonsSearch(session, search, limit)
    session.close()
    return jsonify(results)


@api.route('/searchCommune/', methods=['GET'])
def searchCommuneAPI():
    session = utils.loadSession()
    search = request.args.get('search')
    limit = request.args.get('limit', 50)
    results = vmCommunesRepository.getCommunesSearch(session, search, limit)
    return jsonify(results)

@api.route('/searchMaille/', methods=['GET'])
def searchMailleAPI():
    session = utils.loadSession()
    search = request.args.get('search')
    limit = request.args.get('limit', 50)
    results = vmMaillesRepository.getMaillesSearch(session, search, limit)
    return jsonify(results)

@api.route('/observationsMailleAndPoint/<int:cd_ref>', methods=['GET'])
def getObservationsMailleAndPointAPI(cd_ref):
    connection = utils.engine.connect()
    observations = {
        'point': vmObservationsRepository.searchObservationsChilds(connection, cd_ref),
        'maille': vmObservationsMaillesRepository.getObservationsMaillesChilds(connection, cd_ref)
    }
    connection.close()
    return jsonify(observations)

@api.route('/observationsMailleAndPoint_lulu_morta/', methods=['GET'])
def getObservationsMailleAndPointAPI_lulu_morta():
    connection = utils.engine.connect()
    observations = {
        'point': vm_lulu_morta_Repository.searchObservationsChilds(connection),
        'maille': vm_lulu_morta_Repository.getObservationsMaillesChilds(connection)
    }
    connection.close()
    return jsonify(observations)

@api.route('/observationsMaille/<int:cd_ref>', methods=['GET'])
def getObservationsMailleAPI(cd_ref):
    connection = utils.engine.connect()
    observations = vmObservationsMaillesRepository.getObservationsMaillesChilds(connection, cd_ref)
    connection.close()
    return jsonify(observations)

# api pour la carte de la page d'accueil avec nombre d'espece par maille
@api.route('/observationsEspecesMailleGlobal', methods=['GET'])
def getObservationsEspecesMailleGlobalAPI():
    connection = utils.engine.connect()
    observations = vmObservationsEspecesMaillesGlobalRepository.getObservationsMaillesChilds(connection)
    connection.close()
    return jsonify(observations)

# api pour la carte de la page portail chiro avec nombre d'espece par maille pour les chiro
@api.route('/observationsEspecesMailleGlobalchiro', methods=['GET'])
def getObservationsEspecesMailleGlobalAPI_chiro():
    connection = utils.engine.connect()
    observations = vmObservationsEspecesMaillesGlobalRepository.getObservationsMaillesChilds_chiro(connection)
    connection.close()
    return jsonify(observations)

# api pour la carte de la pageportail chiro avec nombre d'espece par maille pour les chiro annexeII
@api.route('/observationsEspecesMailleGlobalchiroannexeII', methods=['GET'])
def getObservationsEspecesMailleGlobalAPI_chiro_annexeII():
    connection = utils.engine.connect()
    observations = vmObservationsEspecesMaillesGlobalRepository.getObservationsMaillesChilds_chiro_annexeII(connection)
    connection.close()
    return jsonify(observations)

# api pour la carte de la page portail chiro avec nombre d'espece par maille pour les chiro EN + CR
@api.route('/observationsEspecesMailleGlobalchiroCREN', methods=['GET'])
def getObservationsEspecesMailleGlobalAPI_chiro_CR_EN():
    connection = utils.engine.connect()
    observations = vmObservationsEspecesMaillesGlobalRepository.getObservationsMaillesChilds_chiro_CR_EN(connection)
    connection.close()
    return jsonify(observations)

# api pour la carte de la page portail chiro avec nombre d'espece par maille pour les chiro VU
@api.route('/observationsEspecesMailleGlobalchiroVU', methods=['GET'])
def getObservationsEspecesMailleGlobalAPI_chiro_VU():
    connection = utils.engine.connect()
    observations = vmObservationsEspecesMaillesGlobalRepository.getObservationsMaillesChilds_chiro_VU(connection)
    connection.close()
    return jsonify(observations)

@api.route('/observationsPoint/<int:cd_ref>', methods=['GET'])
def getObservationsPointAPI(cd_ref):
    connection = utils.engine.connect()
    observations = vmObservationsRepository.searchObservationsChilds(connection, cd_ref)
    connection.close()
    return jsonify(observations)


@api.route('/observations/<insee>/<int:cd_ref>', methods=['GET'])
def getObservationsCommuneTaxonAPI(insee, cd_ref):
    connection = utils.engine.connect()
    observations = vmObservationsRepository.getObservationTaxonCommune(connection, insee, cd_ref)
    connection.close()
    return jsonify(observations)


@api.route('/observationsMaille/<insee>/<int:cd_ref>', methods=['GET'])
def getObservationsCommuneTaxonMailleAPI(insee, cd_ref):
    connection = utils.engine.connect()
    observations = vmObservationsMaillesRepository.getObservationsTaxonCommuneMaille(connection, insee, cd_ref)
    connection.close()
    return jsonify(observations)


@api.route('/photoGroup/<group>', methods=['GET'])
def getPhotosGroup(group):
    connection = utils.engine.connect()
    photos = vmMedias.getPhotosGalleryByGroup(
        connection, 
        current_app.config['ATTR_MAIN_PHOTO'], 
        current_app.config['ATTR_OTHER_PHOTO'], 
        group
    )
    connection.close()
    return jsonify(photos)


@api.route('/photosGallery', methods=['GET'])
def getPhotosGallery():
    connection = utils.engine.connect()
    photos = vmMedias.getPhotosGallery(
        connection, 
        current_app.config['ATTR_MAIN_PHOTO'], 
        current_app.config['ATTR_OTHER_PHOTO']
    )
    connection.close()
    return jsonify(photos)
