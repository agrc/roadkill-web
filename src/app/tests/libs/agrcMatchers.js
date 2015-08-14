/*global dojo, dijit*/
var agrcMatchers = {
	toBeFunction: function() {
		// summary:
		//		proves that it is a function
		return typeof this.actual == 'function';
	},
	toBeVisible: function() {
		// summary:
		//		proves that the dom node is visible
		return dojo.style(this.actual, 'display') !== 'none' &&
			dojo.style(this.actual, 'visibility') !== 'hidden';
	},
	toBeDojoWidget: function() {
		// summary:
		//		proves that the object is a valid instance of dijit._Widget
		return this.actual instanceof dijit._Widget;
	}
};
