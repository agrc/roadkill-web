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
                main: 'dist/jquery'
            }, {
                name: 'bootstrap',
                location: 'bootstrap',
                main: 'dist/js/bootstrap'
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
    require(config, ['jquery', 'bootstrap', 'app/core']);
})();
