define([
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/query',

    'roadkill/DownloadData',

    'stubmodule'
], function (
    _WidgetBase,

    domClass,
    domConstruct,
    query,

    DownloadData,

    stubmodule
) {
    describe('DownloadData Widget', function () {
        var testWidget;
        var gpSpy;
        beforeEach(function (done) {
            gpSpy = jasmine.createSpy('Geoprocessor').and.returnValue({
                onJobComplete: function () {},
                onStatusUpdate: function () {},
                onError: function () {},
                onGetResultDataComplete: function () {},
                submitJob: function () {},
                getResultData: function () {}
            });

            stubmodule('roadkill/DownloadData', {
                'esri/tasks/Geoprocessor': gpSpy
            }).then(function (StubbedModule) {
                testWidget = new StubbedModule({}, domConstruct.create('div', {}, document.body));
                done();
            });
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });
        it('should create a valid instance of dijit._Widget', function () {
            expect(testWidget instanceof _WidgetBase).toBeTruthy();
        });
        describe('postCreate', function () {
            it('should fire _wireEvents', function () {
                spyOn(testWidget, '_wireEvents');

                testWidget.postCreate();

                expect(testWidget._wireEvents).toHaveBeenCalled();
            });
        });
        describe('_wireEvents', function () {
            it('should wire the onclick event for Download button', function () {
                spyOn(testWidget, 'onDownloadClick');

                testWidget.downloadBtn.click();

                expect(testWidget.onDownloadClick).toHaveBeenCalled();
            });
        });
        describe('getFileType', function () {
            it('should return shape when the shapefile radio button is selected', function () {
                expect(testWidget.getFileType()).toEqual('shape');
            });
            it('should return dbf when the dbf radio button is selected', function () {
                testWidget.dbfRB.checked = true;

                expect(testWidget.getFileType()).toEqual('dbf');
            });
        });
        describe('onDownloadClick', function () {
            it('should call getFileType', function () {
                spyOn(testWidget, 'getFileType');

                testWidget.onDownloadClick();

                expect(testWidget.getFileType).toHaveBeenCalled();
            });
            it('should call getDefinitionQuery', function () {
                spyOn(testWidget, 'getDefinitionQuery');

                testWidget.onDownloadClick();

                expect(testWidget.getDefinitionQuery).toHaveBeenCalled();
            });
            it('should call the initGeoprocessor function once but not twice', function () {
                spyOn(testWidget, 'initGeoprocessor').andCallThrough();

                testWidget.onDownloadClick();
                testWidget.onDownloadClick();
                testWidget.onDownloadClick();

                expect(testWidget.initGeoprocessor.callCount).toEqual(1);
            });
            it('should call gp.submitJob with the appropriate arguments', function () {
                testWidget.initGeoprocessor();
                spyOn(testWidget.gp, 'submitJob');

                testWidget.onDownloadClick();

                expect(testWidget.gp.submitJob).toHaveBeenCalledWith({
                    defQuery: '1 = 1',
                    fileType: 'shape'
                });
            });
            it('should make the download button disabled', function () {
                testWidget.onDownloadClick();

                expect(testWidget.downloadBtn.disabled).toEqual(true);
            });
            it('should show the status message box', function () {
                testWidget.onDownloadClick();

                expect(testWidget.msgBox).toBeVisible();
            });
            it('should reset the message box after an error', function () {
                testWidget.onJobError();
                testWidget.onDownloadClick();

                expect(domClass.contains(testWidget.msgBox, 'error')).toEqual(false);
                expect(domClass.contains(testWidget.msgBox, 'info')).toEqual(true);
                expect(domClass.contains(testWidget.msgBox, 'success')).toEqual(false);

                expect(testWidget.msg.innerHTML).toEqual(testWidget.waitMsg);
                expect(testWidget.msgLoader).toBeVisible();
            });
        });
        describe('getDefinitionQuery', function () {
            it('should return "1 = 1" if no filter reference was pass into constructor', function () {
                expect(testWidget.getDefinitionQuery()).toEqual('1 = 1');
            });
            it('should return the def query if a valid filter reference was passed into constructor', function () {
                var defQuery = 'Good Def Query';
                var mockDataFilter = {
                    updateDefinitionQuery: function () {
                        return defQuery;
                    }
                };
                var testWidget2 = new DownloadData({
                    dataFilter: mockDataFilter
                });

                expect(testWidget2.getDefinitionQuery()).toEqual(defQuery);
            });
        });
        describe('initGeoprocessor', function () {
            it('should create a esri gp object', function () {
                testWidget.initGeoprocessor();

                expect(gpSpy).toHaveBeenCalledWith(ROADKILL.gpDownloadUrl);
            });
            it('should wire the events for the geoprocessor', function () {
                spyOn(testWidget, 'onJobComplete');
                spyOn(testWidget, 'onStatusUpdate');
                spyOn(testWidget, 'onJobError');
                spyOn(testWidget, 'onGetResultDataComplete');

                testWidget.initGeoprocessor();

                testWidget.gp.onJobComplete();
                testWidget.gp.onStatusUpdate();
                testWidget.gp.onError();
                testWidget.gp.onGetResultDataComplete();

                expect(testWidget.onJobComplete).toHaveBeenCalled();
                expect(testWidget.onStatusUpdate).toHaveBeenCalled();
                expect(testWidget.onJobError).toHaveBeenCalled();
                expect(testWidget.onGetResultDataComplete).toHaveBeenCalled();
            });
        });
        it('onJobError should change the msgBox', function () {
            var testMsg = testWidget.erMsg;
            testWidget.onDownloadClick();
            testWidget.onJobError({
                message: testMsg
            });

            expect(domClass.contains(testWidget.msgBox, 'error')).toEqual(true);
            expect(domClass.contains(testWidget.msgBox, 'info')).toEqual(false);
            expect(domClass.contains(testWidget.msgBox, 'success')).toEqual(false);
            expect(testWidget.msgBox).toBeVisible();

            expect(testWidget.msg.innerHTML).toEqual(testMsg);

            expect(testWidget.msgLoader).not.toBeVisible();

            expect(testWidget.downloadBtn.disabled).toEqual(false);
        });
        describe('onJobComplete', function () {
            it('should fire getResultData if the job was successful', function () {
                var mockStatus = {
                    jobStatus: 'esriJobSucceeded',
                    jobId: '123'
                };

                testWidget.initGeoprocessor();

                spyOn(testWidget.gp, 'getResultData');

                testWidget.onJobComplete(mockStatus);

                expect(testWidget.gp.getResultData).toHaveBeenCalledWith(mockStatus.jobId, 'outFile');
            });
            it('should fire onJobError if the job was no successfull', function () {
                var mockStatus = {
                    jobStatus: 'somethingelse'
                };

                testWidget.initGeoprocessor();

                spyOn(testWidget.gp, 'getResultData');
                spyOn(testWidget, 'onJobError');

                testWidget.onJobComplete(mockStatus);

                expect(testWidget.gp.getResultData).not.toHaveBeenCalled();
                expect(testWidget.onJobError).toHaveBeenCalledWith({message: mockStatus.jobStatus});
            });
        });
        describe('onGetResultDataComplete', function () {
            var mockResult = {
                value: { url: 'http://www.google.com/'}
            };
            it('should update the msg box and download button', function () {
                testWidget.onDownloadClick();
                testWidget.onGetResultDataComplete(mockResult);

                expect(domClass.contains(testWidget.msgBox, 'success')).toEqual(true);
                expect(domClass.contains(testWidget.msgBox, 'error')).toEqual(false);
                expect(domClass.contains(testWidget.msgBox, 'info')).toEqual(false);

                expect(testWidget.msgLoader).not.toBeVisible();

                expect(testWidget.downloadBtn.disabled).toEqual(false);

                var a = query('a', testWidget.msg)[0];

                expect(a.innerHTML).toEqual(testWidget.aMsg);
                expect(a.href).toEqual(mockResult.value.url);
            });
        });
    });
});
