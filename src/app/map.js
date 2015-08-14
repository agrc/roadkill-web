require([
    "agrc/widgets/map/BaseMap",
    "agrc/widgets/map/BaseMapSelector",

    'dijit/registry',

    'dojo/_base/connect',
    'dojo/_base/fx',
    'dojo/_base/window',
    'dojo/dom-class',
    'dojo/dom',
    'dojo/topic',
    'dojo/dom-construct',

    "esri/dijit/Legend",
    "esri/dijit/Popup",
    "esri/layers/FeatureLayer",
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/GraphicsLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/map',
    'esri/graphic',
    'esri/dijit/HomeButton',

    "esrx/ClusterLayer",

    "ext/DelayedTask",

    "ijit/widgets/layout/PaneStack",

    "roadkill/DataFilter",
    "roadkill/DownloadData",
    "roadkill/Identify",
    "roadkill/MapChart",
    "roadkill/Print",


    "roadkill/Toc",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/TitlePane"
], function (
    BaseMap,
    BaseMapSelector,

    registry,

    connect,
    fx,
    win,
    domClass,
    dom,
    topic,
    domConstruct,

    Legend,
    Popup,
    FeatureLayer,
    ArcGISDynamicMapServiceLayer,
    GraphicsLayer,
    ArcGISTiledMapServiceLayer,
    Map,
    Graphic,
    HomeButton,

    ClusterLayer,

    DelayedTask,

    PaneStack,

    Datafilter,
    DownloadData,
    Identify,
    MapChart,
    Print
    ) {
    ROADKILL.mapapp = {
        // rkFeatureServiceUrl: String
        //      The roadkill feature service url

        // map: BaseMap
        map: null,
        
        // bufferSymbol: esri.SimpleFillSymbol
        bufferSymbol: {
            "color":[0,255,0,64],
            "outline":{
                "color":[0,0,0,150],
                "width":1,
                "type":"esriSLS",
                "style":"esriSLSSolid"
            },
            "type":"esriSFS","style":"esriSFSSolid"
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
        
        // bmSelector: BaseMapSelector
        bmSelector: null,
        
        // backgroundLyr: ArcGISDynamicMapServiceLayer
        backgroundLyr: null,

        init: function () {
            // summary:
            //      first function to fire after page loads
            console.info("mapapp:init", arguments);
            
            var pStack;
            pStack = new PaneStack(null, 'pane-stack');
            
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
            console.info("mapapp:initMap", arguments);
            
            dom.byId('map-div').innerHTML = '';
            
            this.map = new BaseMap('map-div', {
                useDefaultBaseMap: false,
                infoWindow: roadkill.Identify.getPopup(),
                showInfoWindowOnClick: false
            });
            var home = new HomeButton({
                map: this.map
            }, 'HomeButtonDiv');
            home.startup();

            this.bmSelector = new BaseMapSelector({
                map: this.map,
                id: "claro",
                position: "TR"
            });

            this.backgroundLyr = new ArcGISDynamicMapServiceLayer(ROADKILL.rkMapServiceUrl, {
                opacity: 0.5
            });
            
            this.pointsLyr = new ArcGISDynamicMapServiceLayer(ROADKILL.rkPointsLayerUrl);
            
            // this is only used for the legend and get the renderer for the cluster layer
            var fLayer = new FeatureLayer(ROADKILL.rkFeatureServiceUrl);
            this.fLayer = fLayer;
            
            var that = this;
            connect.connect(fLayer, "onLoad", function(){
                that.cLayer = new ClusterLayer({
                    url: ROADKILL.clusterLayerUrl,
                    displayOnPan: false,
                    map: that.map,
                    infoTemplate: roadkill.Identify.getTemplate(),
                    singleSymbolRenderer: fLayer.renderer,
                    initDefQuery: ROADKILL.dateQueries['6m']
                });
                that.cLayer.spatialReference = that.fLayer.spatialReference;
                
                roadkill.Identify.init({map: that.map, layer: that.cLayer});
                
                that.initDataFilter(that.cLayer);
                
                that.bufferLyr = new GraphicsLayer();
                that.map.addLayer(that.bufferLyr);
                
                that.map.addLayer(that.cLayer);
                
                that.initPrint();
                
                that.hideLoadingMessage();
            });
            
            this.map.addLayer(this.backgroundLyr);
            this.map.addLayer(this.pointsLyr);
            
            var toc = new roadkill.Toc({
                layer: this.backgroundLyr, 
                pointsLayer: this.pointsLyr
            }, "toc");
            toc.startup();
        },
        initLegend: function() {
            // summary:
            //      Sets up the legend. Had to associate the legend with a hidden map because I couldn't get 
            //      it to work with the cluster layer correctly.
            console.info("mapapp:initLegend", arguments);
            
            var mp = new Map("legend-map");
            
            var lyrs = [];
            // lyrs.push(new ArcGISTiledMapServiceLayer("https://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/Vector/MapServer"));
            lyrs.push(new FeatureLayer(ROADKILL.rkFeatureServiceUrl, {mode: FeatureLayer.MODE_SELECTION}));
            
            var that = this;
            mp.on("layer-add-result", function(){
                that.legend = new Legend({
                    layerInfos: [{
                        layer: lyrs[0],
                        title: "Species"
                    }],
                    map: mp,
                    respectCurrentMapScale: false
                }, "legend");
                that.legend.startup();
            });
            
            mp.addLayers(lyrs);
        },
        initDataFilter: function(lyr) {
            // summary:
            //      sets up the data filter widget
            console.info("mapapp:initDataFilter", arguments);

            this.df = new roadkill.DataFilter({
                layer: lyr
            }, "data-filter");
            this.df.startup();
            
            var that = this;
            connect.connect(this.df.routeMilepostFilter, "onComplete", function(bufferGeo){
                var g = new Graphic({
                    geometry: bufferGeo,
                    symbol: that.bufferSymbol
                });
                that.bufferLyr.clear();
                that.bufferLyr.add(g);
                that.map.setExtent(bufferGeo.getExtent(), true);
            });
            connect.connect(this.df.routeMilepostFilter, "onClear", function(){
                that.bufferLyr.clear();
            });
            
            var dd = new roadkill.DownloadData({dataFilter: this.df}, 'download-data');
            dd.startup();
        },
        hideLoadingMessage: function() {
            // summary:
            //      Hides the modal dialog
            console.info("mapapp:hideLoadingMessage", arguments);
            
            var node = dom.byId('loading-dialog');
            fx.fadeOut({
                node: node,
                onEnd: function(){
                    domClass.add(node, 'hidden');
                }
            }).play();
        },
        showLoadingMessage: function(){
            // summary:
            //      shows the loading modal dialog
            console.info('mapapp::showLoadingMessage', arguments);
            
            domClass.remove('loading-dialog', 'hidden');
        },
        initSpeciesChart: function(cl){
            // summary:
            //      sets up the MapChart
            console.info('mapapp::initSpeciesChart', arguments);
            
            this.speciesChart = new roadkill.MapChart({chartDiv: 'species-chart', cLayer: cl});
        },
        wireEvents: function(){
            // summary:
            //      wires the events for the page
            console.info("mapapp::wireEvents", arguments);
            
            var that = this;
            connect.connect(registry.byId('species-chart-pane'), "onShow", function(){
                if (!that.speciesChart) {
                    that.initSpeciesChart(that.cLayer);
                }
            });
        },
        initPrint: function(){
            // summary:
            //      
            console.info('mapapp::initPrint', arguments);
            
            var print;
            print = new Print({
                cLayer: this.cLayer,
                map: this.map,
                dataFilter: this.df,
                bmSelector: this.bmSelector,
                bgLayer: this.backgroundLyr,
                pointsLayer: this.pointsLyr
            }, 'print-div');
        }
    };

    if (ROADKILL.login.user){
        ROADKILL.mapapp.init();
    } else {
        topic.subscribe(ROADKILL.login.topics.signInSuccess, function(){
            ROADKILL.mapapp.init();
        });
    }
});
