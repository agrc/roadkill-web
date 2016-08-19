require([
    'dijit/_WidgetBase',

    'dojo/dom-construct',

    'app/ListPicker'
], function (
    _WidgetBase,

    domConstruct,

    ListPicker
) {
    describe('ListPicker Widget', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new ListPicker({
                availableListArray: [
                    {code: 'testcode', name: 'testvalue'},
                    {code: 'testcode2', name: 'testvalue2'}
                ],
                listName: 'Species'
            }, domConstruct.create('div', null, document.body));
        });

        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });

        it('Should create a valid instance of _widget', function () {
            expect(testWidget).toEqual(jasmine.any(ListPicker));
        });
    });
});
