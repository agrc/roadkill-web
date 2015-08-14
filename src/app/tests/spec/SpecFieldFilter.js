it("6. onSelectSpeciesClick should call init List Picker on first call", function(){
		expect(testWidget.listPicker).toBeNull();
		
		spyOn(testWidget, "initListPicker");
		
		testWidget.onSelectSpeciesClick();
		
		expect(testWidget.initListPicker).toHaveBeenCalled();
	});
	it("7. onSelectSpeciesClick should call listPicker.show() on subsequent calls", function(){
		testWidget.listPicker = {show: function(){}};
		
		spyOn(testWidget.listPicker, "show");
		
		testWidget.onSelectSpeciesClick();
		
		expect(testWidget.listPicker.show).toHaveBeenCalled();
		
	});
	it("8. getDomainValues should get the appropriate domain values", function(){
		var def2;
		spyOn(dojo.io.script, 'get').andCallFake(function(){
			def2 = new dojo.Deferred();
			return def2;
		});
		
		var def = testWidget.getDomainValues(testWidget.fields.SPECIES);
		def2.resolve(featureServiceResponseData);
		
		expect(def.results).toEqual([[
			{code: 'testcode', value: 'testvalue'},
			{code: "testcode2", value: "testvalue2"}
		], null]);
	});
	describe("onListPickerOK", function(){
		var selectedItems = [
			["value1", "code1"], ["value2", "code2"]
		];
		it("should build the correct query string", function(){
			testWidget.onListPickerOK(selectedItems);
			expect(testWidget.queries.species).toEqual("SPECIES IN ('value1', 'value2')");
		});
		it("should build the list of species", function(){
			testWidget.onListPickerOK(selectedItems);
			expect(testWidget.speciesList.children.length).toEqual(2);
			expect(testWidget.speciesList.children[0].innerHTML).toEqual(selectedItems[0][0]);
			expect(testWidget.speciesList.children[1].innerHTML).toEqual(selectedItems[1][0]);
		});
		it("should build a new list of species when there is an existing list", function(){
			testWidget.onListPickerOK(selectedItems);
			var newSelectedItems = selectedItems.concat([["value3", "code3"]]);
			testWidget.onListPickerOK(newSelectedItems);
			expect(testWidget.speciesList.children.length).toEqual(3);
			expect(testWidget.speciesList.children[2].innerHTML).toEqual(newSelectedItems[2][0]);
		});
	});
	it("9. initListPicker should init the list picker after getDomainValues has resolved", function(){
		var domains = [
			{code: 'testcode', value: 'testvalue'},
			{code: "testcode2", value: "testvalue2"}
		];
		
		var def;
		spyOn(testWidget, "getDomainValues").andCallFake(function(){
			def = new dojo.Deferred();
			return def;
		});
		
		spyOn(roadkill, "ListPicker");
		
		testWidget.initListPicker();
		
		expect(roadkill.ListPicker).not.toHaveBeenCalled();
		
		def.resolve(domains);
		
		expect(roadkill.ListPicker.mostRecentCall.args[0]).toEqual({
			availableListArray: domains,
			listName: "Species"
		});
	});