define([
    'app/config',

    'dojo/dom-construct',
    'dojo/text!html/infoTemplateContent.html',
    'dojo/_base/Color',
    'dojo/_base/lang',

    'esri/dijit/Popup',
    'esri/InfoTemplate',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol'
], function (
    config,

    domConstruct,
    infoTemplate,
    Color,
    lang,

    Popup,
    InfoTemplate,
    SimpleFillSymbol,
    SimpleLineSymbol
) {
    return {
        // summary:
        //        Handles everything related to identifying features on the map

        // template: esri.InfoTemplate
        template: null,

        // layer: esri.FeatureLayer
        layer: null,

        // popup: esri.dijit.Popup
        popup: null,

        init: function (params) {
            // summary:
            //        sets up the identify
            // params: {map: esri.Map, layer: esri.FeatureLayer}
            console.info('roadkill.identify:init', arguments);

            lang.mixin(this, params);

            this.popup.resize(350, 370);

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      wires the events
            console.info('roadkill.identify:wireEvents', arguments);

            config.mapapp.map.on('click', lang.hitch(this, 'onMapClick'));
        },
        getContent: function (graphic) {
            // summary:
            //        Gets the content for the info window
            // graphic: esri.Graphic
            // returns: String
            //        The HTML for the info window
            console.info('roadkill.identify:getContent', arguments);

            return graphic.getContent();
        },
        getPopup: function () {
            // summary:
            //        Builds and returns the custom popup
            // returns: esri.dijit.Popup
            console.info('roadkill.identify:getPopup', arguments);

            this.popup = new Popup({
                fillSymbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25])),
                highlight: false
            }, domConstruct.create('div'));

            return this.popup;
        },
        getTemplate: function () {
            // summary:
            //        Builds and returns the info template for the feature layer
            // returns: esri.InfoTemplate
            console.info('roadkill.identify:getTemplate', arguments);

            this.template = new InfoTemplate('${' + config.fields.SPECIES +
                '} | ${' + config.fields.REPORT_DATE + ':DateString(local: false, hideTime: true)}',
                infoTemplate);

            return this.template;
        },
        onMapClick: function (evt) {
            // summary:
            //      fires when the user clicks on the map
            //        clears the infowindow if opened
            console.info('roadkill.identify:onMapClick', arguments);

            if (!evt.graphic || evt.graphic.symbol.style !== 'diamond') {
                config.mapapp.map.infoWindow.hide();
            }
        }
    };
});
