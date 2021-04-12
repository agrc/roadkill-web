/*eslint-disable no-unused-vars*/
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: false,
    layerOptimize: false,
    selectorEngine: 'acme',
    layers: {
        'dojo/dojo': {
            include: [
                'app/run',
                'dojo/domReady',
                'dojo/i18n',
                'esri/dijit/Attribution',
                'ijit/widgets/authentication/LoginRegister',
                'ladda/dist/spin'
            ],
            includeLocales: ['en-us'],
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
        'dojo-trace-api': 0,
        'dojo-log-api': 0,
        'dojo-publish-privates': 0,
        // 'dojo-sync-loader': 0,
        'dojo-xhr-factory': 0,
        'dojo-test-sniff': 0
    },
    dirs: ['css', 'images', 'common_html'],
    files: [
        'dataentry.php',
        'download.php',
        'index.php',
        'map.php',
        'mobileapp.php',
        'release_notes.php',
        'user_admin.html'
    ],
    packages: ['dstore', 'dgrid1', {
        name: 'moment',
        location: 'moment',
        main: 'moment',
        trees: [
            // don't bother with .hidden, tests, min, src, and templates
            ['.', '.', /(\/\.)|(~$)|(test|txt|src|min|templates)/]
        ],
        resourceTags: {
            amd: function amd(filename) {
                return /\.js$/.test(filename);
            }
        }
    }, {
        name: 'proj4',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(html)/]
        ],
        resourceTags: {
            amd: function () {
                return true;
            },
            copyOnly: function () {
                return false;
            }
        }
    }]
};
