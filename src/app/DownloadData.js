define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/text!app/templates/DownloadData.html',
    'dojo/_base/declare',
    'dojo/_base/fx',

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
    declare,
    baseFx,

    Graphic,
    FeatureSet,
    Geoprocessor
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //        A widget that allows the user to download roadkill data.
        //        Can choose to either download the entire database or a subset
        //        as defined by the data filter.

        templateString: template,
        baseClass: 'download-data',

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

        constructor: function () {
            // summary:
            //    Constructor method
            // params: Object
            //    Parameters to pass into the widget. Required values include:
            // div: String|DomNode
            //    A reference to the div that you want the widget to be created in.
            console.log('app/DownloadData:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/DownloadData:postCreate', arguments);

            this._wireEvents();
        },
        _wireEvents: function () {
            // summary:
            //    Wires events.
            // tags:
            //    private
            console.log('app/DownloadData:_wireEvents', arguments);

            this.connect(this.downloadBtn, 'onclick', 'onDownloadClick');
        },
        onDownloadClick: function () {
            // summary:
            //      fires when the user clicks the download button
            console.log('app/DownloadData:onDownloadClick', arguments);

            this.downloadBtn.disabled = true;

            domClass.add(this.msgBox, 'info');
            domClass.remove(this.msgBox, 'error');

            domStyle.set(this.msgLoader, 'display', 'inline-block');

            this.msg.innerHTML = this.waitMsg;

            domStyle.set(this.msgBox, 'display', 'block');
            baseFx.fadeIn({node: this.msgBox}).play();

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
                var g = new Graphic(geo);
                var fSet = new FeatureSet();
                fSet.features = [g];
                params.area = fSet;
            } else {
                params.area = '';
            }

            console.log(params);
            this.gp.submitJob(params);
        },
        getFileType: function () {
            // summary:
            //        returns the file type selected
            console.log('app/DownloadData:getFileType', arguments);

            return (this.dbfRB.checked) ? 'dbf' : 'shape';
        },
        getDefinitionQuery: function () {
            // summary:
            //      gets the def query from the dataFilter
            console.log('app/DownloadData:getDefinitionQuery', arguments);

            if (this.dataFilter) {
                return this.dataFilter.updateDefinitionQuery();
            } else {
                return '1 = 1';
            }
        },
        initGeoprocessor: function () {
            // summary:
            //      creates the esri geoprocessor object
            console.log('app/DownloadData:initGeoprocessor', arguments);

            this.gp = new Geoprocessor(ROADKILL.gpDownloadUrl);

            this.connect(this.gp, 'onJobComplete', 'onJobComplete');
            this.connect(this.gp, 'onStatusUpdate', 'onStatusUpdate');
            this.connect(this.gp, 'onError', 'onJobError');
            this.connect(this.gp, 'onGetResultDataComplete', 'onGetResultDataComplete');
        },
        onJobComplete: function (status) {
            // summary:
            //      fires when the gp job is complete
            console.log('app/DownloadData:onJobComplete', arguments);

            if (status.jobStatus === 'esriJobSucceeded') {
                this.gp.getResultData(status.jobId, 'outFile');
            } else {
                this.onJobError({message: status.jobStatus});
            }
        },
        onStatusUpdate: function (status) {
            // summary:
            //      description
            console.log('app/DownloadData:onStatusUpdate', arguments);

            if (status.messages.length > 0) {
                console.log(status.messages[status.messages.length - 1].description);
            }
        },
        onJobError: function () {
            // summary:
            //      description
            console.log('app/DownloadData:onJobError', arguments);

            domClass.add(this.msgBox, 'error');
            domClass.remove(this.msgBox, 'info');

            this.msg.innerHTML = this.erMsg;

            domStyle.set(this.msgBox, {
                'display': 'block',
                'opacity': 1
            });

            domStyle.set(this.msgLoader, 'display', 'none');

            this.downloadBtn.disabled = false;
        },
        onGetResultDataComplete: function (result) {
            // summary:
            //      description
            console.log('app/DownloadData:onGetResultDataComplete', arguments);

            domClass.add(this.msgBox, 'success');
            domClass.remove(this.msgBox, 'info');
            domClass.remove(this.msgBox, 'error');

            domStyle.set(this.msgLoader, 'display', 'none');

            this.downloadBtn.disabled = false;

            this.msg.innerHTML = '';

            domConstruct.create('a', {
                innerHTML: this.aMsg,
                href: result.value.url
            }, this.msg);
        }
    });
});
