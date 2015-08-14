/*global dojo, console, dijit, roadkill, esri*/

// provide namespace
dojo.provide("roadkill.Print");

// dojo widget requires
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("esri.tasks.FeatureSet");
dojo.require('esri.graphic');
dojo.require('esri.tasks.Geoprocessor');

// other dojo requires

dojo.declare("roadkill.Print", [dijit._Widget, dijit._Templated], {
	// description:
	//      prints the map

	// widgetsInTemplate: [private] Boolean
	//      Specific to dijit._Templated.
	widgetsInTemplate: true,

	// templatePath: [private] String
	//      Path to template. See dijit._Templated
	templatePath: dojo.moduleUrl("roadkill", "templates/Print.html"),

	// baseClass: [private] String
	//    The css class that is applied to the base div of the widget markup
	baseClass: "print-widget",
	
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

	constructor: function(params, div) {
		// summary:
		//    Constructor method
		// params: Object
		//    Parameters to pass into the widget. Required values include:
		// div: String|DomNode
		//    A reference to the div that you want the widget to be created in.
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
	},
	initGP: function(){
		// summary:
		//      sets up the geoprocessor
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.gp = new esri.tasks.Geoprocessor(ROADKILL.gpPrintUrl);
		
		this.connect(this.gp, 'onJobComplete', 'onJobComplete');
		this.connect(this.gp, 'onStatusUpdate', 'onStatusUpdate');
		this.connect(this.gp, 'onError', 'onJobError');
		this.connect(this.gp, 'onGetResultDataComplete', 'onGetResultDataComplete');
	},
	postCreate: function() {
		// summary:
		//    Overrides method of same name in dijit._Widget.
		// tags:
		//    private
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this._wireEvents();
	},
	_wireEvents: function() {
		// summary:
		//    Wires events.
		// tags:
		//    private
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this.connect(this.printBtn, 'onclick', 'print');
	},
	print: function() {
		// summary:
		//      when the user clicks the print button
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		if (!this.gp) {
			this.initGP();
		}
		
		this.showMsg('Generating map...');
		
		var input = {
			baseMap: this.bmSelector.currentTheme.label,
			extent: dojo.toJson(this.map.extent),
			routeBuffer: this.getRouteBuffer(),
			visibleLayers: this.getVisibleLayers(),
			defQueryTxt: this.dataFilter.updateDefinitionQuery()
		};
		
		dojo.mixin(input, this.getGraphics());
		
		this.gp.submitJob(input);
	},
	getRouteBuffer: function(){
		// summary:
		//      description
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		if (this.dataFilter.queryGeo) {
			var fset = new esri.tasks.FeatureSet();
			
			fset.features.push(new esri.graphic(this.dataFilter.queryGeo));
		
			return fset;
		} else {
			return '';
		}
	},
	getGraphics: function(){
		// summary:
		//      description
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		var fset = new esri.tasks.FeatureSet();
		var singleIds = [];
	
		var features = [];
		dojo.forEach(this.cLayer.graphics, function(g){
			if (g.attributes.isCluster){
				features.push(new esri.graphic({
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
			singleFeatures: (singleIds.length > 0) ? dojo.toJson(singleIds) : '',
			clusterFeatures: (fset.features.length > 0) ? dojo.toJson(fset) : ''
		};
	},
	showMsg: function(msg){
		// summary:
		//      show the message box
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		if (!this.printBtn.disabled) {
			this.printBtn.disabled = true;
		}
		
		dojo.addClass(this.msgBox, 'info');
		dojo.removeClass(this.msgBox, 'error');
		
		dojo.style(this.msgLoader, 'display', 'inline-block');
		
		this.msg.innerHTML = msg;
		
		dojo.style(this.msgBox, 'display', 'block');
		dojo.fadeIn({node: this.msgBox}).play();
	},
	showErrorMsg: function(msg){
		// summary:
		//      show the error message box
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		dojo.addClass(this.msgBox, 'error');
		dojo.removeClass(this.msgBox, 'info');
		dojo.removeClass(this.msgBox, 'success');
		
		this.msg.innerHTML = msg;
		
		dojo.style(this.msgBox, {
			'display': 'block',
			'opacity': 1
		});
		
		dojo.style(this.msgLoader, 'display', 'none');
		
		this.printBtn.disabled = false;
	},
	onJobComplete: function(status){
		// summary:
		//      fires when the gp job is complete
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		if (status.jobStatus === 'esriJobSucceeded'){
			this.gp.getResultData(status.jobId, 'outFile');
		} else {
			this.onJobError({message: status.jobStatus});
		}
	},
	onStatusUpdate: function(status){
		// summary:
		//      description
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		// this was just used for debugging
		
		// var ul = dojo.create('ul');
		// dojo.forEach(status.messages, function(msg){
			// dojo.create('li', {
				// innerHTML: msg.description
			// }, ul);
		// });
		// this.msg.innerHTML = '';
		// dojo.place(ul, this.msg);
		if (status.messages.length > 0) {
			console.log(status.messages[status.messages.length -1].description);
		}
	},
	onJobError: function(er){
		// summary:
		//      description
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.showErrorMsg('There was an error with the print service.');
	},
	onGetResultDataComplete: function(result){
		// summary:
		//		
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		dojo.addClass(this.msgBox, 'success');
		dojo.removeClass(this.msgBox, 'info');
		dojo.removeClass(this.msgBox, 'error');
		
		dojo.style(this.msgLoader, 'display', 'none');
		
		this.printBtn.disabled = false;
		
		this.msg.innerHTML = '';
		
		dojo.create('a', {
			innerHTML: this.aMsg,
			href: result.value.url,
			target: '_blank'
		}, this.msg);
	},
	getVisibleLayers: function(){
		// summary:
		//      Returns the visible layer names if the map service layers themselves are visible
		// returns: String
		//        Empty string if no layers are visible
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		function searchLayer(layer) {
		    if (layer.visibleLayers.length > 0 && layer.visible) {
                return dojo.map(layer.visibleLayers, function (id) {
                    // get name of layer
                    var name;
                    dojo.some(layer.layerInfos, function (info) {
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
