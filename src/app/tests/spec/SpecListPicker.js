/*global describe, beforeEach, afterEach, it, expect, spyOn, waits, waitsFor, runs,
 roadkill, dojo, dijit*/
describe("ListPicker Widget", function(){
	var testWidget;
	beforeEach(function(){
		/*:DOC += <div id='test-div'></div>*/
		testWidget = new roadkill.ListPicker({
			availableListArray: [
				{code: "testcode", name: "testvalue"},
				{code: "testcode2", name: "testvalue2"}
			],
			listName: "Species"
		}, 'test-div');
	});
	
	afterEach(function(){
		testWidget.destroy();
		testWidget = null;
	});
	
    it("1. Should create a valid instance of _widget", function() {
		expect( testWidget instanceof dijit._Widget).toBeTruthy();
	});
});