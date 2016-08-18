define([
    'app/tests/data/mockData',

    'dojo/Deferred',
    'dojo/dom-construct',

    'roadkill/ListPicker',

    'roakill/FieldFilter',

    'stubmodule'
], function (
    mockData,

    Deferred,
    domConstruct,

    ListPicker,

    FieldFilter,

    stubmodule
) {
    var testWidget;
    beforeEach(function () {
        testWidget = new FieldFilter({fieldName: 'NAME', fieldLabel: 'LABEL'}, domConstruct.create('div', null, document.body));
    });
    afterEach(function () {
        testWidget.destroy();
    });
    it('onSelectSpeciesClick should call init List Picker on first call', function () {
        expect(testWidget.listPicker).toBeNull();

        spyOn(testWidget, 'initListPicker');

        testWidget.onSelectSpeciesClick();

        expect(testWidget.initListPicker).toHaveBeenCalled();
    });
    it('onSelectSpeciesClick should call listPicker.show() on subsequent calls', function () {
        testWidget.listPicker = {show: function () {}};

        spyOn(testWidget.listPicker, 'show');

        testWidget.onSelectSpeciesClick();

        expect(testWidget.listPicker.show).toHaveBeenCalled();

    });
    it('getDomainValues should get the appropriate domain values', function (done) {
        var def2;
        var scriptSpy = jasmine.createSpy('script').and.callFake(function () {
            def2 = new Deferred();
            return def2;
        });

        stubmodule('roadkill/FieldFilter', {
            'dojo/io/script': scriptSpy
        }).then(function (StubbedModule) {
            var testWidget2 = new StubbedModule({}, domConstruct.create('div', {}, document.body));

            var def = testWidget2.getDomainValues(testWidget.fields.SPECIES);
            def2.resolve(mockData);

            expect(def.results).toEqual([[
                {code: 'testcode', value: 'testvalue'},
                {code: 'testcode2', value: 'testvalue2'}
            ], null]);

            testWidget2.destroy();

            done();
        });
    });
    describe('onListPickerOK', function () {
        var selectedItems = [
            ['value1', 'code1'], ['value2', 'code2']
        ];
        it('should build the correct query string', function () {
            testWidget.onListPickerOK(selectedItems);
            expect(testWidget.queries.species).toEqual('SPECIES IN ("value1", "value2")');
        });
        it('should build the list of species', function () {
            testWidget.onListPickerOK(selectedItems);
            expect(testWidget.speciesList.children.length).toEqual(2);
            expect(testWidget.speciesList.children[0].innerHTML).toEqual(selectedItems[0][0]);
            expect(testWidget.speciesList.children[1].innerHTML).toEqual(selectedItems[1][0]);
        });
        it('should build a new list of species when there is an existing list', function () {
            testWidget.onListPickerOK(selectedItems);
            var newSelectedItems = selectedItems.concat([['value3', 'code3']]);
            testWidget.onListPickerOK(newSelectedItems);
            expect(testWidget.speciesList.children.length).toEqual(3);
            expect(testWidget.speciesList.children[2].innerHTML).toEqual(newSelectedItems[2][0]);
        });
    });
    it('initListPicker should init the list picker after getDomainValues has resolved', function (done) {
        var listPickerSpy = jasmine.createSpy('ListPicker');
        stubmodule('roadkill/FieldFilter', {
            'roadkill/ListPicker': listPickerSpy
        }).then(function (StubbedModule) {
            var testWidget2 = new StubbedModule({}, domConstruct.create('div', {}, document.body));

            var domains = [
                {code: 'testcode', value: 'testvalue'},
                {code: 'testcode2', value: 'testvalue2'}
            ];

            var def;
            spyOn(testWidget2, 'getDomainValues').andCallFake(function () {
                def = new Deferred();
                return def;
            });

            testWidget2.initListPicker();

            expect(ListPicker).not.toHaveBeenCalled();

            def.resolve(domains);

            expect(ListPicker.mostRecentCall.args[0]).toEqual({
                availableListArray: domains,
                listName: 'Species'
            });

            testWidget2.destroy();

            done();
        });
    });
});
