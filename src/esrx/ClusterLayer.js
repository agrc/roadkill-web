define([
    'app/config',

    'dojo/_base/array',
    'dojo/_base/Color',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojox/lang/functional',

    'esri/geometry/mathUtils',
    'esri/geometry/Point',
    'esri/geometry/Polygon',
    'esri/geometry/Polyline',
    'esri/geometry/screenUtils',
    'esri/graphic',
    'esri/layers/GraphicsLayer',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/TextSymbol',
    'esri/tasks/query',
    'esri/tasks/QueryTask',

    'ext/DelayedTask',

    'dojox/lang/functional/curry',
    'dojox/lang/functional/fold',
    'dojox/lang/functional/lambda'
], function (
    config,

    array,
    Color,
    declare,
    lang,

    functional,

    mathUtils,
    Point,
    Polygon,
    Polyline,
    screenUtils,
    Graphic,
    GraphicsLayer,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    TextSymbol,
    Query,
    QueryTask,

    DelayedTask
) {
    return declare('esrx.ClusterLayer', GraphicsLayer, {

        // singleSymbolRenderer: esri.Renderer
        //        The renderer used to symbolize the symbols for un-clustered symbols
        singleSymbolRenderer: null,

        // _map: esri.Map
        _map: null,

        // displayOnPan: Boolean
        //        See GraphicsLayer
        displayOnPan: null,

        // symbolBank: {}
        //        Used to store symbols or renderers.
        symbolBank: null,

        // levelPointTileSpace: []
        levelPointTileSpace: null,

        // _features: Graphic[]
        //        Holds all of the features for the layer
        _features: null,

        // _flareDistanceFromCenter: Number
        //        how far away the flare will be from the center of the cluster in pixels - Number
        _flareDistanceFromCenter: null,

        // _flareLimit: Number
        //        the number of flare graphics to limit the cluster to - Number
        _flareLimit: null,

        // _infoTemplate: esri.InfoTemplate
        //        info template for all single graphics and flare graphics - esri.InfoTemplate
        _infoTemplate: null,

        // url: String
        //        a url to the layer eg http://mapserv.utah.gov/ArcGIS_Roadkill/rest/services/Roadkill/MapServer/0
        url: '',

        // initDefQuery: String
        //        The initial definition query applied when the layer is loaded.
        initDefQuery: '',

        // qTask: esri.tasks.QueryTask
        qTask: null,

        // query: esri.tasks.Query
        query: null,

        constructor: function (options) {
            // summary:
            //        The first function to fire when the object is created
            console.log('esrx/ClusterLayer:constructor', arguments);

            function makeSymbol(size) {
                return new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, size,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL,
                        new Color([0, 0, 0]), 0), new Color([255, 255, 153, 0.75]));
            }

            // init properties
            this.url = options.url;
            this.levelPointTileSpace = [];
            this._features = [];
            this.displayOnPan = options.displayOnPan || false;
            this._map = options.map;
            this.symbolBank = {
                'single': function (g) {
                    return options.singleSymbolRenderer.getSymbol(g);
                },
                'less16': makeSymbol(18),
                'less30': makeSymbol(25),
                'less60': makeSymbol(35),
                'less120': makeSymbol(45),
                'over120': makeSymbol(55)
            };
            this._flareDistanceFromCenter = options.flareDistanceFromCenter || 20;
            this._flareLimit = options.flareLimit || 20;
            this._infoTemplate = options.infoTemplate || null;

            this.wireEvents();

            this.setUpQTask();

            this.queryFeatures(options.initDefQuery);
        },
        wireEvents: function () {
            // summary:
            //        Wires events for the object
            console.log('esrx/ClusterLayer:wireEvents', arguments);

            //base connections to update clusters during user/map interaction
            this._map.on('zoom-start', lang.hitch(this, 'handleMapZoomStart'));
            this._map.on('extent-change', lang.hitch(this, 'handleMapExtentChange'));

            //connects for cluster layer itself that handles the loading and mouse events on the graphics
            this.on('mouse-over', lang.hitch(this, 'handleMouseOver'));
            this.on('mouse-out', lang.hitch(this, 'handleMouseOut'));
            this.on('click', lang.hitch(this, 'handleOnClick'));

            this._map.infoWindow.on('hide', lang.hitch(this, 'handleInfoWindowOnHide'));
        },
        setUpQTask: function () {
            // summary:
            //      sets up the query task
            console.log('esrx/ClusterLayer:setUpQTask', arguments);

            this.qTask = new QueryTask(this.url);
            this.query = new Query();
            var outFields = [];
            for (var f in config.fields) {
                if (config.fields.hasOwnProperty(f)) {
                    outFields.push(config.fields[f]);
                }
            }
            this.query.outFields = outFields;
            this.query.returnGeometry = true;
        },
        queryFeatures: function (defQuery, geo) {
            // summary:
            //        Queries for new features from the server using this.query
            console.log('esrx/ClusterLayer:queryFeatures', arguments);

            this._map.showLoader();

            var defaultQuery = 'Shape IS NOT NULL';
            this.query.where = (defQuery) ? defaultQuery + ' AND ' + defQuery : defaultQuery;
            if (geo) {
                this.query.geometry = geo;
            } else {
                this.query.geometry = null;
            }

            var that = this;
            this.qTask.execute(this.query, function (featureSet) {
                try {
                    that.setFeatures(featureSet.features);
                    that.clusterFeatures();
                    that._map.hideLoader();
                } catch (ex) {
                    throw Error(ex);
                }
            }, function (e) {
                console.error('ClusterLayer:queryFeatures Error: ', e);
                that._map.hideLoader();
            });
        },
        handleMapZoomStart: function () {
            // summary:
            //        clear all graphics when zoom starts
            console.log('esrx/ClusterLayer:handleMapZoomStart', arguments);

            this.clear();
        },
        handleMapExtentChange: function (/*extent, delta, levelChange, lod*/) {
            // summary:
            //        re-cluster on extent change
            //        TODO: maybe only use features that fall within current extent?  Add that as an option?
            console.log('esrx/ClusterLayer:handleMapExtentChange', arguments);

            this.clusterFeatures();
        },
        setFeatures: function (features) {
            // summary:
            //        TODO: why do we do this?
            console.log('esrx/ClusterLayer:setFeatures', arguments);

            this._features = array.map(features, function (feature) {
                var point = feature.geometry;
                point.attributes = feature.attributes;
                return point;
            });
        },
        handleMouseOver: function (evt) {
            // summary:
            //        fires when any graphic (clustered or single) is moused over
            console.log('esrx/ClusterLayer:handleMouseOver', arguments);

            var graphic = evt.graphic;

            // this.expandCluster(graphic);
            if (graphic.attributes.baseGraphic) {
                var bGraphic = graphic.attributes.baseGraphic;
                if (bGraphic.task) {
                    bGraphic.task.cancel();
                }
                this.expandCluster(bGraphic);
            } else if (graphic.attributes.isCluster) {
                if (graphic.task) {
                    graphic.task.cancel();
                }
                this.expandCluster(graphic);
            }
        },
        expandCluster: function (graphic) {
            // summary:
            //      expands the cluster graphic
            console.log('esrx/ClusterLayer:expandCluster', arguments);

            if (graphic.attributes.clustered) {
                return;
            }

            graphic.clusterGraphics = [];

            var cSize = graphic.attributes.clusterSize;
            var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 1]), 1);

            //polyline used to 'tie' flare to cluster
            //set up initially with the center pt of the cluster as the first point and a dummy point @ 0,0 for a placeholder
            var line = new Polyline(this._map.spatialReference);
            line.addPath([graphic.geometry, new Point(0, 0)]);

            //polyline graphic
            var lineGraphic = new Graphic(line, lineSymbol);

            //creating a circle to evenly distribute our flare graphics around
            if (cSize > 1 && cSize <= this._flareLimit) {//cSize > 1 may not be needed
                //takes the number of points (flares) for the cluster
                var numPoints = graphic.attributes.clusterSize;

                //takes the pixel distance from the center of the graphic to flare out the graphics
                var bufferDistance = this.getPixelDistanceFromCenter(graphic.geometry);

                //center of cluster graphic
                var centerPoint = graphic.geometry;

                //variables used to plot points evenly around the cluster
                var dblSinus;
                var dblCosinus;
                var x;
                var y;
                var pt;
                var ptGraphic;
                var p;
                var l;

                for (var i = 0; i < numPoints; i++) {
                    dblSinus = Math.sin((Math.PI * 2.0) * (i / numPoints));
                    dblCosinus = Math.cos((Math.PI * 2.0) * (i / numPoints));
                    x = centerPoint.x + bufferDistance * dblCosinus;
                    y = centerPoint.y + bufferDistance * dblSinus;

                    //constructing the flare graphic point
                    pt = new Point(x, y, this._map.spatialReference);
                    ptGraphic = new Graphic(pt, null, lang.mixin(graphic.attributes[i], {
                        baseGraphic: graphic
                    }), this._infoTemplate);
                    ptGraphic.setSymbol(this.symbolBank.single(ptGraphic));

                    //try to always bring flare graphic to front of everything else
                    p = this.add(ptGraphic);
                    //p.getDojoShape().moveToFront();

                    //reset our 0,0 placeholder point in line to the actual point of the recently created flare graphic
                    line.setPoint(0, 1, pt);
                    lineGraphic = new Graphic(line, lineSymbol, {
                        baseGraphic: graphic
                    });

                    //try to always have connector line behind everything else
                    l = this.add(lineGraphic);
                    l.getDojoShape().moveToBack();

                    //store flare graphic and connector graphic
                    graphic.clusterGraphics.push(p);
                    graphic.clusterGraphics.push(l);
                }

                //set 'clustered' flag
                graphic.attributes.clustered = true;
            }
        },
        getPixelDistanceFromCenter: function (centerGeom) {
            // summary:
            //        helper method to figure out the distance in real world coordinates
            //        starting from a center pt and using a pixel distance
            console.log('esrx/ClusterLayer:getPixelDistanceFromCenter', arguments);

            var distance = this._flareDistanceFromCenter;
            //pixel distance from center
            var screenGeom = screenUtils.toScreenGeometry(this._map.extent, this._map.width, this._map.height, centerGeom);
            screenGeom.x = screenGeom.x + distance;
            screenGeom.y = screenGeom.y + distance;
            var newDistance = screenUtils.toMapGeometry(this._map.extent, this._map.width, this._map.height, screenGeom);
            var length = mathUtils.getLength(centerGeom, newDistance);
            return length;
        },
        handleMouseOut: function (evt) {
            // summary:
            //        fires when any cluster graphic (flare or individual) is moused out of
            //        TODO: this utilizes the DelayedTask from ExtJS's library.  If anyone wants to re-write using Dojo, by all means...
            console.log('esrx/ClusterLayer:handleMouseOut', arguments);

            var graphic = evt.graphic;
            var task;

            var that = this;
            function buildTask(graphic) {
                task = new DelayedTask(function (g) {
                    that.removeFlareGraphics(g);
                }, that, [graphic]);
                task.delay(500);
                return task;
            }

            if (graphic.attributes.isCluster) {
                console.log('isCluster');
                graphic.task = buildTask(graphic);
            } else {
                if (graphic.attributes.baseGraphic) {
                    console.log('isSingleGraphic');
                    graphic.attributes.baseGraphic.task = buildTask(graphic.attributes.baseGraphic);
                }
            }
        },
        removeFlareGraphics: function (g) {
            // summary:
            //        removes the flare graphics from the map when a cluster graphic is moused out
            // g: Graphic
            //        The base graphic that contains a reference to the cluster graphics to be removed
            console.log('esrx/ClusterLayer:removeFlareGraphics', arguments);

            if (g === this.infoWindowBaseGraphic) {
                return;
            }

            var graphics = g.clusterGraphics;
            if (graphics && graphics.length) {
                for (var i = 0; i < graphics.length; i++) {
                    this.remove(graphics[i]);
                }
            }
            delete g.clusterGraphics;
            g.attributes.clustered = false;
        },
        clusterFeatures: function () {
            // summary:
            //        core clustering function
            //        right now, the clustering algorithim is based on the baseMap's tiling scheme (layerIds[0]).
            //        as the comment says below, this can probably be substituted with an origin,
            //        array of grid pixel resolution & grid pixel size.
            //        could probably be cleaned up and compacted a bit more.
            console.log('esrx/ClusterLayer:clusterFeatures', arguments);

            this._map.infoWindow.hide();

            this.clear();

            if (this._features.length === 0) {
                return;
            }

            var df = functional;
            var map = this._map;
            var level = this._map.getLevel() + 2;
            var extent = this._map.extent;

            var tileInfo = map.getLayer(map.layerIds[0]).tileInfo;
            //get current tiling scheme.  This restriction can be removed.  the only thing required is origin, array of grid pixel resolution, & grid pixel size

            var toTileSpaceF = df.lambda('point, tileWidth,tileHeight,oPoint ' + '-> [Math.floor((oPoint.y - point.y)/tileHeight),Math.floor((point.x-oPoint.x)/tileWidth), point]');
            //lambda function to map points to tile space

            var levelResolution = (tileInfo.lods[level]) ? tileInfo.lods[level].resolution : (tileInfo.lods[level - 2].resolution / 4);
            var width = levelResolution * tileInfo.width;
            var height = levelResolution * tileInfo.height;

            var toTileSpace = df.partial(toTileSpaceF, df.arg, width, height, tileInfo.origin);

            //predefine width, height, origin point for toTileSpaceF function
            var extentTileCords = df.map([new Point(extent.xmin, extent.ymin), new Point(extent.xmax, extent.ymax)], toTileSpace);

            //map extent corners to tile sapce
            var minRowIdx = extentTileCords[1][0];
            var maxRowIdx = extentTileCords[0][0];
            var minColIdx = extentTileCords[0][1];
            var maxColIdx = extentTileCords[1][1];

            //points to tiles
            if (!this.levelPointTileSpace[level] || !this.levelPointTileSpace[level][0]) {
                var pointsTileSpace = df.map(this._features, toTileSpace);
                //map all points to tilespace
                var tileSpaceArray = [];
                array.forEach(pointsTileSpace, function (tilePoint /*ptIndex*/) {//swizel points[row,col,point] to row[col[points[]]]
                    var y = tileSpaceArray[tilePoint[0]];
                    if (y) {
                        if (y[tilePoint[1]]) {
                            y[tilePoint[1]].push(tilePoint[2]);
                        } else {
                            y[tilePoint[1]] = [tilePoint[2]];
                        }
                    } else {
                        y = tileSpaceArray[tilePoint[0]] = [];
                        y[tilePoint[1]] = [tilePoint[2]];
                    }
                });
                this.levelPointTileSpace[level] = tileSpaceArray;
                //once this has been computed store this in a level array
            }
            var tileCenterPointF = df.lambda('cPt,nextPt->{x:(cPt.x+nextPt.x)/2,y:(cPt.y+nextPt.y)/2}');

            array.forEach(this.levelPointTileSpace[level], function (row, rowIndex) {
                if (row && (rowIndex >= minRowIdx) && (rowIndex <= maxRowIdx)) {
                    array.forEach(row, function (col, colIndex) {
                        if (col) {
                            if ((colIndex >= minColIdx) && (colIndex <= maxColIdx)) {
                                if (col.length > 1) {//clustered graphic

                                    var tileCenterPoint = df.reduce(col, tileCenterPointF);
                                    var sym;
                                    if (col.length <= 15) {
                                        sym = this.symbolBank.less16;
                                    } else if (col.length > 15 && col.length < 30) {
                                        sym = this.symbolBank.less30;
                                    } else if (col.length > 31 && col.length < 60) {
                                        sym = this.symbolBank.less60;
                                    } else if (col.length > 61 && col.length < 120) {
                                        sym = this.symbolBank.less120;
                                    } else {
                                        sym = this.symbolBank.over120;
                                    }

                                    //get attributes for info window
                                    var atts = array.map(col, function (item) {
                                        return item.attributes;
                                    });
                                    //mixin attributes w/ other properties
                                    var graphicAtts = lang.mixin(atts, {
                                        isCluster: true,
                                        clusterSize: col.length
                                    });

                                    //cluster
                                    var bg = this.add(
                                        new Graphic(
                                            new Point(
                                                tileCenterPoint.x,
                                                tileCenterPoint.y,
                                                this._map.spatialReference
                                            ),
                                            sym,
                                            graphicAtts
                                        )
                                    );

                                    // text symbol
                                    var g = this.add(
                                        new Graphic(
                                            new Point(
                                                tileCenterPoint.x,
                                                tileCenterPoint.y,
                                                this._map.spatialReference
                                            ),
                                            new TextSymbol(col.length).setOffset(0, -5)
                                        )
                                    );
                                    g.setAttributes({baseGraphic: bg});
                                } else {//single graphic
                                    array.forEach(col, function (point) {
                                        // clear baseGraphic if any
                                        delete point.attributes.baseGraphic;

                                        var g = new Graphic(point, null, lang.mixin(point.attributes, {
                                            isCluster: false
                                        }), this._infoTemplate);
                                        g.setSymbol(this.symbolBank.single(g));
                                        this.add(g);
                                    }, this);
                                }
                            }
                        }
                    }, this);
                }
            }, this);
        },
        setDefinitionExpression: function (query, geo) {
            // summary:
            //        Updates the def query to control what features are shown
            console.log('esrx/ClusterLayer:setDefinitionExpression', arguments);

            this.queryFeatures(query, geo);
        },
        handleOnClick: function (evt) {
            // summary:
            //        Fires when the user clicks on a graphic
            console.log('esrx/ClusterLayer:handleOnClick', arguments);

            var g = evt.graphic;
            if (this.infoWindowBaseGraphic !== g.attributes.baseGraphic && this._map.infoWindow.isShowing) {
                this.handleInfoWindowOnHide();
            }

            if (g.attributes.baseGraphic) {
                this.infoWindowBaseGraphic = g.attributes.baseGraphic;
            }

            if (g.symbol.type !== 'textsymbol') {
                var w = this._map.infoWindow;
                w.setTitle(g.getTitle());
                w.setContent(g.getContent());
                w.show(g.geometry);
            }
        },
        handleInfoWindowOnHide: function () {
            // summary:
            //      Fires when the info window is hidden
            console.log('esrx/ClusterLayer:handleInfoWindowOnHide', arguments);

            if (this.infoWindowBaseGraphic) {
                var g = this.infoWindowBaseGraphic;
                delete this.infoWindowBaseGraphic;
                this.removeFlareGraphics(g);
            }
        }
    });
});
