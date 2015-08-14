/*jshint unused:false */
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: 'shrinksafe',
    layerOptimize: 'shrinksafe',
    stripConsole: 'all',
    selectorEngine: 'acme',
    layers: {
        // single file build layer
        'dojo/dojo': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/run',
                'app/core',
                'esri/dijit/Attribution'
            ],
            customBase: true,
            boot: true
        },
        'app/run_user_admin': {
            include: ['app/run_user_admin'],
            exclude: ['dojo/dojo']
        },
        'app/dataentry': {
            include: ['app/dataentry'],
            exclude: ['dojo/dojo']
        },
        'app/download': {
            include: ['app/download'],
            exclude: ['dojo/dojo']
        },
        'app/map': {
            include: ['app/map'],
            exclude: ['dojo/dojo']
        }
    },
    staticHasFeatures: {
        // The trace & log APIs are used for debugging the loader, so we don’t need them in the build
        'dojo-trace-api':0,
        'dojo-log-api':0,

        // This causes normally private loader data to be exposed for debugging, so we don’t need that either
        'dojo-publish-privates':0,

        // We’re fully async, so get rid of the legacy loader
        // 'dojo-sync-loader':0,
        
        // dojo-xhr-factory relies on dojo-sync-loader
        'dojo-xhr-factory':0,

        // We aren’t loading tests in production
        'dojo-test-sniff':0
    },
    // These packages are defined in the build profile instead of the app config
    // because we don't use the local version of the esri package for development.
    // I've had problems getting the local version of the esri package to work 
    // in development.
    packages: [{
        name: 'dojo'
    },{
        name: 'dijit'
    },{
        name: 'dojox'
    },{
        name: 'esri',
        resourceTags: {
            amd: function (filename, mid) {
                return (/.*\.js/).test(filename);
            }
        }
    }],
    dirs: ['css', 'images', 'common_html'],
    files: [
        'dataentry.php', 
        'download.php', 
        'index.php', 
        'map.php',
        'mobileapp.php',
        'release_notes.php',
        'user_admin.html'
    ]
};