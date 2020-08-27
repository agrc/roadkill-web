define([
    'agrc/modules/HelperFunctions',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-attr',
    'dojo/query',
    'dojo/text!app/templates/Toc.html',
    'dojo/_base/declare'
], function (
    HelperFunctions,

    _TemplatedMixin,
    _WidgetBase,

    domAttr,
    query,
    template,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      toc for map
        templateString: template,

        // visibleLayers: [String]
        //        The visible layers array used when calling layer.setVisibleLayers
        visibleLayers: null,

        // Parameters to constructor

        // layer: esri.layers.ArcGISDynamicMapServiceLayer
        layer: null,

        // pointsLayer: esri.layers.ArcGISDynamicMapServiceLayer
        pointsLayer: null,

        constructor: function () {
            // summary:
            //    Constructor method
            // params: Object
            //    Parameters to pass into the widget. Required values include:
            // div: String|DomNode
            //    A reference to the div that you want the widget to be created in.
            console.log('app/Toc:constructor', arguments);

            this.visibleLayers = [];
        },
        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/Toc:postCreate', arguments);

            this._wireEvents();
        },
        _wireEvents: function () {
            // summary:
            //    Wires events.
            // tags:
            //    private
            console.log('app/Toc:_wireEvents', arguments);

            this.connect(this.backgroundCheckbox, 'onclick', this.onBackgroundCheckboxChange);
            this.connect(this.udwrRadioBtn, 'onclick', this.refreshVisibleLayers);
            this.connect(this.udotRadioBtn, 'onclick', this.refreshVisibleLayers);
            this.connect(this.crossingsCheckbox, 'onclick', this.toggleLayer);
            this.connect(this.fencingCheckbox, 'onclick', this.toggleLayer);
            this.connect(this.milepostsCheckbox, 'onclick', this.toggleLayer);
            this.connect(this.wmuRadioBtn, 'onclick', this.refreshVisibleLayers);
            this.connect(this.contractedRoutesCheckbox, 'onclick', this.toggleContractedRoutes);
        },
        onBackgroundCheckboxChange: function () {
            // summary:
            //      Fires when the user clicks on the background checkbox
            console.log('app/Toc:onBackgroundCheckboxChange', arguments);

            var checked = this.backgroundCheckbox.checked;
            this.toggleBackgroundRadioButtons(checked);

            this.refreshVisibleLayers();

            this.layer.setVisibility(checked);
        },
        toggleBackgroundRadioButtons: function (enable) {
            // summary:
            //      toggles the disabled state of the background radio buttons
            console.log('app/Toc:toggleBackgroundRadioButtons', arguments);

            query('.background-layer input[type="radio"]').forEach(function (node) {
                domAttr.set(node, 'disabled', !enable);
            });
        },
        refreshVisibleLayers: function () {
            // summary:
            //      refreshes the visible layers
            console.log('app/Toc:refreshVisibleLayers', arguments);

            var backId = parseInt(HelperFunctions.getSelectedRadioValue('background-layers'), 10);
            this.visibleLayers = [backId];
            this.layer.setVisibleLayers(this.visibleLayers);
        },
        toggleLayer: function () {
            // summary:
            //      description
            console.log('app/Toc:toggleLayer', arguments);

            var lyrs = [];
            if (this.crossingsCheckbox.checked) {
                lyrs.push(0);
            }
            if (this.fencingCheckbox.checked) {
                lyrs.push(1);
            }
            if (this.milepostsCheckbox.checked) {
                lyrs.push(2);
            }
            if (lyrs.length === 0) {
                this.pointsLayer.setDefaultVisibleLayers();
            } else {
                this.pointsLayer.setVisibleLayers(lyrs);
            }
        },
        toggleContractedRoutes: function () {
            // summary:
            //      toggle the contracted routes feature layer on and off
            console.log('app/Toc:toggleContractedRoutes', arguments);

            this.contractedRoutesLayer.setVisibility(this.contractedRoutesCheckbox.checked);
        }
    });
});
