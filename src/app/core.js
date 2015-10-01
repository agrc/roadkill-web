define([
    'dojo/_base/array',

    'dojo/dom',
    'dojo/dom-class',
    'dojo/parser',

    'ijit/widgets/authentication/LoginRegister',
    "ijit/modules/ErrorLogger",

    'esri/config',

    'dojo/domReady!'
], function (
    array,
    
    dom,
    domClass,
    parser,

    LoginRegister,
    ErrorLogger,

    esriConfig
    ) {
    window.ROADKILL = {};
    ROADKILL.server = document.location.protocol + '//' + document.domain;
    ROADKILL.baseUrl = ROADKILL.server + "/arcgis/rest/services/Roadkill";
    ROADKILL.toolboxUrlBase = ROADKILL.baseUrl + "/Toolbox/GPServer";
    ROADKILL.gpDownloadUrl = ROADKILL.toolboxUrlBase + "/DownloadData";
    ROADKILL.rkMapServiceUrl = ROADKILL.baseUrl + "/MapService/MapServer";
    ROADKILL.clusterLayerUrl = ROADKILL.rkMapServiceUrl + "/0";
    ROADKILL.rkFeatureServiceUrl = ROADKILL.baseUrl + "/MapService/FeatureServer/0";
    ROADKILL.locatorServiceUrl = "https://mapserv.utah.gov/wsut/Geocode.svc/roadkill/street(";
    ROADKILL.rkMapServiceUrlUserId  = ROADKILL.rkMapServiceUrl + '/4/query';
    ROADKILL.rkMapServiceUrlUDOT = ROADKILL.rkMapServiceUrl + '/2/query';
    ROADKILL.rkMapServiceUrlUDWR = ROADKILL.rkMapServiceUrl + '/1/query';
    ROADKILL.rkFeatureServiceAddFeaturesUrl = ROADKILL.baseUrl + '/FeatureService/FeatureServer/0/addFeatures';
    ROADKILL.gpRouteMilepostUrl = ROADKILL.toolboxUrlBase + '/RouteMilepostsSegment';
    ROADKILL.geometryServiceUrl = '/ArcGIS/rest/services/Geometry/GeometryServer';
    ROADKILL.gpPrintUrl = ROADKILL.toolboxUrlBase + '/Print';
    ROADKILL.rkPointsLayerUrl = ROADKILL.baseUrl + '/Overlays/MapServer';

    ROADKILL.fields = {
        REPORT_DATE: "REPORT_DATE",
        SPECIES: "SPECIES",
        AGE_CLASS: "AGE_CLASS",
        GENDER: "GENDER",
        HIGHWAY_ROAD: "HIGHWAY_ROAD",
        UDOT_REGION: "UDOT_REGION",
        UDWR_REGION: "UDWR_REGION",
        XYPHOID: "XYPHOID",
        COMMENTS: "COMMENTS",
        TAG_COLLAR_NUM: "TAG_COLLAR_NUM",
        GPS_ACCURACY: "GPS_ACCURACY",
        ROUTE: 'ROUTE',
        ROUTE_DIR: 'ROUTE_DIR',
        MILEPOST: "MILEPOST",
        ADDRESS: "ADDRESS",
        OBJECTID: 'OBJECTID',
        RESPONDER_EMAIL: 'RESPONDER_EMAIL',
        RESPONDER_AGENCY: 'RESPONDER_AGENCY',
        RESPONDER_NAME: 'RESPONDER_NAME',
        WMU: 'WMU'
    };

    ROADKILL.securePages = ['dataentry', 'download', 'map', 'user_admin'];
    ROADKILL.requireLogin = true;
    ROADKILL.appName = '/Roadkill';
    ROADKILL.roles = {
        Admin: 'admin',
        Submitter: 'submitter',
        Viewer: 'viewer'
    };
    
    ROADKILL.errorLogger = new ErrorLogger({
        appName: 'WVC Reporter - Desktop'
    });
    
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
        "7d": "REPORT_DATE >= GETDATE() - 7",
        "30d": "REPORT_DATE >= GETDATE() - 30",
        "6m": "REPORT_DATE >= GETDATE() - " + Math.round(sixMonthDays), // default
        "ytd": "REPORT_DATE >= GETDATE() - " + Math.round(ytdDays),
        "2yr": "REPORT_DATE >= GETDATE() - 730",
        "all": "",
        "none": "1 = 2"
    };

    esriConfig.defaults.io.proxyUrl = '/proxy/proxy.ashx';
    
    // set active state on nav bar
    var urlParts = document.URL.split("/");
    var fileName = urlParts[urlParts.length - 1];
    var elementName = fileName.slice(0, fileName.indexOf(".php"));
    elementName = (elementName === "") ? "index" : elementName;
    var element = dom.byId(elementName);
    if (element){
        domClass.add(element, "active");
    }
    
    var requireLogin;
    if (array.indexOf(ROADKILL.securePages, elementName) === -1){
        requireLogin = false;
    } else {
        requireLogin = true;
    }

    parser.parse();
    
    ROADKILL.login = new LoginRegister({
        appName: 'roadkill',
        logoutDiv: dom.byId('logoutDiv'),
        showOnLoad: requireLogin,
        securedServicesBaseUrl: ROADKILL.baseUrl
    });
});
 
