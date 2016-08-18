define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!app/templates/UserFilter.html',
    'dojo/_base/array',
    'dojo/_base/declare'
], function (
    _TemplatedMixin,
    _WidgetBase,

    template,
    array,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        baseClass: 'user-filter',


        // Parameters to constructor

        constructor: function () {
            // summary:
            //    Constructor method
            console.log('app/UserFilter:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/UserFilter:postCreate', arguments);

            this.connect(this.submitBtn, 'onclick', this.onSubmit);
            this.connect(this.clearBtn, 'onclick', this.onClear);
        },
        onQueryChange: function (/*newQuery*/) {
            // summary:
            //        hook for DataFilter to be notified of query changes
            console.log('app/UserFilter:onQueryChange', arguments);
        },
        onSubmit: function () {
            // summary:
            //      Fires when the user clicks the submit button.
            //      Builds the query string and passes it to the event function
            console.log('app/UserFilter:onSubmit', arguments);

            var usernames = array.map(this.name.value.split(','), function (name) {
                return '\'' + name.trim() + '\'';
            }).toString();
            var query = ROADKILL.fields.RESPONDER_EMAIL + ' IN (' +
                usernames + ')';
            this.onQueryChange(query);
        },
        onClear: function () {
            // summary:
            //      Fires when the user clicks the clear button.
            //      Clears the text box and passes on empty string as the query
            console.log('app/UserFilter:onClear', arguments);

            this.name.value = '';
            this.onQueryChange('');
        }
    });
});
