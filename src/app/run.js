(function() {
    var projectUrl;
    if (typeof location === 'object') {
        // running in browser
        projectUrl = location.pathname.replace(/\/[^\/]+$/, "") + '/';

        // running in unit tests
        projectUrl = (projectUrl === "/") ? '/src/' : projectUrl;
    } else {
        // running in build system
        projectUrl = '';
    }
    var config = {
        packagePaths: {},
        packages: [
            {
                name: 'jquery',
                location: projectUrl + 'jquery',
                main: 'jquery-1.10.2'
            }, {
                name: 'bootstrap',
                location: projectUrl + 'bootstrap',
                main: 'js/bootstrap'
            }
        ],
        aliases: [
            ['spin', 'agrc/resources/libs/spin']
        ]
        // defaultConfig: {
        //     locale: 'en-us'
        // }
    };
    config.packagePaths[projectUrl] = [
        'app',
        'agrc',
        'ijit',
        'roadkill',
        'esrx',
        'ext',
        'html',
        'proj4js'
    ];
    require(config, ['jquery', 'bootstrap', 'app/core']);
})();