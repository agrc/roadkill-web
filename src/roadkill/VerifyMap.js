/*global dojo, console, agrc, Proj4js, alert, roadkill, esri*/
dojo.provide("roadkill.VerifyMap");

dojo.require("agrc.widgets.map.BaseMap");
dojo.require("dojo.io.script");
dojo.require('esri.geometry.Point');
dojo.require('esri.symbols.SimpleMarkerSymbol');
dojo.require('esri.graphic');

dojo.require("proj4js.proj4js-compressed");
(function() {
    // private properties
    var that, llTab, utmTab, rmTab, addTab, lat, lng, easting, northing, route, milepost, address, zipcity, verifyBtn, map, srcProj, destProj, verifyText, verifyImg;

    // public properties
    var verified = false, geo, currentField, currentValue;

    // private methods
    var getElements = function() {
        // summary:
        //		gets all of the element references needed for this object
        console.info("VerifyMap::getElements", arguments);
        llTab = dojo.byId('lat-lng-tab');
        utmTab = dojo.byId('utm-tab');
        rmTab = dojo.byId('route-milepost-tab');
        addTab = dojo.byId('address-tab');
        lat = dojo.byId('lat');
        lng = dojo.byId('lng');
        easting = dojo.byId('easting');
        northing = dojo.byId('northing');
        route = dojo.byId('route');
        milepost = dojo.byId('milepost');
        address = dojo.byId('address');
        zipcity = dojo.byId('zipcity');
        verifyBtn = dojo.byId('verify-location');
        verifyText = dojo.byId('verify-status-text');
        verifyImg = dojo.byId('verify-status-img');
    };
    var wireEvents = function() {
        console.info("VerifyMap::wireEvents", arguments);

        dojo.connect(verifyBtn, "onclick", function() {
            that.verifyLocation();
        });
        dojo.connect(lat, "onchange", that, 'onChange');
        dojo.connect(lng, "onchange", that, 'onChange');
        dojo.connect(easting, 'onchange', that, 'onChange');
        dojo.connect(northing, 'onchange', that, 'onChange');
        dojo.connect(route, "onchange", that, 'onChange');
        dojo.connect(milepost, "onchange", that, 'onChange');
        dojo.connect(address, "onchange", that, 'onChange');
        dojo.connect(zipcity, "onchange", that, 'onChange');
    };
    var initProj4js = function() {
        // summary:
        //		sets up the Proj4js stuff
        console.info("VerifyMap::initProj4js", arguments);

        // init Proj4js
        Proj4js.defs["EPSG:26912"] = "+title=NAD83 / UTM zone 12N +proj=utm +zone=12 +a=6378137.0 +b=6356752.3141403";
        Proj4js.reportError = function(msg) {
            console.info(msg);
        };
        srcProj = new Proj4js.Proj('WGS84');
        destProj = new Proj4js.Proj("EPSG:26912");
    };
    var zoomToPoint = function(x, y) {
        // summary:
        //		zooms the map to the coordinates and set the geometry
        // x, y: int
        console.info("VerifyMap::zoomToPoint", arguments);

        map.graphics.clear();
        var pnt = new esri.geometry.Point(x, y, map.spatialReference);
        var sms = new esri.symbols.SimpleMarkerSymbol().setStyle(esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new dojo.Color([255, 255, 0, 0.8])).setSize(9);
        var g = new esri.graphic(pnt, sms);
        map.graphics.add(g);
        map.centerAndZoom(pnt, 6);

        that.geo = {
            x : x,
            y : y
        };
    };
    var showMsg = function(msg) {
        // summary:
        //		Shows the verify text and image
        // msg: String
        console.info("VerifyMap::showMsg", arguments);

        verifyText.innerHTML = msg;
        dojo.style(verifyText, 'display', 'inline');
        dojo.style(verifyImg, 'display', 'inline');
    };
    var hideMsg = function() {
        // summary:
        //		Hids the text and image
        console.info("VerifyMap::hideMsg", arguments);

        dojo.style(verifyText, 'display', 'none');
        dojo.style(verifyImg, 'display', 'none');
    };
    var geocode = function(first, second) {
        // summary:
        //		calls the locator service to find the location of the route and milepost
        // first: String
        //		route or street address
        // second: String
        //		milepost or zip or city
        // returns: dojo.Deferred
        console.info("VerifyMap::geocode", arguments);

        var def = new dojo.Deferred();

        var params = {
            url : ROADKILL.locatorServiceUrl + first + ')zone(' + second + ')',
            callbackParamName : 'callback',
            handleAs : 'json',
            timeout : 10000,
            preventCache : true
        };
        dojo.io.script.get(params).then(function(result) {
            zoomToPoint(result.UTM_X, result.UTM_Y);
            def.resolve(true);
        }, function() {
            showMsg('No match found');
            dojo.style(verifyImg, 'display', 'none');
            def.resolve(false);
        });
        return def;
    };
    // public methods
    function VerifyMap() {
        // summary:
        //		the map used to verify the inputted location
        console.info("VerifyMap::constructor", arguments);
        that = this;

        getElements();
        map = new agrc.widgets.map.BaseMap('verify-map', {
            slider : false,
            logo : false
        });

        initProj4js();

        wireEvents();
    }

    function verifyLocation() {
        // summary:
        //		validates the location fields and then zooms the map to them
        console.info("VerifyMap::verifyLocation", arguments);

        var selectedTab = dojo.query('.tab-content>.active')[0];

        verifyBtn.disabled = true;
        hideMsg();

        switch(selectedTab) {
            case llTab:
                if(lat.value.length === 0 || lng.value.length === 0) {
                    alert('You must input both a latitude and longitude');
                    verifyBtn.disabled = false;
                    return false;
                }
                var latValue = parseFloat(lat.value);
                var lngValue = parseFloat(lng.value);
                if(latValue < 36 || latValue > 43) {
                    alert("Your latitude value is invalid!");
                    return false;
                } else if(lngValue < -114 || lngValue > -109) {
                    alert("Your longitude value is invalid!");
                    return false;
                } else {
                    var p = new Proj4js.Point(lngValue, latValue);
                    Proj4js.transform(srcProj, destProj, p);

                    zoomToPoint(p.x, p.y);
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
                    return false;
                } else if (northingValue < 4036869 || northingValue > 4711483) {
                    alert('Your northing value is invalid!');
                    return false;
                } else {
                    zoomToPoint(eastingValue, northingValue);
                    verifyBtn.disabled = false;
                    
                    that.currentField = undefined;
                    that.currentValue = undefined;
                    that.verified = true;
                    return true;
                }
                break;
            case rmTab:
                if(route.value.length === 0 && milepost.value.length === 0) {
                    alert('You must input both a route and milepost');
                    return false;
                } else {
                    showMsg('Matching route and milepost...');

                    var def = geocode(milepost.value, route.value);
                    def.then(function(result) {
                        verifyBtn.disabled = false;
                        if(result) {
                            hideMsg();
                            verifyBtn.disabled = false;
                            that.currentField = ROADKILL.fields.ROUTE_MILEPOST;
                            that.currentValue = "Route: " + route.value + ", Milepost: " + milepost.value;
                            that.verified = true;
                            return true;
                        } else {
                            return false;
                        }
                    }, function() {
                        verifyBtn.disabled = false;
                        return false;
                    });
                }
                break;
            case addTab:
                if(address.value.length === 0 && zipcity.value.length === 0) {
                    alert('You must input both an address and zip or city.');
                    return false;
                } else {
                    showMsg('Matching address...');

                    var def2 = geocode(address.value, zipcity.value);
                    def2.then(function(result) {
                        verifyBtn.disabled = false;
                        if(result) {
                            hideMsg();
                            verifyBtn.disabled = false;
                            that.currentField = ROADKILL.fields.ADDRESS;
                            that.currentValue = address.value + ", " + zipcity.value;
                            that.verified = true;
                            return true;
                        } else {
                            return false;
                        }
                    }, function() {
                        verifyBtn.disabled = false;
                        return false;
                    });
                }
                break;
        }
        return false;
    }

    function onChange() {
        // summary:
        //		fires when any of the values change
        //		resets the verified property
        console.info("VerifyMap::onChange", arguments);

        that.verified = false;
        verifyBtn.disabled = false;
        map.graphics.clear();
    }


    roadkill.VerifyMap = VerifyMap;
    roadkill.VerifyMap.prototype.verifyLocation = verifyLocation;
    roadkill.VerifyMap.prototype.onChange = onChange;
    roadkill.VerifyMap.prototype.verified = verified;
    roadkill.VerifyMap.prototype.geo = geo;
    roadkill.VerifyMap.prototype.currentField = currentField;
    roadkill.VerifyMap.prototype.currentValue = currentValue;
})();
