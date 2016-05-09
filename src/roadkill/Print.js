define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/text!roadkill/templates/Print.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/graphic',
    'esri/tasks/FeatureSet',
    'esri/tasks/PrintParameters',
    'esri/tasks/PrintTask',
    'esri/tasks/PrintTemplate'
], function (
    _TemplatedMixin,
    _WidgetBase,

    domClass,
    domStyle,
    template,
    declare,
    lang,

    Graphic,
    FeatureSet,
    PrintParameters,
    PrintTask,
    PrintTemplate
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      prints the map

        // widgetsInTemplate: [private] Boolean
        //      Specific to dijit._Templated.
        widgetsInTemplate: true,

        templateString: template,

        // baseClass: [private] String
        //    The css class that is applied to the base div of the widget markup
        baseClass: "print-widget",

        task: null,

        // aMsg: String
        aMsg: 'Click here for your map.',


        // Parameters to constructor

        // map: esri.Map
        map: null,

        // dataFilter: roadkill.dataFilter
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
        initGP: function(){
            // summary:
            //      sets up the geoprocessor
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.task = new PrintTask(ROADKILL.gpPrintUrl);

            this.task.on('error', lang.hitch(this, 'onJobError'));
            this.task.on('complete', lang.hitch(this, 'onJobComplete'));
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

            if (!this.task) {
                this.initGP();
            }

            this.showMsg('Generating map...');

            var params = new PrintParameters();
            var template = new PrintTemplate();
            template.format = 'PDF';
            template.layout = 'Portrait';
            template.layoutOptions = {
                customTextElements: [{defQuery: this.dataFilter.updateDefinitionQuery()}]
            };
            params.map = this.map;
            params.template = template;
            params.extraParameters = {
                'ExportWebMapService_URL': ROADKILL.exportWebMapUrl
            };

            this.task.execute(params);
        },
        showMsg: function(msg){
            // summary:
            //      show the message box
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            if (!this.printBtn.disabled) {
                this.printBtn.disabled = true;
            }

            domClass.add(this.msgBox, 'alert-info');
            domClass.remove(this.msgBox, 'alert-danger');

            domStyle.set(this.msgLoader, 'display', 'inline-block');

            this.msg.innerHTML = msg;

            domStyle.set(this.msgBox, 'display', 'block');
            dojo.fadeIn({node: this.msgBox}).play();
        },
        showErrorMsg: function(msg){
            // summary:
            //      show the error message box
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            domClass.add(this.msgBox, 'alert-danger');
            domClass.remove(this.msgBox, 'alert-info');
            domClass.remove(this.msgBox, 'alert-success');

            this.msg.innerHTML = msg;

            domStyle.set(this.msgBox, {
                'display': 'block',
                'opacity': 1
            });

            domStyle.set(this.msgLoader, 'display', 'none');

            this.printBtn.disabled = false;
        },
        onJobComplete: function(response){
            // summary:
            //      fires when the gp job is complete
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            domClass.add(this.msgBox, 'alert-success');
            domClass.remove(this.msgBox, 'alert-info');
            domClass.remove(this.msgBox, 'alert-danger');

            domStyle.set(this.msgLoader, 'display', 'none');

            this.printBtn.disabled = false;

            this.msg.innerHTML = '';

            dojo.create('a', {
                innerHTML: this.aMsg,
                href: response.result.url,
                target: '_blank'
            }, this.msg);
        },
        onJobError: function(er){
            // summary:
            //      description
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.showErrorMsg('There was an error with the print service.');
        }
    });
});
