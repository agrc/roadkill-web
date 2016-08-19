require([
    'app/config',
    'app/FieldFilter',
    'app/ListPicker',
    'app/tests/data/mockData',

    'dojo/Deferred',
    'dojo/dom-construct'
], function (
    config,
    FieldFilter,
    ListPicker,
    mockData,

    Deferred,
    domConstruct
) {
    describe('FieldFilter', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new FieldFilter({fieldName: 'SPECIES', fieldLabel: 'LABEL'}, domConstruct.create('div', null, document.body));
        });
        afterEach(function () {
            testWidget.destroy();
        });
        it('onSelectClick should call init List Picker on first call', function () {
            expect(testWidget.listPicker).toBeNull();

            spyOn(testWidget, 'initListPicker');

            testWidget.onSelectClick();

            expect(testWidget.initListPicker).toHaveBeenCalled();
        });
        it('onSelectClick should call listPicker.show() on subsequent calls', function () {
            testWidget.listPicker = {show: function () {}};

            spyOn(testWidget.listPicker, 'show');

            testWidget.onSelectClick();

            expect(testWidget.listPicker.show).toHaveBeenCalled();

        });
        describe('onListPickerOK', function () {
            var selectedItems = [
                ['value1', 'code1'], ['value2', 'code2']
            ];
            it('should build the correct query string', function () {
                testWidget.onListPickerOK(selectedItems);
                expect(testWidget.query).toEqual('SPECIES IN ("value1", "value2")');
            });
            it('should build the list of species', function () {
                testWidget.onListPickerOK(selectedItems);
                expect(testWidget.list.children.length).toEqual(2);
                expect(testWidget.list.children[0].innerHTML).toEqual(selectedItems[0][0]);
                expect(testWidget.list.children[1].innerHTML).toEqual(selectedItems[1][0]);
            });
            it('should build a new list of species when there is an existing list', function () {
                testWidget.onListPickerOK(selectedItems);
                var newSelectedItems = selectedItems.concat([['value3', 'code3']]);
                testWidget.onListPickerOK(newSelectedItems);
                expect(testWidget.list.children.length).toEqual(3);
                expect(testWidget.list.children[2].innerHTML).toEqual(newSelectedItems[2][0]);
            });
        });
    });
});
