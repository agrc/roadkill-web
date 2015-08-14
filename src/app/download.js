require([
    'dojo/_base/connect',
    'dojo/dom',
    'dojo/query',
    'dojo/dom-class',
    'dojo/topic',

    "roadkill/DownloadData",
    "roadkill/DataFilter"
], function (
    connect,
    dom,
    query,
    domClass,
    topic,

    DownloadData,
    DataFilter
    ) {
    function DownloadPage(){
        // summary:
        //      The object in charge of this page
        console.info("DownloadPage::constructor", arguments);
        
        this.initWidgets();
    }
    
    function initWidgets(){
        // summary:
        //      Sets up the download data widget
        console.info("DownloadPage::initWidgets", arguments);
        
        var dd;
        dd = new DownloadData({}, 'download-data');
        var df;
        df = new DataFilter({}, 'data-filter');
        var dd2;
        dd2 = new DownloadData({dataFilter: df}, 'download-data-filter');
    }
    
    DownloadPage.prototype.initWidgets = initWidgets;
    roadkill.DownloadPage = DownloadPage;

    var downloadPage;
    function init(){
        downloadPage = new roadkill.DownloadPage();
    }
    
    if (ROADKILL.login.user){
        init();
    } else {
        topic.subscribe(ROADKILL.login.topics.signInSuccess, function(){
            init();
        });
    }
});
