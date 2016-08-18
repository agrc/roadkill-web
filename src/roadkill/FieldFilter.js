/*global dojo, console, dijit, roadkill, ROADKILL*/

// provide namespace
dojo.provide("roadkill.FieldFilter");

// dojo widget requires
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
var Domains = dojo.require('agrc.modules.Domains');

// other dojo requires
dojo.require("roadkill.ListPicker");

dojo.declare("roadkill.FieldFilter", [dijit._Widget, dijit._Templated], {
    // description:
    //      Provides controls to filter the data by a specific field's values

    // widgetsInTemplate: [private] Boolean
    //      Specific to dijit._Templated.
    widgetsInTemplate: true,

    // templatePath: [private] String
    //      Path to template. See dijit._Templated
    templatePath: dojo.moduleUrl("roadkill", "templates/FieldFilter.html"),

    // baseClass: [private] String
    //    The css class that is applied to the base div of the widget markup
    baseClass: "field-filter",

    // listPicker: roadkill.ListPicker
    listPicker: null,

    // noneSelectedTxt: String
    noneSelectedTxt: 'None Selected',

    // query: String
    query: '',

    // Parameters to constructor

    // fieldName: String
    //      The name of the field
    fieldName: '',

    // fieldLabel: String
    //      The text that appears in the HTML
    fieldLabel: '',

    constructor: function () {
        // summary:
        //    Constructor method
        // params: Object
        //    Parameters to pass into the widget. Required values include:
        // div: String|DomNode
        //    A reference to the div that you want the widget to be created in.
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
    },
    postCreate: function () {
        // summary:
        //    Overrides method of same name in dijit._Widget.
        // tags:
        //    private
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        this.list.children[0].innerHTML = this.noneSelectedTxt;

        this._wireEvents();
    },
    _wireEvents: function () {
        // summary:
        //    Wires events.
        // tags:
        //    private
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        this.connect(this.allRB, "onclick", this.onAllRadioClick);
        this.connect(this.onlyRB, "onclick", this.onOnlyRadioClick);
        this.connect(this.selectBtn, "onclick", this.onSelectClick);
    },
    onAllRadioClick: function () {
        // summary:
        //      fires when the user clicks on this radio button
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        this.onQueryChange(null);

        dojo.query('li', this.list).addClass("disabled");
    },
    onOnlyRadioClick: function () {
        // summary:
        //      fires when the user clicks on this radio button
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        if (this.list.children[0].innerHTML === this.noneSelectedTxt) {
            this.onQueryChange("1 = 2");
        } else {
            this.onQueryChange(this.query);
        }

        dojo.query('li', this.list).removeClass('disabled');
    },
    onSelectClick: function () {
        // summary:
        //      fires when the user clicks on the "Select Species" button
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        if (!this.listPicker) {
            this.initListPicker();
        } else {
            this.listPicker.show();
        }

        this.onlyRB.checked = true;
        this.onOnlyRadioClick();
    },
    onQueryChange: function (/*newQuery*/) {
        // summary:
        //      event to publish when the def query changes
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
    },
    initListPicker: function () {
        // summary:
        //      sets up the list picker widget
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        var def = Domains.getCodedValues(ROADKILL.rkFeatureServiceUrl + '?token=' +
            ROADKILL.login.token, this.fieldName);

        var that = this;
        def.then(function (values) {
            that.listPicker = new roadkill.ListPicker({
                availableListArray: values,
                listName: that.fieldLabel
            }, dojo.create('div', {}, dojo.body()));

            that.connect(that.listPicker, "onOK", that.onListPickerOK);
        });
    },
    onListPickerOK: function (selectedItems) {
        // summary:
        //      fires when the user clicks ok on the list picker
        // selectedItems: [String<name>, String<code>]
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        this.list.innerHTML = "";
        var that = this;
        var values = dojo.map(selectedItems, function (item) {
            dojo.create('li', {innerHTML: item[0]}, that.list);
            return "'" + item[0] + "'";
        });
        this.query = this.fieldName + " IN (" + values.join(", ") + ")";
        this.onQueryChange(this.query);
    }
});
