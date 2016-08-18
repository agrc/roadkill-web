define([
    'dijit/_WidgetBase',

    'dojo/dom-construct',

    'roadkill/ListPicker'
], function (
    _WidgetBase,

    domConstruct,

    ListPicker
) {
    describe('ListPicker Widget', function () {
        var testWidget;
        beforeEach(function () {
            domConstruct.create('div', {id: 'test-div'}, document.body);
            testWidget = new ListPicker({
                availableListArray: [
                    {code: 'testcode', name: 'testvalue'},
                    {code: 'testcode2', name: 'testvalue2'}
                ],
                listName: 'Species'
            }, 'test-div');
        });

        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });

        it('1. Should create a valid instance of _widget', function () {
            expect(testWidget instanceof _WidgetBase).toBeTruthy();
        });
    });
});
