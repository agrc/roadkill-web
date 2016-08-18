require([
    'app/tests/data/mockResponses',

    'dojo/dom-construct',

    'esri/tasks/GeometryService',
    'esri/tasks/Geoprocessor',

    'roadkill/RouteMilepostFilter',

    'stubmodule'
], function (
    mockRouteMilepostResponses,

    domConstruct,

    GeometryService,
    Geoprocessor,

    RouteMilepostFilter,

    stubmodule
) {
    describe('RouteMilepostFilter', function () {
        var testWidget
        var mockValues;
        var bufferParamsSpy = jasmine.createSpy('bufferParams').returnValue({});
        ROADKILL.gpRouteMilepostUrl = '/url';
        ROADKILL.geometryServiceUrl = '/url';
        beforeEach(function (done) {
            stubmodule('roadkill/RouteMilepostFilter', {
                'esri/tasks/GeometryService': function () {},
                'esri/tasks/BufferParameters': bufferParamsSpy
            }).then(function (StubbedModule) {
                testWidget = new StubbedModule({}, domConstruct.create('div', null, document.body));
                done();
            });
            mockValues = {
                route: '0015',
                fromMP: '1',
                toMP: '10'
            };

            spyOn(window, 'alert');
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });
        it('should create a valid instance of dijit._Widget', function () {
            expect(testWidget).toBeDojoWidget();
        });
        describe('onSubmit', function () {
            it('should show the loader image', function () {
                spyOn(testWidget, 'getValues').andReturn(mockValues);

                testWidget.onSubmit();

                expect(testWidget.loader).toBeVisible();
            });
            it('should disable the submit button', function () {
                spyOn(testWidget, 'getValues').andReturn(mockValues);

                testWidget.onSubmit();

                expect(testWidget.submitBtn.disabled).toEqual(true);
            });
            it('should call the geoprocessor with the correct parameters', function () {
                spyOn(testWidget, 'getValues').andReturn(mockValues);

                testWidget.initGP();

                spyOn(testWidget.gp, 'submitJob');

                testWidget.onSubmit();

                expect(testWidget.gp.submitJob).toHaveBeenCalledWith(mockValues);
            });
            it('should not call the geoprocessor submitJob function if the values do not validate', function () {
                spyOn(testWidget, 'getValues').andReturn(null);

                testWidget.initGP();

                spyOn(testWidget.gp, 'submitJob');

                testWidget.onSubmit();

                expect(testWidget.gp.submitJob).not.toHaveBeenCalled();
            });
            it('should enable the submit button and hide image on not valid values', function () {
                spyOn(testWidget, 'getValues').andReturn(null);

                testWidget.onSubmit();

                //expect(testWidget.loader).not.toBeVisible();
                expect(testWidget.submitBtn.disabled).toEqual(false);
            });
        });
        describe('initGP', function () {
            beforeEach(function () {
                testWidget.initGP();
            });
            it('should create a valid gp object', function () {
                expect(testWidget.gp instanceof Geoprocessor).toEqual(true);
            });
            it('should create a valid geometry service object', function () {
                expect(testWidget.geo instanceof GeometryService).toEqual(true);
            });
        });
        describe('getValues', function () {
            it('should validate the values', function () {
                expect(testWidget.getValues()).toEqual(null);

                expect(window.alert).toHaveBeenCalledWith(testWidget.routeRequiredTxt);

                testWidget.route.value = '15';

                expect(testWidget.getValues()).toEqual(null);

                expect(window.alert).toHaveBeenCalledWith(testWidget.fromRequiredTxt);

                testWidget.fromMP.value = '5';

                expect(testWidget.getValues()).toEqual(null);

                expect(window.alert).toHaveBeenCalledWith(testWidget.toRequiredTxt);

                testWidget.toMP.value = '4';

                testWidget.getValues();

                expect(window.alert.callCount).toEqual(3);
            });
            it('should return the values in a format compatible with the gp service', function () {
                var expected = {
                    route: '0015',
                    fromMP: '4',
                    toMP: '4'
                };
                testWidget.route.value = expected.route;
                testWidget.fromMP.value = expected.fromMP;
                testWidget.toMP.value = expected.toMP;

                expect(testWidget.getValues()).toEqual(expected);
            });
            it('should add one or two leading zeros to route', function () {
                testWidget.fromMP.value = '5';
                testWidget.toMP.value = '6';

                testWidget.route.value = '15';

                expect(testWidget.getValues().route).toEqual('0015');

                testWidget.route.value = '191';

                expect(testWidget.getValues().route).toEqual('0191');

                testWidget.route.value = '015';

                expect(testWidget.getValues().route).toEqual('0015');
            });
        });
        describe('onJobError', function () {
            beforeEach(function () {
                spyOn(testWidget, 'getValues').andReturn(mockValues);
                testWidget.onSubmit();

                testWidget.onJobError(mockRouteMilepostResponses.err);
            });
            it('should hide the img and enable the button', function () {
                //expect(testWidget.loader).not.toBeVisible();
                expect(testWidget.submitBtn.disabled).toEqual(false);
            });
            it('should alert the error msg', function () {
                expect(window.alert).toHaveBeenCalledWith(testWidget.erMsg);
            });
        });
        describe('onJobComplete', function () {
            beforeEach(function () {
                spyOn(testWidget, 'onJobError');
            });
            it('should fire onJobError if jobStatus is esriJobFailed and there is no "no match found" message', function () {
                testWidget.onJobComplete(mockRouteMilepostResponses.err);

                expect(testWidget.onJobError).toHaveBeenCalled();
            });
            it('should alert when no match is found', function () {
                testWidget.onJobComplete(mockRouteMilepostResponses.noMatch);

                expect(testWidget.onJobError).not.toHaveBeenCalled();
                expect(window.alert).toHaveBeenCalledWith(testWidget.noMatchMsg);
            });
            it('should fire getResultData when the job returns successful', function () {
                testWidget.gp = {getResultData: function () {}};

                spyOn(testWidget.gp, 'getResultData');

                testWidget.onJobComplete(mockRouteMilepostResponses.success);

                expect(testWidget.onJobError).not.toHaveBeenCalled();
                expect(testWidget.gp.getResultData)
                    .toHaveBeenCalledWith(mockRouteMilepostResponses.success.jobId, 'outSegment');
            });
        });
        describe('onGetResultDataComplete', function () {
            it('should call buffer with correct parameters', function () {
                testWidget.initGP();

                testWidget.geo.buffer = function () {};

                spyOn(testWidget.geo, 'buffer');

                testWidget.onGetResultDataComplete(mockRouteMilepostResponses.outSegment);

                expect(testWidget.geo.buffer).toHaveBeenCalledWith({
                    distances: [500],
                    geometries: [mockRouteMilepostResponses.outSegment.value.features[0].geometry],
                    unionResults: true
                });
            });
        });
        describe('onBufferComplete', function () {
            it('should hide the img and enable the button', function () {
                spyOn(testWidget, 'hideLoader');

                testWidget.onBufferComplete(mockRouteMilepostResponses.buffer);

                expect(testWidget.hideLoader).toHaveBeenCalled();
            });
        });
        describe('onClear', function () {
            it('should clear all input values', function () {
                testWidget.route.value = '15';
                testWidget.fromMP.value = '5';
                testWidget.toMP.value = '6';

                testWidget.onClear();

                expect(testWidget.route.value.length).toEqual(0);
                expect(testWidget.fromMP.value.length).toEqual(0);
                expect(testWidget.toMP.value.length).toEqual(0);
            });
        });
    });
});
