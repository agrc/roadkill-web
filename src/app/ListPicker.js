define([
    'dijit/form/MultiSelect',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-construct',
    'dojo/query',
    'dojo/text!app/templates/ListPicker.html',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    MultiSelect,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domConstruct,
    query,
    template,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // Summary:
        //        Widget used to create a subset from a large list of options.
        //        Similar to the layer picker in the Legend wizard in ArcMap
        //        based on similar widget in broadband

        widgetsInTemplate: true,
        templateString: template,

        // background: div
        background: null,

        // options
        // name of list
        listName: 'listName',

        // Array that the available list values will be populated with
        availableListArray: [],

        constructor: function (options) {
            // mixin options
            lang.mixin(this, options);
        },
        postCreate: function () {
            console.log('app/ListPicker:postCreate', arguments);

            this.availableListArray.forEach(function (item) {
                var option = domConstruct.create('option');
                // replace & for IE
                option.innerHTML = item.name.replace('&', '&amp;');
                option.value = item.code;
                this.availableList.domNode.appendChild(option);
            }, this);

            this._wireControlEvents();

            this.availableList.addSelected = this.addSelectedOverride;
            this.selectedList.addSelected = this.addSelectedOverride;

            this.show();
        },
        _wireControlEvents: function () {
            console.log('app/ListPicker:_wireControlEvents', arguments);

            this.connect(this.btnSelect, 'onclick', '_onSelect');
            this.connect(this.btnSelectAll, 'onclick', '_onSelectAll');
            this.connect(this.btnUnselect, 'onclick', '_onUnselect');
            this.connect(this.btnUnselectAll, 'onclick', '_onUnselectAll');
            this.connect(this.btnOK, 'onclick', '_onOK');
            this.connect(this.btnCancel, 'onclick', '_onCancel');
            this.connect(this.availableList, 'onDblClick', '_onSelect');
            this.connect(this.selectedList, 'onDblClick', '_onUnselect');
            this.connect(this.closeBtn, 'onclick', '_onCancel');
        },
        createBackground: function () {
            // summary:
            //        Creates the background div for the dialog
            console.log('app/ListPicker:createBackground', arguments);

            this.background = domConstruct.create('div', {
                'class': 'modal-background'
            }, document.body, 'first');
        },
        _onSelect: function () {
            // get selected options from available and add to selected
            this.selectedList.addSelected(this.availableList);

            // enable OK button
            this.btnOK.disabled = false;
        },
        _onSelectAll: function () {
            // move all options from available to selected
            query('> option', this.availableList.domNode).forEach(function (option) {
                option.selected = true;
            });
            this._onSelect();
        },
        _onUnselect: function () {
            // get selected options from selected and move to available
            this.availableList.addSelected(this.selectedList);

            // disable OK button if there are no providers left in selected
            var v = this.selectedList.domNode.childNodes;
            if (v.length <= 1) {
                this.btnOK.disabled = true;
            }
        },
        _onUnselectAll: function () {
            // move all options from selected to available
            query('> option', this.selectedList.domNode).forEach(function (option) {
                option.selected = true;
            });
            this._onUnselect();
        },
        _onOK: function () {
            // build array of selected items
            var selectedItems = [];
            query('> option', this.selectedList.domNode).forEach(function (option) {
                selectedItems.push([option.text, option.value]);
            });

            this.hide();

            this.onOK(selectedItems);
        },
        onOK: function (/*selectedItems*/) {
            // summary:
            //        Event to hook to get the selected items
            console.log('app/ListPicker:onOK', arguments);
        },
        _onCancel: function () {
            console.log('app/ListPicker:_onCancel', arguments);

            this.hide();
        },
        show: function () {
            // summary:
            //        creates background and show dialog
            console.log('app/ListPicker:show', arguments);

            $(this.domNode).modal('show');
        },
        hide: function () {
            // summary:
            //        hides the dialog, trashes the background div
            console.log('app/ListPicker:hide', arguments);

            $(this.domNode).modal('hide');
        },
        addSelectedOverride: function (select) {
            // this function has been altered to insert the new item(s) alphabetically
            select.getSelected().forEach(function (n) {
                // the node that the new item is going to be inserted before
                var refNode;

                // sort through existing options until you find the refNode
                query('> option', this.domNode).some(function (option) {
                    if (n.text > option.text) {
                        return false;
                    } else {
                        refNode = option;
                        return true;
                    }
                }, this);
                if (refNode) {
                    domConstruct.place(n, refNode, 'before');
                } else {
                    // just slap it in there if there are no children
                    this.containerNode.appendChild(n);
                }

                // scroll to bottom to see item
                // cannot use scrollIntoView since <option> tags don't support all attributes
                // does not work on IE due to a bug where <select> always shows scrollTop = 0
                this.domNode.scrollTop = this.domNode.offsetHeight;
                // overshoot will be ignored
                // scrolling the source select is trickier esp. on safari who forgets to change the scrollbar size
                var oldscroll = select.domNode.scrollTop;
                select.domNode.scrollTop = 0;
                select.domNode.scrollTop = oldscroll;
            }, this);
        }
    });
});
