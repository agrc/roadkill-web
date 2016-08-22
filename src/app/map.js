require([
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/DataFilter',
    'app/DownloadData',
    'app/Identify',
    'app/MapChart',
    'app/Print',
    'app/Toc',

    'dijit/registry',

    'dojo/dom',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/topic',
    'dojo/_base/connect',
    'dojo/_base/fx',
    'dojo/_base/window',

    'esri/dijit/Legend',
    'esri/dijit/Popup',
    'esri/geometry/Extent',
    'esri/graphic',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/FeatureLayer',
    'esri/layers/GraphicsLayer',
    'esri/map',

    'esrx/ClusterLayer',

    'ext/DelayedTask',

    'ijit/widgets/layout/PaneStack',

    'layer-selector/LayerSelector',

    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane',
    'dijit/TitlePane'
], function (
    BaseMap,

    config,
    DataFilter,
    DownloadData,
    Identify,
    MapChart,
    Print,
    Toc,

    registry,

    dom,
    domClass,
    domConstruct,
    topic,
    connect,
    fx,
    win,

    Legend,
    Popup,
    Extent,
    Graphic,
    ArcGISDynamicMapServiceLayer,
    ArcGISTiledMapServiceLayer,
    FeatureLayer,
    GraphicsLayer,
    Map,

    ClusterLayer,

    DelayedTask,

    PaneStack,

    LayerSelector
) {
    config.mapapp = {
        // rkFeatureServiceUrl: String
        //      The roadkill feature service url

        // map: BaseMap
        map: null,

        // bufferSymbol: esri.SimpleFillSymbol
        bufferSymbol: {
            color: [0, 255, 0, 64],
            outline: {
                color: [0, 0, 0, 150],
                width: 1,
                type: 'esriSLS',
                style: 'esriSLSSolid'
            },
            type: 'esriSFS',
            style: 'esriSFSSolid'
        },

        // bufferLyr: GraphicsLayer
        bufferLyr: null,

        // legend: esri.dijit.Legend
        legend: null,

        // cLayer: esrx.ClusterLayer
        cLayer: null,

        // speciesChart: roadkill.MapChart
        speciesChart: null,

        // df: roadkill.DataFilter
        df: null,

        // backgroundLyr: ArcGISDynamicMapServiceLayer
        backgroundLyr: null,

        init: function () {
            // summary:
            //      first function to fire after page loads
            console.info('mapapp:init', arguments);

            var pStack = new PaneStack(null, 'pane-stack');
            pStack.startup();

            // preventing flash of unstyled html
            domClass.remove('left-sidebar', 'hidden');
            registry.byId('main-container').resize();

            this.showLoadingMessage();

            this.initMap();

            this.initLegend();

            this.wireEvents();

            // move out of border container so that drop down doesn't get cut off
            domConstruct.place('logoutDiv', win.body(), 'first');
        },
        initMap: function () {
            // summary:
            //      initializes the agrc.widgets.BaseMap
            console.info('mapapp:initMap', arguments);

            dom.byId('map-div').innerHTML = '';

            this.map = new BaseMap('map-div', {
                useDefaultBaseMap: false,
                infoWindow: Identify.getPopup(),
                showInfoWindowOnClick: false,
                extent: new Extent({
                    xmax: -11762120.612131765,
                    xmin: -13074391.513731329,
                    ymax: 5225035.106177688,
                    ymin: 4373832.359194187,
                    spatialReference: {
                        wkid: 3857
                    }
                }),
                includeFullExtentButton: true
            });

            this.layerSelector = new LayerSelector({
                map: this.map,
                quadWord: config.quadWord,
                baseLayers: ['Terrain', 'Hybrid', 'Lite', 'Topo']
            });
            this.layerSelector.startup();

            this.backgroundLyr = new ArcGISDynamicMapServiceLayer(config.rkMapServiceUrl, {
                opacity: 0.5
            });

            this.pointsLyr = new ArcGISDynamicMapServiceLayer(config.rkPointsLayerUrl);

            // this is only used for the legend and get the renderer for the cluster layer
            var fLayer = new FeatureLayer(config.rkFeatureServiceUrl, {
                spatialReference: this.map.spatialReference
            });
            this.fLayer = fLayer;

            var that = this;
            fLayer.on('load', function () {
                that.cLayer = new ClusterLayer({
                    url: config.clusterLayerUrl,
                    displayOnPan: false,
                    map: that.map,
                    infoTemplate: Identify.getTemplate(),
                    singleSymbolRenderer: fLayer.renderer,
                    initDefQuery: config.dateQueries['6m']
                });
                that.cLayer.spatialReference = that.fLayer.spatialReference;

                Identify.init({
                    map: that.map,
                    layer: that.cLayer
                });

                that.initDataFilter(that.cLayer);

                that.bufferLyr = new GraphicsLayer();
                that.map.addLayer(that.bufferLyr);

                that.map.addLayer(that.cLayer);

                that.initPrint();

                that.hideLoadingMessage();
            });

            this.map.addLayer(this.backgroundLyr);
            this.map.addLayer(this.pointsLyr);

            var toc = new Toc({
                layer: this.backgroundLyr,
                pointsLayer: this.pointsLyr
            }, 'toc');
            toc.startup();
        },
        initLegend: function () {
            // summary:
            //      Sets up the legend. Had to associate the legend with a hidden map because I couldn't get
            //      it to work with the cluster layer correctly.
            console.info('mapapp:initLegend', arguments);

            var mp = new Map('legend-map');

            var lyrs = [];
            lyrs.push(new FeatureLayer(config.rkFeatureServiceUrl, {
                mode: FeatureLayer.MODE_SELECTION
            }));

            var that = this;
            mp.on('layer-add-result', function () {
                that.legend = new Legend({
                    layerInfos: [{
                        layer: lyrs[0],
                        title: 'Species'
                    }],
                    map: mp,
                    respectCurrentMapScale: false
                }, 'legend');
                that.legend.startup();
            });

            mp.addLayers(lyrs);
        },
        initDataFilter: function (lyr) {
            // summary:
            //      sets up the data filter widget
            console.info('mapapp:initDataFilter', arguments);

            this.df = new DataFilter({
                layer: lyr
            }, 'data-filter');
            this.df.startup();

            var that = this;
            connect.connect(this.df.routeMilepostFilter, 'onComplete', function (bufferGeo) {
                var g = new Graphic({
                    geometry: bufferGeo,
                    symbol: that.bufferSymbol
                });
                that.bufferLyr.clear();
                that.bufferLyr.add(g);
                that.map.setExtent(bufferGeo.getExtent(), true);
            });
            connect.connect(this.df.routeMilepostFilter, 'onClear', function () {
                that.bufferLyr.clear();
            });

            var dd = new DownloadData({
                dataFilter: this.df
            }, 'download-data');
            dd.startup();
        },
        hideLoadingMessage: function () {
            // summary:
            //      Hides the modal dialog
            console.info('mapapp:hideLoadingMessage', arguments);

            $('#loading-dialog').modal('hide');
        },
        showLoadingMessage: function () {
            // summary:
            //      shows the loading modal dialog
            console.info('mapapp::showLoadingMessage', arguments);

            $('#loading-dialog').modal({
                keyboard: false,
                backdrop: 'static'
            });
        },
        initSpeciesChart: function (cl) {
            // summary:
            //      sets up the MapChart
            console.info('mapapp::initSpeciesChart', arguments);

            this.speciesChart = new MapChart({
                chartDiv: 'species-chart',
                cLayer: cl
            });
        },
        wireEvents: function () {
            // summary:
            //      wires the events for the page
            console.info('mapapp::wireEvents', arguments);

            var that = this;
            connect.connect(registry.byId('species-chart-pane'), 'onShow', function () {
                if (!that.speciesChart) {
                    that.initSpeciesChart(that.cLayer);
                }
            });
        },
        initPrint: function () {
            // summary:
            //
            console.info('mapapp::initPrint', arguments);

            var print = new Print({
                cLayer: this.cLayer,
                map: this.map,
                dataFilter: this.df,
                layerSelector: this.layerSelector,
                bgLayer: this.backgroundLyr,
                pointsLayer: this.pointsLyr
            }, 'print-div');
            print.startup();
        }
    };

    if (config.login.user) {
        config.mapapp.init();
    } else {
        topic.subscribe(config.login.topics.signInSuccess, function () {
            config.mapapp.init();
        });
    }
});
