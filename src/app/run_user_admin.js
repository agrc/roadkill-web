(function () {
    require({baseUrl: './'}, [
        'ijit/widgets/authentication/UserAdmin',

        'dojo/domReady!'
    ], function (
        UserAdmin
    ) {
        new UserAdmin({
            title: 'WVC Reporter',
            appName: 'roadkill'
        }, 'widget-div');
    });
}());
