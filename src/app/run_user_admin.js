(function() {
    var config = {
        baseUrl: (
            typeof window !== 'undefined' &&
            window.dojoConfig &&
            window.dojoConfig.isJasmineTestRunner
            ) ? '/src': './',
        packages: [
            'app',
            'agrc',
            'dgrid',
            'dojo',
            'dijit',
            'dojox',
            'esri',
            'ijit',
            'roadkill',
            'esrx',
            'ext',
            'html',
            'proj4js',
            'put-selector',
            'xstyle',
            {
                name: 'jquery',
                location: 'jquery',
                main: 'jquery-1.10.2'
            }, {
                name: 'bootstrap',
                location: 'bootstrap',
                main: 'js/bootstrap'
            }, {
                name: 'ladda',
                location: 'ladda-bootstrap',
                main: 'dist/ladda'
            }, {
                name: 'mustache',
                location: 'mustache',
                main: 'mustache'
            }, {
                name: 'spin',
                location: 'spinjs',
                main: 'spin'
            }
        ]
    };
    require(config, [
            'ijit/widgets/authentication/UserAdmin',

            'dojo/domReady!'
        ],

        function(
            UserAdmin
        ) {
            new UserAdmin({
                title: 'WVC Reporter',
                appName: 'roadkill'
            }, 'widget-div');
        });
})();
