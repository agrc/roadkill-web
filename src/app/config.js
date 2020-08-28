define([
    'dojo/has',
    'dojo/request/xhr',

    'esri/config'
], function (
    has,
    xhr,

    esriConfig
) {
    var ROADKILL = {
        version: '3.1.2-5'
    };
    ROADKILL.server = document.location.protocol + '//' + document.domain;
    ROADKILL.baseUrl = ROADKILL.server + '/arcgis/rest/services/Roadkill';
    ROADKILL.toolboxUrlBase = ROADKILL.baseUrl + '/Toolbox/GPServer';
    ROADKILL.gpDownloadUrl = ROADKILL.toolboxUrlBase + '/DownloadData';
    ROADKILL.rkMapServiceUrl = ROADKILL.baseUrl + '/MapService/MapServer';
    ROADKILL.clusterLayerUrl = ROADKILL.rkMapServiceUrl + '/0';
    ROADKILL.rkFeatureServiceUrl = ROADKILL.baseUrl + '/MapService/FeatureServer/0';
    ROADKILL.rkFeatureServiceAddFeaturesUrl = ROADKILL.baseUrl + '/FeatureService/FeatureServer/0/addFeatures';
    ROADKILL.geometryServiceUrl = '/ArcGIS/rest/services/Geometry/GeometryServer';
    ROADKILL.gpPrintUrl = ROADKILL.toolboxUrlBase + '/Print';
    ROADKILL.rkPointsLayerUrl = ROADKILL.baseUrl + '/Overlays/MapServer';
    // AGOL item: https://uplan.maps.arcgis.com/home/item.html?id=438edcd44f7b466aa4a50bea48cb514c
    ROADKILL.contractedRoutesLayerUrl = 'https://services.arcgis.com/pA2nEVnB6tquxgOW/arcgis/rest/services/CarcassRemovalContracts/FeatureServer/0';
    ROADKILL.measureToGeometryUrl = 'https://maps.udot.utah.gov/randh/rest/services/ALRS/MapServer/exts/LRSServer/networkLayers/0/measureToGeometry';

    ROADKILL.fields = {
        REPORT_DATE: 'REPORT_DATE',
        SPECIES: 'SPECIES',
        AGE_CLASS: 'AGE_CLASS',
        GENDER: 'GENDER',
        HIGHWAY_ROAD: 'HIGHWAY_ROAD',
        UDOT_REGION: 'UDOT_REGION',
        UDWR_REGION: 'UDWR_REGION',
        XYPHOID: 'XYPHOID',
        COMMENTS: 'COMMENTS',
        TAG_COLLAR_NUM: 'TAG_COLLAR_NUM',
        GPS_ACCURACY: 'GPS_ACCURACY',
        ROUTE: 'ROUTE',
        ROUTE_DIR: 'ROUTE_DIR',
        MILEPOST: 'MILEPOST',
        ADDRESS: 'ADDRESS',
        OBJECTID: 'OBJECTID',
        RESPONDER_EMAIL: 'RESPONDER_EMAIL',
        RESPONDER_AGENCY: 'RESPONDER_AGENCY',
        RESPONDER_NAME: 'RESPONDER_NAME',
        WMU: 'WMU'
    };
    ROADKILL.MagicZoomNameField = 'NAME';
    ROADKILL.MagicZoomFCName = 'SGID10.LOCATION.ZoomLocations';

    ROADKILL.securePages = ['dataentry', 'download', 'map', 'user_admin'];
    ROADKILL.requireLogin = true;
    ROADKILL.appName = '/Roadkill';
    ROADKILL.roles = {
        Admin: 'admin',
        Submitter: 'submitter',
        Viewer: 'viewer'
    };

    if (has('agrc-build') === 'prod') {
        // mapserv.utah.gov
        ROADKILL.apiKey = 'AGRC-1B07B497348512';
        ROADKILL.quadWord = 'alfred-plaster-crystal-dexter';
    } else if (has('agrc-build') === 'stage') {
        // test.mapserv.utah.gov
        ROADKILL.apiKey = 'AGRC-AC122FA9671436';
        ROADKILL.quadWord = 'opera-event-little-pinball';
    } else {
        // localhost
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            ROADKILL.quadWord = secrets.quadWord;
            ROADKILL.apiKey = secrets.apiKey;
        }, function () {
            throw 'Error getting secrets!';
        });
    }

    // calculate dates
    var millisecondsInDays = 86400000;
    var today = new Date();
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    var sixMonthDays = (today.getTime() - sixMonthsAgo.getTime()) / millisecondsInDays;
    var happyNewYear = new Date();
    happyNewYear.setMonth(0);
    happyNewYear.setDate(1);
    var ytdDays = (today.getTime() - happyNewYear.getTime()) / millisecondsInDays;
    ROADKILL.dateQueries = {
        '7d': 'REPORT_DATE >= GETDATE() - 7',
        '30d': 'REPORT_DATE >= GETDATE() - 30',
        '6m': 'REPORT_DATE >= GETDATE() - ' + Math.round(sixMonthDays), // default
        'ytd': 'REPORT_DATE >= GETDATE() - ' + Math.round(ytdDays),
        '2yr': 'REPORT_DATE >= GETDATE() - 730',
        'all': '',
        'none': '1 = 2'
    };

    esriConfig.defaults.io.proxyUrl = '/proxy/proxy.ashx';

    return ROADKILL;
});
