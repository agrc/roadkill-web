/*global dojo, console, dijit*/

// provide namespace
dojo.provide("roadkill.LoginDialog");

// dojo widget requires
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("roadkill.LoginDialog", [dijit._Widget, dijit._Templated], {
	// description:
	//      dialog for entering username and password

	// widgetsInTemplate: [private] Boolean
	//      Specific to dijit._Templated.
	widgetsInTemplate: true,

	// templatePath: [private] String
	//      Path to template. See dijit._Templated
	templatePath: dojo.moduleUrl("roadkill", "templates/LoginDialog.html"),

	// baseClass: [private] String
	//    The css class that is applied to the base div of the widget markup
	baseClass: "login-dialog",

	// Parameters to constructor

	// auth: roadkill.Authentication
	auth: null,

	// hideCancel: Boolean
	//		if true then the cancel button is not shown
	hideCancel: false,

	constructor: function (params, div) {
		// summary:
		//    Constructor method
		// params: Object
		//    Parameters to pass into the widget. Required values include:
		// div: String|DomNode
		//    A reference to the div that you want the widget to be created in.
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
	},
	postCreate: function () {
		// summary:
		//    Overrides method of same name in dijit._Widget.
		// tags:
		//    private
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this._wireEvents();

		if (this.hideCancel) {
			dojo.addClass(this.cancelBtn, 'hidden');
		}
	},
	_wireEvents: function () {
		// summary:
		//    Wires events.
		// tags:
		//    private
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this.connect(this.submitBtn, "onclick", this.onSubmitClick);
		this.connect(this.cancelBtn, 'onclick', function (e) {
			dojo.stopEvent(e);
			this.hide();
		});
	},
	show: function () {
		// summary:
		//      shows the dialog
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		dojo.removeClass(this.domNode, 'hidden');
		dojo.fadeIn({
			node: this.domNode
		}).play();
	},
	hide: function () {
		// summary:
		//		hides the dialog
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		var that = this;
		dojo.fadeOut({
			node: this.domNode,
			onEnd: function () {
				dojo.addClass(that.domNode, 'hidden');
			}
		}).play();
	},
	onSubmitClick: function () {
		// summary:
		//      fires when the user clicks the submit button
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		var that = this;
		function showErrorMsg(text) {
			that.errorMsg.innerHTML = text;
			dojo.removeClass(that.errorAlert, 'hidden');
			that.submitBtn.disabled = false;
		}

		dojo.addClass(this.errorAlert, 'hidden');
		this.submitBtn.disabled = true;

		var uname = this.uname.value;
		var pass = this.pass.value;

		this.auth.login(uname, pass, dojo.hitch(this, this.onLoginSuccessful), showErrorMsg);
	},
	onLoginSuccessful: function () {
		// summary:
		//		function to hook to that fires when the user has successfully logged in
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this.hide();

		this.submitBtn.disabled = false;
	}
});
