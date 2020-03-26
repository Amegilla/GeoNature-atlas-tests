var cities = L.layerGroup();

L.marker([39.61, -105.02]).bindPopup('This is Littleton, CO.').addTo(cities),
	L.marker([39.74, -104.99]).bindPopup('This is Denver, CO.').addTo(cities),
	L.marker([39.73, -104.8]).bindPopup('This is Aurora, CO.').addTo(cities),
	L.marker([39.77, -105.23]).bindPopup('This is Golden, CO.').addTo(cities);


var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

var firstMapTile = L.tileLayer(configuration.MAP.FIRST_MAP.url, {
	attribution: configuration.MAP.FIRST_MAP.attribution,
	minZoom: configuration.MAP.FIRST_MAP.minzoom
	}),
orthoMap = L.tileLayer(configuration.MAP.SECOND_MAP.url, {
	attribution: configuration.MAP.SECOND_MAP.attribution,
	minZoom: configuration.MAP.SECOND_MAP.minzoom
	}),
GoogleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
	attribution: '&copy; GoogleMap',
	minZoom: configuration.MAP.SECOND_MAP.minzoom,
	subdomains : ["mt0", "mt1", "mt2", "mt3"]
	}),
grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', attribution: mbAttr}),
streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11',   attribution: mbAttr});

	var map = L.map('map', {
				crs: L.CRS.EPSG3857,
				center: configuration.MAP.LAT_LONG,
				zoom: 10,
				layers: [firstMapTile]
			});

	var baseLayers = {
				"Grayscale": grayscale,
				"Streets": streets,
				"OpenStreetmap": firstMapTile,
        		"OpenTopomap": orthoMap,
        		"GoogleSatellite" : GoogleSatellite
			};

	var overlays = {
				"Cities": cities
			};

	L.control.layers(baseLayers, overlays).addTo(map);

// essai de comprendre comment accéder au wfs	
// http://ws.carmencarto.fr/WFS/119/fxx_ref?&request=GetFeature&typename=tiger:ms:Znieff1&outputFormat=application/json
//view-source:http://ws.carmencarto.fr/WFS/119/fxx_ref?&SERVICE=WFS&REQUEST=GetCapabilities

// dans qgis par exemple :pagingEnabled='true' restrictToRequestBBOX='1' srsname='EPSG:2154' typename='ms:Znieff1' url='http://ws.carmencarto.fr/WFS/119/fxx_inpn?' version='auto' table="" sql=

//view-source:http://ws.carmencarto.fr/WFS/119/fxx_ref?&SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities


// view-source:http://services.sandre.eaufrance.fr/geo/eth_FXX?REQUEST=getCapabilities&service=WFS&VERSION=1.1.0

	// Couche WFS
	var coucheWFS = new L.WFS({
		url: 'http://services.sandre.eaufrance.fr/geo/eth_FXX?',
		typeNS: 'sa',
		typeName: 'CoursEau2',
		crs: L.CRS.EPSG3857,
		geometryField: 'the_geom',
		style: {
		  color: 'blue',
		  weight: 2
		}
	  }, new L.Format.GeoJSON({crs: L.CRS.EPSG3857})).addTo(map);