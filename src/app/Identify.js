define([
    'dojo/_base/lang',
    'dojo/_base/Color',

    'dojo/dom-construct',

    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/dijit/Popup',
    'esri/InfoTemplate',

    'dojo/text!html/infoTemplateContent.html'

], function (
    lang,
    Color,

    domConstruct,

    SimpleFillSymbol,
    SimpleLineSymbol,
    Popup,
    InfoTemplate,

    infoTemplate
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

            ROADKILL.mapapp.map.on('click', lang.hitch(this, 'onMapClick'));
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

            this.template = new InfoTemplate('${' + ROADKILL.fields.SPECIES +
                '} | ${' + ROADKILL.fields.REPORT_DATE + ':DateString(local: false, hideTime: true)}',
                infoTemplate);

            return this.template;
        },
        onMapClick: function (evt) {
            // summary:
            //      fires when the user clicks on the map
            //        clears the infowindow if opened
            console.info('roadkill.identify:onMapClick', arguments);

            if (!evt.graphic || evt.graphic.symbol.style !== 'diamond') {
                ROADKILL.mapapp.map.infoWindow.hide();
            }
        }
    };
});
