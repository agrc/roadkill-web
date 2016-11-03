require({
    packages: [
        'app',
        'agrc',
        'dgrid',
        'dojo',
        'dijit',
        'dojox',
        'esri',
        'ijit',
        'layer-selector',
        'esrx',
        'ext',
        'html',
        'put-selector',
        'xstyle',
        {
            name: 'jquery',
            location: 'jquery/dist',
            main: 'jquery'
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
            name: 'proj4',
            location: './proj4/dist',
            main: 'proj4-src'
        }, {
            name: 'spin',
            location: 'spinjs',
            main: 'spin'
        }
    ]
});
