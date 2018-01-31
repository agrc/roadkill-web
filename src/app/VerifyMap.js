define([
    'agrc/modules/WebAPI',
    'agrc/widgets/map/BaseMap',

    'app/config',

    'dojo/Deferred',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/on',
    'dojo/query',
    'dojo/_base/Color',

    'esri/geometry/Extent',
    'esri/geometry/Point',
    'esri/graphic',
    'esri/symbols/SimpleMarkerSymbol',

    'layer-selector/LayerSelector',

    'proj4',

    'sherlock/providers/WebAPI',
    'sherlock/Sherlock'
], function (
    WebAPI,
    BaseMap,

    config,

    Deferred,
    dom,
    domStyle,
    on,
    query,
    Color,

    Extent,
    Point,
    Graphic,
    SimpleMarkerSymbol,

    LayerSelector,

    proj4,

    SherlockWebAPI,
    Sherlock
) {
    // private properties
    var that;
    var llTab;
    var utmTab;
    var rmTab;
    var addTab;
    var lat;
    var lng;
    var easting;
    var northing;
    var route;
    var milepost;
    var address;
    var zipcity;
    var verifyBtn;
    var map;
    var llProj;
    var utmProj;
    var webMercProj;
    var verifyText;
    var verifyImg;

    // public properties
    var verified = false;
    var geo;
    var currentField;
    var currentValue;

    // private methods
    var getElements = function () {
        // summary:
        //        gets all of the element references needed for this object
        console.info('VerifyMap::getElements', arguments);

        llTab = dom.byId('lat-lng-tab');
        utmTab = dom.byId('utm-tab');
        rmTab = dom.byId('route-milepost-tab');
        addTab = dom.byId('address-tab');
        lat = dom.byId('lat');
        lng = dom.byId('lng');
        easting = dom.byId('easting');
        northing = dom.byId('northing');
        route = dom.byId('route');
        milepost = dom.byId('milepost');
        address = dom.byId('address');
        zipcity = dom.byId('zipcity');
        verifyBtn = dom.byId('verify-location');
        verifyText = dom.byId('verify-status-text');
        verifyImg = dom.byId('verify-status-img');
    };
    var zoomToPoint = function (x, y, preventZoom) {
        // summary:
        //        zooms the map to the coordinates and set the geometry
        // x, y: int
        // preventZoom: boolean (default is false)
        console.info('VerifyMap::zoomToPoint', arguments);

        map.graphics.clear();
        var pnt = new Point(x, y, map.spatialReference);
        var sms = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new Color([255, 255, 0, 0.8])).setSize(9);
        var g = new Graphic(pnt, sms);
        map.graphics.add(g);

        if (!preventZoom) {
            map.centerAndZoom(pnt, 12);
        }

        that.geo = {
            x: x,
            y: y
        };
    };
    var wireEvents = function () {
        console.info('VerifyMap::wireEvents', arguments);

        on(verifyBtn, 'click', function () {
            that.verifyLocation();
        });
        on(lat, 'change', that.onChange.bind(that));
        on(lng, 'change', that.onChange.bind(that));
        on(easting, 'change', that.onChange.bind(that));
        on(northing, 'change', that.onChange.bind(that));
        on(route, 'change', that.onChange.bind(that));
        on(milepost, 'change', that.onChange.bind(that));
        on(address, 'change', that.onChange.bind(that));
        on(zipcity, 'change', that.onChange.bind(that));

        map.on('click', function (evt) {
            var mapPoint = evt.mapPoint;
            zoomToPoint(mapPoint.x, mapPoint.y, true);
            that.verified = true;
            verifyBtn.disabled = true;
        });
    };
    var initProj4js = function () {
        // summary:
        //        sets up the Proj4js stuff
        console.info('VerifyMap::initProj4js', arguments);

        // init Proj4js
        proj4.reportError = function (msg) {
            console.info(msg);
        };
        // 4326
        llProj = proj4('+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
        webMercProj = proj4('EPSG:3857');
        // 26912
        utmProj = proj4('+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs ');
    };
    var showMsg = function (msg) {
        // summary:
        //        Shows the verify text and image
        // msg: String
        console.info('VerifyMap::showMsg', arguments);

        verifyText.innerHTML = msg;
        domStyle.set(verifyText, 'display', 'inline');
        domStyle.set(verifyImg, 'display', 'inline');
    };
    var hideMsg = function () {
        // summary:
        //        Hids the text and image
        console.info('VerifyMap::hideMsg', arguments);

        domStyle.set(verifyText, 'display', 'none');
        domStyle.set(verifyImg, 'display', 'none');
    };
    var webAPI = new WebAPI({apiKey: config.apiKey});
    var geocode = function (street, zone) {
        // summary:
        //        calls the locator service to find the location of the route and milepost
        // street: String
        //        street address
        // zone: String
        //        zip or city
        // returns: dojo.Deferred
        console.info('VerifyMap::geocode', arguments);

        var def = new Deferred();

        webAPI.geocode(street, zone, {spatialReference: 3857}).then(function (result) {
            zoomToPoint(result.location.x, result.location.y);
            def.resolve(true);
        }, function () {
            showMsg('No match found');
            domStyle.set(verifyImg, 'display', 'none');
            def.resolve(false);
        });
        return def.promise;
    };
    var getRouteMilepost = function (route, milepost) {
        // summary:
        //        calls the locator service to find the location of the route and milepost
        // route: String
        //        street address
        // milepost: String
        //        zip or city
        // returns: dojo.Deferred
        console.info('VerifyMap::getRouteMilepost', arguments);

        var def = new Deferred();

        webAPI.getRouteMilepost(route, milepost, {spatialReference: 3857}).then(function (result) {
            zoomToPoint(result.location.x, result.location.y);
            def.resolve(true);
        }, function () {
            showMsg('No match found');
            domStyle.set(verifyImg, 'display', 'none');
            def.resolve(false);
        });
        return def.promise;
    };
    // public methods
    function VerifyMap() {
        // summary:
        //        the map used to verify the inputted location
        console.info('VerifyMap::constructor', arguments);
        that = this;

        getElements();
        map = new BaseMap('verify-map', {
            logo: false,
            extent: new Extent({
                xmax: -11762120.612131765,
                xmin: -13074391.513731329,
                ymax: 5225035.106177688,
                ymin: 4373832.359194187,
                spatialReference: {
                    wkid: 3857
                }
            }),
            useDefaultBaseMap: false
        });
        map.on('load', function () {
            map.disableScrollWheelZoom();
        });

        var webAPIProvider = new SherlockWebAPI(config.apiKey,
            config.MagicZoomFCName,
            config.MagicZoomNameField,
            {wkid: 3857}
        );
        var sherlock = new Sherlock({
            provider: webAPIProvider,
            map: map,
            placeHolder: 'city, county, place name, etc...',
            maxResultsToDisplay: 10,
            appendToBody: false
        }, 'sherlock-div');
        sherlock.startup();

        var ls = new LayerSelector({
            map: map,
            quadWord: config.quadWord,
            baseLayers: ['Terrain', 'Hybrid']
        });
        ls.startup();

        initProj4js();

        wireEvents();
    }

    function onChange() {
        // summary:
        //        fires when any of the values change
        //        resets the verified property
        console.info('VerifyMap::onChange', arguments);

        that.verified = false;
        verifyBtn.disabled = false;
        map.graphics.clear();
    }

    function verifyLocation() {
        // summary:
        //        validates the location fields and then zooms the map to them
        console.info('VerifyMap::verifyLocation', arguments);

        var selectedTab = query('.tab-content>.active')[0];

        verifyBtn.disabled = true;
        hideMsg();

        switch (selectedTab) {
            case llTab:
                if (lat.value.length === 0 || lng.value.length === 0) {
                    alert('You must input both a latitude and longitude');
                    verifyBtn.disabled = false;
                    return false;
                }
                var latValue = parseFloat(lat.value);
                var lngValue = parseFloat(lng.value);
                if (latValue < 36 || latValue > 43) {
                    alert('Your latitude value is invalid!');
                    onChange();
                    return false;
                } else if (lngValue < -114 || lngValue > -109) {
                    alert('Your longitude value is invalid!');
                    onChange();
                    return false;
                } else {
                    var p = proj4(llProj, webMercProj, [lngValue, latValue]);

                    zoomToPoint(p[0], p[1]);
                    verifyBtn.disabled = false;

                    that.currentField = undefined;
                    that.currentValue = undefined;
                    that.verified = true;
                    return true;
                }
                break;
            case utmTab:
                if (easting.value.length === 0 || northing.value.length === 0) {
                    alert('You must input both an easting and northing');
                    verifyBtn.disabled = false;
                    return false;
                }
                var eastingValue = parseFloat(easting.value);
                var northingValue = parseFloat(northing.value);
                if (eastingValue < 141232 || eastingValue > 766672) {
                    alert('Your easting value is invalid!');
                    onChange();
                    return false;
                } else if (northingValue < 4036869 || northingValue > 4711483) {
                    alert('Your northing value is invalid!');
                    onChange();
                    return false;
                } else {
                    var p = proj4(utmProj, webMercProj, [eastingValue, northingValue]);

                    zoomToPoint(p[0], p[1]);
                    verifyBtn.disabled = false;

                    that.currentField = undefined;
                    that.currentValue = undefined;
                    that.verified = true;
                    return true;
                }
                break;
            case rmTab:
                if (route.value.length === 0 && milepost.value.length === 0) {
                    alert('You must input both a route and milepost');
                    return false;
                } else {
                    showMsg('Matching route and milepost...');

                    var def = getRouteMilepost(route.value, milepost.value);
                    def.then(function (result) {
                        verifyBtn.disabled = false;
                        if (result) {
                            hideMsg();
                            verifyBtn.disabled = false;
                            that.currentField = config.fields.ROUTE_MILEPOST;
                            that.currentValue = 'Route: ' + route.value + ', Milepost: ' + milepost.value;
                            that.verified = true;
                            return true;
                        }
                        return false;
                    }, function () {
                        verifyBtn.disabled = false;
                        return false;
                    });
                }
                break;
            case addTab:
                if (address.value.length === 0 && zipcity.value.length === 0) {
                    alert('You must input both an address and zip or city.');
                    return false;
                } else {
                    showMsg('Matching address...');

                    var def2 = geocode(address.value, zipcity.value, {spatialReference: 3857});
                    def2.then(function (result) {
                        verifyBtn.disabled = false;
                        if (result) {
                            hideMsg();
                            verifyBtn.disabled = false;
                            that.currentField = config.fields.ADDRESS;
                            that.currentValue = address.value + ', ' + zipcity.value;
                            that.verified = true;
                            return true;
                        } else {
                            return false;
                        }
                    }, function () {
                        verifyBtn.disabled = false;
                        return false;
                    });
                }
                break;
        }
        return false;
    }


    VerifyMap.prototype.verifyLocation = verifyLocation;
    VerifyMap.prototype.onChange = onChange;
    VerifyMap.prototype.verified = verified;
    VerifyMap.prototype.geo = geo;
    VerifyMap.prototype.currentField = currentField;
    VerifyMap.prototype.currentValue = currentValue;

    return VerifyMap;
});
