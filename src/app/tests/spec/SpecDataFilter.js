require([
    'app/config',
    'app/DataFilter',
    'app/RouteMilepostFilter',

    'dijit/_WidgetBase',

    'dojo/dom-construct'
], function (
    config,
    DataFilter,
    RouteMilepostFilter,

    _WidgetBase,

    domConstruct
) {
    describe('DataFilter', function () {
        var testWidget;
        var map;
        var layer;
        beforeEach(function () {
            config.mapapp = {rkFeatureServiceUrl: ''};

            map = {};
            layer = {
                setDefinitionExpression: function () {},
                getDefinitionExpression: function () {}
            };

            spyOn(layer, 'setDefinitionExpression');

            // init test widget
            testWidget = new DataFilter({
                layer: layer,
                map: map
            }, domConstruct.create('div', null, document.body));
            testWidget.startup();
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });
        it('should create a valid instance of _widget', function () {
            expect(testWidget instanceof _WidgetBase).toBeTruthy();
        });
        it('onCustomDateChange should generate a valid definition query', function () {
            testWidget.dateStart.set('value', new Date(2010, 0, 1));
            testWidget.dateEnd.set('value', new Date(2010, 0, 2));
            testWidget.onCustomDateChange();

            var query = 'REPORT_DATE >= \'2010-01-01\' AND REPORT_DATE <= \'2010-01-03\'';
            expect(layer.setDefinitionExpression).toHaveBeenCalledWith(query, testWidget.queryGeo);
        });
        it('formatDate should return the appropriate formatted date string', function () {
            var input = new Date(2010, 0, 1);
            var output = '2010-01-01';

            expect(testWidget.formatDate(input)).toEqual(output);

            input = new Date(2010, 11, 1);
            output = '2010-12-01';

            expect(testWidget.formatDate(input)).toEqual(output);
        });
        it('onCustomDateChange should set a "show nothing" def query if there are not valid values for start and end date', function () {
            testWidget.dateStart.set('value', new Date(2010, 0, 1));
            testWidget.onCustomDateChange();

            expect(layer.setDefinitionExpression).toHaveBeenCalledWith(testWidget.dateQueries.none, testWidget.queryGeo);
        });
        describe('updateDefinitionQuery', function () {
            var speciesQ = 'species query';
            var dateQ = 'date query';

            it('should pass the date query into setDefinitionExpression', function () {
                testWidget.queries.date = dateQ;

                testWidget.updateDefinitionQuery();

                expect(layer.setDefinitionExpression).toHaveBeenCalledWith(dateQ, null);
            });
            it('should pass the species and date query into setDefinitonExpression', function () {
                testWidget.queries.species = speciesQ;
                testWidget.queries.date = dateQ;

                testWidget.updateDefinitionQuery();

                expect(layer.setDefinitionExpression).toHaveBeenCalledWith(speciesQ + ' AND ' + dateQ, null);
            });
        });
        describe('initRouteMilepostFilter', function () {
            it('should create a new route milepost filter widget', function () {
                testWidget.initRouteMilepostFilter();

                expect(testWidget.routeMilepostFilter instanceof RouteMilepostFilter).toBe(true);
            });
        });
    });
});
