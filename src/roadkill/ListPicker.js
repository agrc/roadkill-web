/*global dojo, dijit, console*/
dojo.provide("roadkill.ListPicker");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.MultiSelect");
dojo.require("dijit.form.Button");

dojo.declare("roadkill.ListPicker", [dijit._Widget, dijit._Templated], {
	// Summary:
	//		Widget used to create a subset from a large list of options.
	//		Similar to the layer picker in the Legend wizard in ArcMap
	//		based on similar widget in broadband

	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("roadkill", "templates/ListPicker.html"),

	// background: div
	background: null,

	// options
	// name of list
	listName: "listName",

	// Array that the available list values will be populated with
	availableListArray: [],

	constructor: function(options) {
		// mixin options
		dojo.safeMixin(this, options);
	},
	postCreate: function() {
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		dojo.forEach(this.availableListArray, function(item) {
			var option = dojo.doc.createElement('option');
			// replace & for IE
			option.innerHTML = item.name.replace('&', '&amp;');
			option.value = item.code;
			this.availableList.domNode.appendChild(option);
		}, this);

		this._wireControlEvents();

		this.availableList.addSelected = this.addSelectedOverride;
		this.selectedList.addSelected = this.addSelectedOverride;
		
		this.show();
	},
	_wireControlEvents: function() {
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.connect(this.btnSelect, "onclick", "_onSelect");
		this.connect(this.btnSelectAll, "onclick", "_onSelectAll");
		this.connect(this.btnUnselect, "onclick", "_onUnselect");
		this.connect(this.btnUnselectAll, "onclick", "_onUnselectAll");
		this.connect(this.btnOK, "onclick", "_onOK");
		this.connect(this.btnCancel, "onclick", "_onCancel");
		this.connect(this.availableList, "onDblClick", "_onSelect");
		this.connect(this.selectedList, "onDblClick", "_onUnselect");
		this.connect(this.closeBtn, "onclick", "_onCancel");
	},
	createBackground: function(){
		// summary:
		//		Creates the background div for the dialog
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.background = dojo.create('div', {
			"class": "modal-background"
		}, dojo.body(), "first");
	},
	_onSelect: function() {
		// get selected options from available and add to selected
		this.selectedList.addSelected(this.availableList);

		// enable OK button
		this.btnOK.disabled = false;
	},
	_onSelectAll: function() {
		// move all options from available to selected
		dojo.query('> option', this.availableList.domNode).forEach(function(option) {
			option.selected = true;
		});
		this._onSelect();
	},
	_onUnselect: function() {
		// get selected options from selected and move to available
		this.availableList.addSelected(this.selectedList);

		// disable OK button if there are no providers left in selected
		var v = this.selectedList.domNode.childNodes;
		if(v.length <= 1) {
			this.btnOK.disabled = true;
		}
	},
	_onUnselectAll: function() {
		// move all options from selected to available
		dojo.query('> option', this.selectedList.domNode).forEach(function(option) {
			option.selected = true;
		});
		this._onUnselect();
	},
	_onOK: function() {
		// build array of selected items
		var selectedItems = [];
		dojo.query('> option', this.selectedList.domNode).forEach(function(option) {
			selectedItems.push([option.text, option.value]);
		});

		this.hide();

		this.onOK(selectedItems);
	},
	onOK: function(selectedItems) {
		// summary:
		//		Event to hook to get the selected items
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
	},
	_onCancel: function() {
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.hide();
	},
	show: function() {
		// summary:
		//		creates background and show dialog
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		$(this.domNode).modal('show');
	},
	hide: function() {
		// summary:
		//		hides the dialog, trashes the background div
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		$(this.domNode).modal('hide');
	},
	addSelectedOverride: function(select) {
		// this function has been altered to insert the new item(s) alphabetically
		select.getSelected().forEach(function(n) {
			// the node that the new item is going to be inserted before
			var refNode;

			// sort through existing options until you find the refNode
			dojo.query('> option', this.domNode).some(function(option) {
				if(n.text > option.text) {
					return false;
				} else {
					refNode = option;
					return true;
				}
			}, this);
			if(refNode) {
				dojo.place(n, refNode, "before");
			} else {
				// just slap it in there if there are no children
				this.containerNode.appendChild(n);
			}

			// scroll to bottom to see item
			// cannot use scrollIntoView since <option> tags don't support all attributes
			// does not work on IE due to a bug where <select> always shows scrollTop = 0
			this.domNode.scrollTop = this.domNode.offsetHeight;
			// overshoot will be ignored
			// scrolling the source select is trickier esp. on safari who forgets to change the scrollbar size
			var oldscroll = select.domNode.scrollTop;
			select.domNode.scrollTop = 0;
			select.domNode.scrollTop = oldscroll;
		}, this);
	}
});
