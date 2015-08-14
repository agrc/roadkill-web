/*global describe, beforeEach, afterEach, it, expect, spyOn, waits,
 waitsFor, runs, agrcMatchers, roadkill, dojox, mockClusterLayer_features
mockRenderer, dojo*/
describe("MapChart", function() {
	var testObject, params;
	ROADKILL.mapapp = {
		legend: {
			layers: [
				{
					renderer: mockRenderer
				}
			]
		}
	};
	ROADKILL.fields = {
		SPECIES: 'SPECIES'
	};
	beforeEach(function() {
		this.addMatchers(agrcMatchers);

		/*:DOC +=<div id='test-div'></div>*/
		
		var mockCLayer = {
			_features: mockClusterLayer_features
		};
		params = {
			chartDiv: 'test-div',
			cLayer: mockCLayer
		};
		testObject = new roadkill.MapChart(params);
	});
	afterEach(function() {
		testObject = null;
		dojo.destroy('test-div');
	});
	describe("constructor", function(){
		it("should create a valid instance", function() {
			expect( testObject instanceof roadkill.MapChart);
		});
		it("should accept a div it as an argument", function() {
			expect(testObject.chartDiv).toEqual(params.chartDiv);
		});
		it("should accept a clusterLayer as an argument", function(){
			expect(testObject.cLayer).toEqual(params.cLayer);
		});
	});
	describe("buildChart", function(){
		it("should create a valid Chart2D", function(){
			expect(testObject.chart instanceof dojox.charting.Chart2D).toEqual(true);
		});
		it("should add the plot", function(){
			expect(testObject.chart.plots['default']).toEqual(0);
		});
	});
	describe("getData", function(){
		var expectedData = [
			{y: 4, text: 'Mule Deer', color: [228, 26, 28], tooltip: 4},
			{y: 2, text: 'Elk', color: [55, 126, 184], tooltip: 2},
			{y: 2, text: 'Raccoon', color: [77, 175, 74], tooltip: 2},
			{y: 2, text: 'Moose', color: [152, 78, 163], tooltip: 2},
			{y: 14, text: 'Other', color: [255, 127, 0], tooltip: 14}
		];
		var data, mDeer, others;
		beforeEach(function() {
			data = testObject.getData();

			dojo.forEach(data, function(d) {
				if(d.text === 'Mule Deer') {
					mDeer = d;
				} else if (d.text === 'Other') {
					others = d;
				}
			});
		});
		it("should return an array", function(){
			expect(data instanceof Array).toEqual(true);
		});
		it("should aggregate the features by the legend values", function(){
			expect(mDeer.y).toEqual(expectedData[0].y);
		});
		it("should group the others category", function(){
			expect(others.y).toEqual(expectedData[4].y);
		});
		it("should get the correct colors", function(){
			expect(mDeer.color).toEqual(expectedData[0].color);
			expect(others.color).toEqual(expectedData[4].color);
		});
		it("should re-format the features array to match the chart spec", function(){
			expect(data).toEqual(expectedData);
		});
	});
	describe("updateData", function(){
		it("should call updateSeries on the chart", function(){
			spyOn(testObject, 'getData');
			spyOn(testObject.chart, 'updateSeries');
			
			testObject.updateData();
			
			expect(testObject.getData).toHaveBeenCalled();
			expect(testObject.chart.updateSeries).toHaveBeenCalled();
			
		});
	});
});