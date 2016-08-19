(function () {
    require({baseUrl: './'}, [
        'app/config',

        'dojo/dom',
        'dojo/dom-class',
        'dojo/parser',
        'dojo/_base/array',

        'ijit/widgets/authentication/LoginRegister',

        'jquery',
        'bootstrap',
        'dojo/domReady!'
    ], function (
        config,

        dom,
        domClass,
        parser,
        array,

        LoginRegister
    ) {

        // set active state on nav bar
        var urlParts = document.URL.split('/');
        var fileName = urlParts[urlParts.length - 1];
        var elementName = fileName.slice(0, fileName.indexOf('.php'));
        elementName = (elementName === '') ? 'index' : elementName;
        var element = dom.byId(elementName);
        if (element) {
            domClass.add(element, 'active');
        }

        var requireLogin;
        if (array.indexOf(config.securePages, elementName) === -1) {
            requireLogin = false;
        } else {
            requireLogin = true;
        }

        parser.parse();

        config.login = new LoginRegister({
            appName: 'roadkill',
            logoutDiv: dom.byId('logoutDiv'),
            showOnLoad: requireLogin,
            securedServicesBaseUrl: config.baseUrl
        });
    });
}());
