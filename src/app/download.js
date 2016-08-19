require([
    'app/config',
    'app/DataFilter',
    'app/DownloadData',

    'dojo/dom',
    'dojo/dom-class',
    'dojo/query',
    'dojo/topic'
], function (
    config,
    DataFilter,
    DownloadData,

    dom,
    domClass,
    query,
    topic
) {
    function DownloadPage() {
        // summary:
        //      The object in charge of this page
        console.info('DownloadPage::constructor', arguments);

        this.initWidgets();
    }

    function initWidgets() {
        // summary:
        //      Sets up the download data widget
        console.info('DownloadPage::initWidgets', arguments);

        var dd = new DownloadData({}, 'download-data');
        dd.startup();
        var df = new DataFilter({}, 'data-filter');
        df.startup();
        var dd2 = new DownloadData({dataFilter: df}, 'download-data-filter');
        dd2.startup();
    }

    DownloadPage.prototype.initWidgets = initWidgets;
    DownloadPage = DownloadPage;

    function init() {
        var downloadPage = new DownloadPage();
        downloadPage.startup();
    }

    if (config.login.user) {
        init();
    } else {
        topic.subscribe(config.login.topics.signInSuccess, function () {
            init();
        });
    }
});
