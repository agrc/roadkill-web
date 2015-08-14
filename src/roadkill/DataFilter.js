define([
    'dojo/_base/declare',
    'dojo/dom-attr',

    'dojo/text!roadkill/templates/DataFilter.html',

    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    'dijit/_WidgetsInTemplateMixin',


    "dijit/form/DateTextBox",
    "roadkill/FieldFilter",
    "roadkill/RouteMilepostFilter",
    'roadkill/UserFilter'
], function (
    declare,
    domAttr,

    template,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin
    ) {
    return declare("roadkill.DataFilter", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      provides controls to filter the passed in layer

        // widgetsInTemplate: [private] Boolean
        //      Specific to dijit._Templated.
        widgetsInTemplate: true,

        templateString: template,

        // dateQueries: {id<String>:query<String>}
        dateQueries: ROADKILL.dateQueries,

        // fields: {key<String>: name<String>}
        fields: ROADKILL.fields,
        
        // queries: {}
        //      The definition queries
        queries: null,
        
        // speciesFilter: roadkill.FieldFilter
        speciesFilter: null,
        
        // genderFilter: roadkill.FieldFilter
        genderFilter: null,
        
        // ageClassFilter: roadkill.FieldFilter
        ageClassFilter: null,
        
        // udwrFilter: roadkill.FieldFilter
        udwrFilter: null,
        
        // udotFilter: roadkill.FieldFilter
        udotFilter: null,

        // wmuFilter: roadkill.FieldFilter
        wmuFilter: null,
        
        // queryGeo: esri.geometry.Polygon
        queryGeo: null,
        
        // routeMilepostFilter: roadkill.RouteMilepostFilter
        routeMilepostFilter: null,

        // userFilter: roadkill.UserFilter
        userFilter: null,
        
        // Parameters to constructor

        // layer: esri.layers.FeatureLayer
        layer: null,
            
        constructor: function() {
            // summary:
            //    Constructor method
            // params: Object
            //    Parameters to pass into the widget. Required values include: layer
            // div: String|DomNode
            //    A reference to the div that you want the widget to be created in.
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            this.queries = {
                species: null,
                date: this.dateQueries['6m'],
                gender: null,
                ageclass: null,
                udwr: null,
                udot: null,
                user: null
            };
        },
        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            // for IE7
            this.dateSelect.selectedIndex = 2;
            
            this.initFieldFilters();
            
            this.initRouteMilepostFilter();

            this.initUserFilter();
            
            this._wireEvents();
        },
        initFieldFilters: function(){
            // summary:
            //      sets up the field filter widgets
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            this.speciesFilter = new roadkill.FieldFilter({
                fieldName: this.fields.SPECIES,
                fieldLabel: 'Species'
            }, this.speciesFilterDiv);
            this.genderFilter = new roadkill.FieldFilter({
                fieldName: this.fields.GENDER,
                fieldLabel: 'Gender'
            }, this.genderFilterDiv);
            this.ageClassFilter = new roadkill.FieldFilter({
                fieldName: this.fields.AGE_CLASS,
                fieldLabel: "Age Class"
            }, this.ageClassFilterDiv);
            this.udwrFilter = new roadkill.FieldFilter({
                fieldName: this.fields.UDWR_REGION,
                fieldLabel: "UDWR Region"
            }, this.udwrRegionsFilterDiv);
            this.udotFilter = new roadkill.FieldFilter({
                fieldName: this.fields.UDOT_REGION,
                fieldLabel: 'UDOT Region'
            }, this.udotRegionsFilterDiv);
            // this.wmuFilter = new roadkill.FieldFilter({
            //  fieldName: this.fields.WMU,
            //  fieldLabel: 'WMU Region'
            // }, this.wmuRegionsFilterDiv);
        },
        _wireEvents: function() {
            // summary:
            //    Wires events.
            // tags:
            //    private
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.connect(this.dateSelect, "onchange", this.onDateSelectChange);
            this.connect(this.dateSelectRadio, "onclick", this.onSelectRadioClick);
            this.connect(this.dateCustomRadio, "onclick", this.onCustomRadioClick);
            this.connect(this.dateStart, "onChange", function(newValue) {
                this.onCustomDateChange(this.dateStart, newValue);
            });
            this.connect(this.dateEnd, "onChange", function(newValue) {
                this.onCustomDateChange(this.dateEnd, newValue);
            });
            this.connect(this.speciesFilter, 'onQueryChange', function(newQuery){
                this.queries.species = newQuery;
                this.updateDefinitionQuery();
            });
            this.connect(this.genderFilter, 'onQueryChange', function(newQuery){
                this.queries.gender = newQuery;
                this.updateDefinitionQuery();
            });
            this.connect(this.ageClassFilter, 'onQueryChange', function(newQuery){
                this.queries.ageclass = newQuery;
                this.updateDefinitionQuery();
            });
            this.connect(this.udwrFilter, 'onQueryChange', function(newQuery){
                this.queries.udwr = newQuery;
                this.updateDefinitionQuery();
            });
            this.connect(this.udotFilter, 'onQueryChange', function(newQuery){
                this.queries.udot = newQuery;
                this.updateDefinitionQuery();
            });
            this.connect(this.userFilter, 'onQueryChange', function(newQuery) {
                this.queries.user = newQuery;
                this.updateDefinitionQuery();
            });
        },
        onDateSelectChange: function() {
            // summary:
            //      Fires when the user changes the date select
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.queries.date = this.dateQueries[this.dateSelect.value];
            this.updateDefinitionQuery();
        },
        onSelectRadioClick: function() {
            // summary:
            //      fires when the dateSelectRadio radio buttonis clicked
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.onDateSelectChange();
            this.toggleDateDisabled(false);
        },
        onCustomRadioClick: function() {
            // summary:
            //      fires when the dateCustomRadio radio buttonis clicked
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.onCustomDateChange();
            this.toggleDateDisabled(true);
        },
        toggleDateDisabled: function(value) {
            // summary:
            //      toggles the disabled state of the date controls
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.dateStart.set("disabled", !value);
            this.dateEnd.set("disabled", !value);
            domAttr.set(this.dateSelect, "disabled", value);
        },
        onCustomDateChange: function(datePicker, newValue) {
            // summary:
            //      Fires when either the start or end dates are changed
            //      Rebuilds the def query for the feature layer
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            // update constraints for other picker
            if(newValue) {
                var otherPicker, max, min;
                if(datePicker === this.dateStart) {
                    otherPicker = this.dateEnd;
                    min = newValue;
                    max = new Date(newValue.getTime());
                    max.setFullYear(newValue.getFullYear() + 2);
                } else {
                    otherPicker = this.dateStart;
                    max = newValue;
                    min = new Date(newValue.getTime());
                    min.setFullYear(newValue.getFullYear() - 2);
                }
                otherPicker.constraints.max = max;
                otherPicker.constraints.min = min;
            }

            var invalid = "Invalid Date";

            var query;
            if(this.dateStart.value != invalid && this.dateEnd.value != invalid) {
                var end = new Date(this.dateEnd.value.getTime());
                end.setHours(24);
                query = this.fields.REPORT_DATE + " >= '" + this.formatDate(this.dateStart.value) + "' AND " + this.fields.REPORT_DATE + " <= '" + this.formatDate(end) + "'";
            } else {
                query = this.dateQueries.none;
            }
            this.queries.date = query;
            this.updateDefinitionQuery();
        },
        formatDate: function(date) {
            // summary:
            //      Returns a date string formatted for a query
            // date: Date
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            function padZero(value) {
                if(value < 10) {
                    return "0" + value;
                } else {
                    return value + "";
                }
            }

            var month = padZero(date.getMonth() + 1);
            var day = padZero(date.getDate());

            return date.getFullYear() + "-" + month + "-" + day;
        },
        updateDefinitionQuery: function(){
            // summary:
            //      combines all of the queries and updates the def query on the feature layer
            // returns: String
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            var query, i = 0;
            for (var q in this.queries) {
                if(this.queries[q] && this.queries.hasOwnProperty(q)){
                    if (i === 0){
                        query = this.queries[q];
                    } else {
                        query = query + " AND " + this.queries[q];
                    }
                    i++;
                }
            }
            
            if (this.layer) {
                this.layer.setDefinitionExpression(query, this.queryGeo);
            }
            
            return query;
        },
        initRouteMilepostFilter: function(){
            // summary:
            //      sets up the widget
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            this.routeMilepostFilter = new roadkill.RouteMilepostFilter({}, this.routeMilepostFilterDiv);
            
            var that = this;
            this.connect(this.routeMilepostFilter, 'onComplete', function(bufferGeo){
                that.queryGeo = bufferGeo;
                that.updateDefinitionQuery();
            });
            this.connect(this.routeMilepostFilter, 'onClear', function(){
                that.queryGeo = null;
                that.updateDefinitionQuery();
            });
        },
        initUserFilter: function () {
            // summary:
            //      sets up the user filter widget
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.userFilter = new roadkill.UserFilter({}, this.userFilterDiv);
        }
    });
});
