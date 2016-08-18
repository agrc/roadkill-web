define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/text!roadkill/templates/Print.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/fx',
    'dojo/_base/lang',

    'esri/graphic',
    'esri/tasks/FeatureSet',
    'esri/tasks/Geoprocessor'
], function (
    _TemplatedMixin,
    _WidgetBase,

    domClass,
    domConstruct,
    domStyle,
    template,
    array,
    declare,
    baseFx,
    lang,

    Graphic,
    FeatureSet,
    Geoprocessor
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      prints the map

        templateString: template,
        baseClass: 'print-widget',

        // gp: esri.tasks.Geoprocessor
        gp: null,

        // aMsg: String
        aMsg: 'Click here for your map.',

        // bgLayerIds: {}
        bgLayerIds: {
            1: 'UDWR',
            2: 'UDOT'
        },

        // Parameters to constructor

        // cLayer: esrx.ClusterLayer
        cLayer: null,

        // map: esri.Map
        map: null,

        // dataFilter: roadkill.dataFilter
        dataFilter: null,

        // bmSelector: agrc.widgets.map.BaseMapSelector
        bmSelector: null,

        // bgLayer: esri.layers.ArcGISDyanamicMapServiceLayer
        bgLayer: null,

        // pointsLayer: esri.layers.ArcGISDynamicmapServiceLayer
        pointsLayer: null,

        constructor: function () {
            // summary:
            //    Constructor method
            console.log('roadkill/Print:constructor', arguments);
        },
        initGP: function () {
            // summary:
            //      sets up the geoprocessor
            console.log('roadkill/Print:initGP', arguments);

            this.gp = new Geoprocessor(ROADKILL.gpPrintUrl);

            this.own(
                this.gp.on('job-complete', lang.hitch(this, 'onJobComplete')),
                this.gp.on('status-update', lang.hitch(this, 'onStatusUpdate')),
                this.gp.on('error', lang.hitch(this, 'onJobError')),
                this.gp.on('get-result-data-complete', lang.hitch(this, 'onGetResultDataComplete'))
            );
        },
        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('roadkill/Print:postCreate', arguments);

            this._wireEvents();
        },
        _wireEvents: function () {
            // summary:
            //    Wires events.
            // tags:
            //    private
            console.log('roadkill/Print:_wireEvents', arguments);

            this.connect(this.printBtn, 'onclick', 'print');
        },
        print: function () {
            // summary:
            //      when the user clicks the print button
            console.log('roadkill/Print:print', arguments);

            if (!this.gp) {
                this.initGP();
            }

            this.showMsg('Generating map...');

            var input = {
                baseMap: this.bmSelector.currentTheme.label,
                extent: JSON.stringify(this.map.extent),
                routeBuffer: this.getRouteBuffer(),
                visibleLayers: this.getVisibleLayers(),
                defQueryTxt: this.dataFilter.updateDefinitionQuery()
            };

            lang.mixin(input, this.getGraphics());

            this.gp.submitJob(input);
        },
        getRouteBuffer: function () {
            // summary:
            //      description
            console.log('roadkill/Print:getRouteBuffer', arguments);

            if (this.dataFilter.queryGeo) {
                var fset = new FeatureSet();

                fset.features.push(new Graphic(this.dataFilter.queryGeo));

                return fset;
            } else {
                return '';
            }
        },
        getGraphics: function () {
            // summary:
            //      description
            console.log('roadkill/Print:getGraphics', arguments);

            var fset = new FeatureSet();
            var singleIds = [];

            var features = [];
            this.cLayer.graphics.forEach(function (g) {
                if (g.attributes.isCluster) {
                    features.push(new Graphic({
                        attributes: {
                            CLUSTER_NUM: g.attributes.clusterSize
                        },
                        geometry: g.geometry
                    }));
                } else if (g.attributes.isCluster === false) {
                    singleIds.push(g.attributes[ROADKILL.fields.OBJECTID]);
                }
            });

            fset.features = features;
            fset.spatialReference = this.map.spatialReference;

            return {
                singleFeatures: (singleIds.length > 0) ? JSON.stringify(singleIds) : '',
                clusterFeatures: (fset.features.length > 0) ? JSON.stringify(fset) : ''
            };
        },
        showMsg: function (msg) {
            // summary:
            //      show the message box
            console.log('roadkill/Print:showMsg', arguments);

            if (!this.printBtn.disabled) {
                this.printBtn.disabled = true;
            }

            domClass.add(this.msgBox, 'info');
            domClass.remove(this.msgBox, 'error');

            domStyle.set(this.msgLoader, 'display', 'inline-block');

            this.msg.innerHTML = msg;

            domStyle.set(this.msgBox, 'display', 'block');
            baseFx.fadeIn({node: this.msgBox}).play();
        },
        showErrorMsg: function (msg) {
            // summary:
            //      show the error message box
            console.log('roadkill/Print:showErrorMsg', arguments);

            domClass.add(this.msgBox, 'error');
            domClass.remove(this.msgBox, 'info');
            domClass.remove(this.msgBox, 'success');

            this.msg.innerHTML = msg;

            domStyle.set(this.msgBox, {
                'display': 'block',
                'opacity': 1
            });

            domStyle.set(this.msgLoader, 'display', 'none');

            this.printBtn.disabled = false;
        },
        onJobComplete: function (status) {
            // summary:
            //      fires when the gp job is complete
            console.log('roadkill/Print:onJobComplete', arguments);

            if (status.jobStatus === 'esriJobSucceeded') {
                this.gp.getResultData(status.jobId, 'outFile');
            } else {
                this.onJobError({message: status.jobStatus});
            }
        },
        onStatusUpdate: function (status) {
            // summary:
            //      description
            console.log('roadkill/Print:onStatusUpdate', arguments);

            // this was just used for debugging

            // var ul = dojo.create('ul');
            // dojo.forEach(status.messages, function (msg) {
                // dojo.create('li', {
                    // innerHTML: msg.description
                // }, ul);
            // });
            // this.msg.innerHTML = '';
            // dojo.place(ul, this.msg);
            if (status.messages.length > 0) {
                console.log(status.messages[status.messages.length - 1].description);
            }
        },
        onJobError: function () {
            // summary:
            //      description
            console.log('roadkill/Print:onJobError', arguments);

            this.showErrorMsg('There was an error with the print service.');
        },
        onGetResultDataComplete: function (result) {
            // summary:
            //
            console.log('roadkill/Print:onGetResultDataComplete', arguments);

            domClass.add(this.msgBox, 'success');
            domClass.remove(this.msgBox, 'info');
            domClass.remove(this.msgBox, 'error');

            domStyle.set(this.msgLoader, 'display', 'none');

            this.printBtn.disabled = false;

            this.msg.innerHTML = '';

            domConstruct.create('a', {
                innerHTML: this.aMsg,
                href: result.value.url,
                target: '_blank'
            }, this.msg);
        },
        getVisibleLayers: function () {
            // summary:
            //      Returns the visible layer names if the map service layers themselves are visible
            // returns: String
            //        Empty string if no layers are visible
            console.log('roadkill/Print:getVisibleLayers', arguments);

            function searchLayer(layer) {
                if (layer.visibleLayers.length > 0 && layer.visible) {
                    return array.map(layer.visibleLayers, function (id) {
                        // get name of layer
                        var name;
                        array.some(layer.layerInfos, function (info) {
                            if (info.id === id) {
                                name = info.name;
                                return true;
                            }
                        });
                        return name;
                    });
                } else {
                    return [];
                }
            }

            var lyrs = searchLayer(this.bgLayer).concat(searchLayer(this.pointsLayer));
            if (lyrs.length > 0) {
                return lyrs;
            } else {
                return '';
            }
        }
    });
});
