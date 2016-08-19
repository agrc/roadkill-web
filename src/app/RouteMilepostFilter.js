define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!app/templates/RouteMilepostFilter.html',
    'dojo/_base/array',
    'dojo/_base/declare',

    'esri/tasks/BufferParameters',
    'esri/tasks/GeometryService',
    'esri/tasks/Geoprocessor'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    template,
    array,
    declare,

    BufferParameters,
    GeometryService,
    Geoprocessor
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      widget for filtering the data by a buffered route segment

        templateString: template,
        baseClass: 'route-milepost-filter',

        // gp: esri.tasks.Geoprocessor
        gp: null,

        // routeRequiredTxt: String
        routeRequiredTxt: 'A route is required.',

        // fromRequiredTxt: String
        fromRequiredTxt: 'A from milepost is required',

        // toRequiredTxt: String
        toRequiredTxt: 'A to milepost is required',

        // erMsg: String
        erMsg: 'There was an error with the route/milepost service',

        // noMatchMsg: String
        noMatchMsg: 'No match for that route/milepost combination was found.\nPlease check your inputs and try again.',

        // geo: esri.tasks.GeometryService
        geo: null,

        // Parameters to constructor

        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/RouteMilepostFilter:postCreate', arguments);

            this._wireEvents();
        },
        _wireEvents: function () {
            // summary:
            //    Wires events.
            // tags:
            //    private
            console.log('app/RouteMilepostFilter:_wireEvents', arguments);

            this.connect(this.submitBtn, 'onclick', 'onSubmit');
            this.connect(this.clearBtn, 'onclick', 'onClear');
        },
        onSubmit: function () {
            // summary:
            //      fires when the user clicks on the submit button
            console.log('app/RouteMilepostFilter:onSubmit', arguments);

            this.showLoader();

            if (!this.gp) {
                this.initGP();
            }

            var values = this.getValues();
            if (values) {
                this.gp.submitJob(values);
            } else {
                this.hideLoader();
            }
        },
        initGP: function () {
            // summary:
            //      sets up the geoprocessor object
            console.log('app/RouteMilepostFilter:initGP', arguments);

            this.gp = new Geoprocessor(config.gpRouteMilepostUrl);
            this.geo = new GeometryService(config.geometryServiceUrl);

            this.connect(this.gp, 'onJobComplete', 'onJobComplete');
            this.connect(this.gp, 'onStatusUpdate', 'onStatusUpdate');
            this.connect(this.gp, 'onError', 'onJobError');
            this.connect(this.gp, 'onGetResultDataComplete', 'onGetResultDataComplete');
            this.connect(this.geo, 'onBufferComplete', 'onBufferComplete');
        },
        getValues: function () {
            // summary:
            //      gets the form values and validates
            console.log('app/RouteMilepostFilter:getValues', arguments);

            var route = this.route.value;
            var from = this.fromMP.value;
            var to = this.toMP.value;
            if (route.length === 0) {
                alert(this.routeRequiredTxt);
                return null;
            } else if (from.length === 0) {
                alert(this.fromRequiredTxt);
                return null;
            } else if (to.length === 0) {
                alert(this.toRequiredTxt);
                return null;
            }

            // remove any leading zeros that may have been passed
            route = parseInt(route, 10) + '';
            // add the appropriate number of leading zeros
            if (route.length === 2) {
                route = '00' + route;
            } else if (route.length === 3) {
                route = '0' + route;
            } else if (route.length === 1) {
                route = '000' + route;
            }

            return {
                route: route,
                fromMP: from,
                toMP: to
            };
        },
        onJobComplete: function (status) {
            // summary:
            //      description
            console.log('app/RouteMilepostFilter:onJobComplete', arguments);

            if (status.jobStatus !== 'esriJobSucceeded') {
                if (array.some(status.messages, function (msg) {
                    return msg.description === 'No match found for that route.';
                })) {
                    this.hideLoader();
                    alert(this.noMatchMsg);
                } else {
                    this.onJobError(status);
                }
            } else {
                this.gp.getResultData(status.jobId, 'outSegment');
            }
        },
        onStatusUpdate: function (/*status*/) {
            // summary:
            //      just so I can see the status updates in the console
            console.log('app/RouteMilepostFilter:onStatusUpdate', arguments);
        },
        onJobError: function () {
            // summary:
            //      description
            console.log('app/RouteMilepostFilter:onJobError', arguments);

            this.hideLoader();

            alert(this.erMsg);
        },
        onGetResultDataComplete: function (result) {
            // summary:
            //      description
            console.log('app/RouteMilepostFilter:onGetResultDataComplete', arguments);

            var params = new BufferParameters();
            params.distances = [500];
            params.geometries = [result.value.features[0].geometry];
            params.unionResults = true;

            this.geo.buffer(params);
        },
        hideLoader: function () {
            // summary:
            //      hides the loader img and enables the button
            console.log('app/RouteMilepostFilter:hideLoader', arguments);

            config.mapapp.map.hideLoader();
            this.submitBtn.disabled = false;
        },
        showLoader: function () {
            // summary:
            //      shows the loader img and disables the button
            console.log('app/RouteMilepostFilter:showLoader', arguments);

            config.mapapp.map.showLoader();
            this.submitBtn.disabled = true;
        },
        onBufferComplete: function (response) {
            // summary:
            //      callback from geometry service
            // response: esri.Geometry[]
            console.log('app/RouteMilepostFilter:onBufferComplete', arguments);

            this.hideLoader();

            this.onComplete(response[0]);
        },
        onComplete: function (/*bufferGeo*/) {
            // summary:
            //      event for other objects to subscribe to
            // bufferGeo: esri.geometry.Polygon
            console.log('app/RouteMilepostFilter:onComplete', arguments);
        },
        onClear: function () {
            // summary:
            //      event for other objects to subscribe to
            console.log('app/RouteMilepostFilter:onClear', arguments);

            this.route.value = '';
            this.fromMP.value = '';
            this.toMP.value = '';
        }
    });
});
