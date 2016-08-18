/*global dojo, dijit, roadkill, console, ROADKILL*/
dojo.provide('roadkill.UserFilter');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('roadkill.UserFilter', [dijit._Widget, dijit._Templated], {
    // description:

    // widgetsInTemplate: [private] Boolean
    //      Specific to dijit._Templated.
    widgetsInTemplate: true,
    
    // templatePath: [private] String
    //      Path to template. See dijit._Templated
    templatePath: dojo.moduleUrl('roadkill', 'templates/UserFilter.html'),
    
    // baseClass: [private] String
    //    The css class that is applied to the base div of the widget markup
    baseClass: 'user-filter',
    

    // Parameters to constructor
    
    constructor: function (params, div) {
        // summary:
        //    Constructor method
        // params: Object
        //    Parameters to pass into the widget. Required values include:
        // div: String|DomNode
        //    A reference to the div that you want the widget to be created in.
        console.info(this.declaredClass + '::' + arguments.callee.nom, arguments);
    },
    postCreate: function () {
        // summary:
        //    Overrides method of same name in dijit._Widget.
        // tags:
        //    private
        console.info(this.declaredClass + '::' + arguments.callee.nom, arguments);

        this.connect(this.submitBtn, 'onclick', this.onSubmit);
        this.connect(this.clearBtn, 'onclick', this.onClear);
    },
    onQueryChange: function (newQuery) {
        // summary:
        //        hook for DataFilter to be notified of query changes
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
    },
    onSubmit: function () {
        // summary:
        //      Fires when the user clicks the submit button.
        //      Builds the query string and passes it to the event function
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
    
        // build query string
        if (!String.prototype.trim) {
            String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            };
        }
        var usernames = dojo.map(this.name.value.split(','), function (name) {
            return "'" + name.trim() + "'";
        }).toString();
        var query = ROADKILL.fields.RESPONDER_EMAIL + " IN (" + 
            usernames + ")";
        this.onQueryChange(query);
    },
    onClear: function () {
        // summary:
        //      Fires when the user clicks the clear button.
        //      Clears the text box and passes on empty string as the query
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
        
        this.name.value = '';
        this.onQueryChange('');
    }
});