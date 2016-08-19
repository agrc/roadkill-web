define([
    'agrc/modules/Domains',

    'app/config',
    'app/ListPicker',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-construct',
    'dojo/query',
    'dojo/text!app/templates/FieldFilter.html',
    'dojo/_base/array',
    'dojo/_base/declare'
], function (
    Domains,

    config,
    ListPicker,

    _TemplatedMixin,
    _WidgetBase,

    domConstruct,
    query,
    template,
    array,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Provides controls to filter the data by a specific field's values

        templateString: template,
        baseClass: 'field-filter',

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
            console.log('app/FieldFilter:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/FieldFilter:postCreate', arguments);

            this.list.children[0].innerHTML = this.noneSelectedTxt;

            this._wireEvents();
        },
        _wireEvents: function () {
            // summary:
            //    Wires events.
            // tags:
            //    private
            console.log('app/FieldFilter:_wireEvents', arguments);

            this.connect(this.allRB, 'onclick', this.onAllRadioClick);
            this.connect(this.onlyRB, 'onclick', this.onOnlyRadioClick);
            this.connect(this.selectBtn, 'onclick', this.onSelectClick);
        },
        onAllRadioClick: function () {
            // summary:
            //      fires when the user clicks on this radio button
            console.log('app/FieldFilter:onAllRadioClick', arguments);

            this.onQueryChange(null);

            query('li', this.list).addClass('disabled');
        },
        onOnlyRadioClick: function () {
            // summary:
            //      fires when the user clicks on this radio button
            console.log('app/FieldFilter:onOnlyRadioClick', arguments);

            if (this.list.children[0].innerHTML === this.noneSelectedTxt) {
                this.onQueryChange('1 = 2');
            } else {
                this.onQueryChange(this.query);
            }

            query('li', this.list).removeClass('disabled');
        },
        onSelectClick: function () {
            // summary:
            //      fires when the user clicks on the 'Select Species' button
            console.log('app/FieldFilter:onSelectClick', arguments);

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
            console.log('app/FieldFilter:onQueryChange', arguments);
        },
        initListPicker: function () {
            // summary:
            //      sets up the list picker widget
            console.log('app/FieldFilter:initListPicker', arguments);

            var def = Domains.getCodedValues(config.rkFeatureServiceUrl + '?token=' +
                config.login.token, this.fieldName);

            var that = this;
            def.then(function (values) {
                that.listPicker = new ListPicker({
                    availableListArray: values,
                    listName: that.fieldLabel
                }, domConstruct.create('div', {}, document.body));

                that.connect(that.listPicker, 'onOK', that.onListPickerOK);
            });
        },
        onListPickerOK: function (selectedItems) {
            // summary:
            //      fires when the user clicks ok on the list picker
            // selectedItems: [String<name>, String<code>]
            console.log('app/FieldFilter:onListPickerOK', arguments);

            this.list.innerHTML = '';
            var that = this;
            var values = array.map(selectedItems, function (item) {
                domConstruct.create('li', {innerHTML: item[0]}, that.list);
                return '"' + item[0] + '"';
            });
            this.query = this.fieldName + ' IN (' + values.join(', ') + ')';
            this.onQueryChange(this.query);
        }
    });
});
