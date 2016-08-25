(function () {
    require({baseUrl: './'}, [
        'app/config',

        'dojo/dom',
        'dojo/dom-class',
        'dojo/parser',
        'dojo/_base/array',

        'dojo/domReady!',
        'jquery'
    ], function (
        config,

        dom,
        domClass,
        parser,
        array
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

        require(['ijit/widgets/authentication/LoginRegister'], function (LoginRegister) {
            config.login = new LoginRegister({
                appName: 'roadkill',
                logoutDiv: dom.byId('logoutDiv'),
                showOnLoad: requireLogin,
                securedServicesBaseUrl: config.baseUrl
            });
        });

        var versionNode = dom.byId('version');
        if (versionNode) {
            versionNode.innerHTML = config.version;
        }
    });
}());
