/*global dojo, console, dijit, esri, roadkill*/
/*jslint sub:true*/

// provide namespace
dojo.provide("roadkill.DownloadData");

// dojo widget requires
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

// other dojo requires
dojo.require('esri.tasks.Geoprocessor');

dojo.declare("roadkill.DownloadData", [dijit._Widget, dijit._Templated], {
	// description:
	//		A widget that allows the user to download roadkill data.
	//		Can choose to either download the entire database or a subset
	//		as defined by the data filter.

	// widgetsInTemplate: [private] Boolean
	//      Specific to dijit._Templated.
	widgetsInTemplate: false,

	// templatePath: [private] String
	//      Path to template. See dijit._Templated
	templatePath: dojo.moduleUrl("roadkill", "templates/DownloadData.html"),

	// baseClass: [private] String
	//    The css class that is applied to the base div of the widget markup
	baseClass: "download-data",
	
	// gp: esri.tasks.Geoprocessor
	gp: null,
	
	// erMsg: String
	erMsg: 'There was an error with the data download service.',
	
	// waitMsg: String
	waitMsg: 'Your data is being prepared. This may take a few minutes...',
	
	// aMsg: String
	aMsg: 'Click here for your data.',

	// Parameters to constructor
	
	// dataFilter: roadkill.DataFilter
	dataFilter: null,

	constructor: function(params, div) {
		// summary:
		//    Constructor method
		// params: Object
		//    Parameters to pass into the widget. Required values include:
		// div: String|DomNode
		//    A reference to the div that you want the widget to be created in.
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
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

		this.connect(this.downloadBtn, 'onclick', 'onDownloadClick');
	},
	onDownloadClick: function() {
		// summary:
		//      fires when the user clicks the download button
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.downloadBtn.disabled = true;
		
		dojo.addClass(this.msgBox, 'info');
		dojo.removeClass(this.msgBox, 'error');
		
		dojo.style(this.msgLoader, 'display', 'inline-block');
		
		this.msg.innerHTML = this.waitMsg;
		
		dojo.style(this.msgBox, 'display', 'block');
		dojo.fadeIn({node: this.msgBox}).play();
		
		var fType = this.getFileType();
		var query = this.getDefinitionQuery();
		
		if (!this.gp) {
			this.initGeoprocessor();
		}
		
		var params = {
			defQuery: query,
			fileType: fType
		};
		
		if (this.dataFilter && this.dataFilter.queryGeo) {
			var geo = this.dataFilter.queryGeo;
			var g = new esri.Graphic(geo);
			var fSet = new esri.tasks.FeatureSet();
			fSet.features = [g];
			params.area = fSet;
		} else {
			params.area = '';
		}
		
		console.log(params);
		this.gp.submitJob(params);
	},
	getFileType: function() {
		// summary:
		//		returns the file type selected
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		return (this.dbfRB.checked) ? 'dbf' : 'shape';
	},
	getDefinitionQuery: function(){
		// summary:
		//      gets the def query from the dataFilter
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		if (this.dataFilter){
			// Server doesn't like GETDATE and arcpy doesn't like CURRENT_DATE.
			// Thanks, ESRI!
			return this.dataFilter.updateDefinitionQuery().replace('CURRENT_DATE', 'GETDATE');
		} else {
			return '1 = 1';
		}
	},
	initGeoprocessor: function(){
		// summary:
		//      creates the esri geoprocessor object
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.gp = new esri.tasks.Geoprocessor(ROADKILL.gpDownloadUrl);
		
		this.connect(this.gp, 'onJobComplete', 'onJobComplete');
		this.connect(this.gp, 'onStatusUpdate', 'onStatusUpdate');
		this.connect(this.gp, 'onError', 'onJobError');
		this.connect(this.gp, 'onGetResultDataComplete', 'onGetResultDataComplete');
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
		
		if (status.messages.length > 0) {
			console.log(status.messages[status.messages.length -1].description);
		}
	},
	onJobError: function(er){
		// summary:
		//      description
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		dojo.addClass(this.msgBox, 'error');
		dojo.removeClass(this.msgBox, 'info');
		
		this.msg.innerHTML = this.erMsg;
		
		dojo.style(this.msgBox, {
			'display': 'block',
			'opacity': 1
		});
		
		dojo.style(this.msgLoader, 'display', 'none');
		
		this.downloadBtn.disabled = false;
	},
	onGetResultDataComplete: function(result){
		// summary:
		//      description
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		dojo.addClass(this.msgBox, 'success');
		dojo.removeClass(this.msgBox, 'info');
		dojo.removeClass(this.msgBox, 'error');
		
		dojo.style(this.msgLoader, 'display', 'none');
		
		this.downloadBtn.disabled = false;
		
		this.msg.innerHTML = '';
		
		dojo.create('a', {
			innerHTML: this.aMsg,
			href: result.value.url
		}, this.msg);
	}
});
