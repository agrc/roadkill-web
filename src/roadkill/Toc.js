/*global dojo, dijit, console, agrc*/
dojo.provide("roadkill.Toc");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("agrc.modules.HelperFunctions");

dojo.declare("roadkill.Toc", [dijit._Widget, dijit._Templated], {
    // description:
    //      toc for map

    // widgetsInTemplate: [private] Boolean
    //      Specific to dijit._Templated.
    widgetsInTemplate : true,

    // templatePath: [private] String
    //      Path to template. See dijit._Templated
    templatePath : dojo.moduleUrl("roadkill", "templates/Toc.html"),

    // visibleLayers: [String]
    //		The visible layers array used when calling layer.setVisibleLayers
    visibleLayers : null,

    // Parameters to constructor

    // layer: esri.layers.ArcGISDynamicMapServiceLayer
    layer : null,
    
    // pointsLayer: esri.layers.ArcGISDynamicMapServiceLayer
    pointsLayer: null,

    constructor : function(params, div) {
        // summary:
        //    Constructor method
        // params: Object
        //    Parameters to pass into the widget. Required values include:
        // div: String|DomNode
        //    A reference to the div that you want the widget to be created in.
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        this.visibleLayers = [];
    },
    postCreate : function() {
        // summary:
        //    Overrides method of same name in dijit._Widget.
        // tags:
        //    private
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        this._wireEvents();
    },
    _wireEvents : function() {
        // summary:
        //    Wires events.
        // tags:
        //    private
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        this.connect(this.backgroundCheckbox, "onclick", this.onBackgroundCheckboxChange);
        this.connect(this.udwrRadioBtn, "onclick", this.refreshVisibleLayers);
        this.connect(this.udotRadioBtn, "onclick", this.refreshVisibleLayers);
        this.connect(this.crossingsCheckbox, 'onclick', this.toggleLayer);
        this.connect(this.fencingCheckbox, 'onclick', this.toggleLayer);
        this.connect(this.milepostsCheckbox, 'onclick', this.toggleLayer);
        this.connect(this.wmuRadioBtn, 'onclick', this.refreshVisibleLayers);
    },
    onBackgroundCheckboxChange : function(evt) {
        // summary:
        //      Fires when the user clicks on the background checkbox
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        var checked = this.backgroundCheckbox.checked;
        this.toggleBackgroundRadioButtons(checked);

        this.refreshVisibleLayers();

        this.layer.setVisibility(checked);
    },
    toggleBackgroundRadioButtons : function(enable) {
        // summary:
        //      toggles the disabled state of the background radio buttons
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        dojo.query(".background-layer input[type='radio']").forEach(function(node) {
            dojo.attr(node, "disabled", !enable);
        });
    },
    refreshVisibleLayers : function() {
        // summary:
        //      refreshes the visible layers
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        var backId = parseInt(agrc.modules.HelperFunctions.getSelectedRadioValue('background-layers'), 10);
        this.visibleLayers = [backId];
        this.layer.setVisibleLayers(this.visibleLayers);
    },
    toggleLayer: function(){
        // summary:
        //      description
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
        
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
    }
});
