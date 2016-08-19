require([
    'agrc/modules/Domains',
    'agrc/modules/HelperFunctions',

    'app/config',
    'app/VerifyMap',

    'dijit/form/DateTextBox',
    'dijit/registry',

    'dojo/dom',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/on',
    'dojo/query',
    'dojo/request',
    'dojo/topic'
], function (
    Domains,
    HelperFunctions,

    config,
    VerifyMap,

    DateTextBox,
    registry,

    dom,
    domClass,
    domConstruct,
    domStyle,
    on,
    query,
    request,
    topic
) {
    // private properties
    var date;
    var species;
    var speciesTxt;
    var xyphoidChbx;
    var xyphoid;
    var collartag;
    var comments;
    var submit;
    var clear;
    var verifyMap;
    var submitMsg;
    var submitImg;

    // private functions
    var getElements = function () {
        // summary:
        //      gets references to all of the elements
        console.info('DataEntryPage::getElements', arguments);

        date = registry.byId('report-date');
        species = dom.byId('species-select');
        speciesTxt = dom.byId('species-txt');
        xyphoidChbx = dom.byId('xyphoid_chbx');
        xyphoid = dom.byId('xyphoid');
        collartag = dom.byId('collar_tag');
        comments = dom.byId('comments');
        submit = dom.byId('submit');
        clear = dom.byId('clear');
        submitMsg = dom.byId('submit-status-text');
        submitImg = dom.byId('submit-status-img');
    };
    var clearForm = function () {
        // summary:
        //      clears the form values
        console.info('DataEntryPage::clearForm', arguments);

        query('input[type="text"], input[type="number"], textarea').forEach(function (node) {
            node.value = '';
        });
        species.selectedIndex = 0;
        query('input[type="radio"]').forEach(function (node) {
            node.checked = false;
        });
        xyphoidChbx.checked = true;
        xyphoid.disabled = true;
        verifyMap.onChange();
    };
    var validateForm = function () {
        // summary:
        //      checks to make sure that all required fields are populated with valid values
        // returns: Boolean
        console.info('DataEntryPage::validateForm', arguments);

        if (date.textbox.value.length === 0) {
            alert('Report Date is required');
            return false;
        }
        if (species.selectedIndex === 0 && speciesTxt.value.length === 0) {
            alert('Species is required');
            return false;
        }
        if (!HelperFunctions.getSelectedRadioValue('gender-group')) {
            alert('Gender is required');
            return false;
        }
        if (!HelperFunctions.getSelectedRadioValue('age-group')) {
            alert('Age Class is required');
            return false;
        }
        if (!xyphoidChbx.checked && xyphoid.value.length === 0) {
            alert('Xyphoid is required');
            return false;
        }
        if (!verifyMap.verified) {
            alert('Please verify the location');
            return false;
        }

        return true;
    };
    var show = function (element) {
        domStyle.set(element, 'display', 'inline');
    };
    var hide = function (element) {
        domStyle.set(element, 'display', 'none');
    };
    var updateMsg = function (msg, msgType) {
        // summary:
        //      updates the status text that shows up next to the clear button
        // msg: String
        // msgType: String (update, error, success)
        console.info('DataEntryPage::updateMsg', arguments);

        submitMsg.innerHTML = msg;
        show(submitMsg);

        domClass.remove(submitMsg, 'error');
        domClass.remove(submitMsg, 'success');

        switch (msgType) {
            case 'update':
                show(submitImg);
                break;
            case 'error':
                hide(submitImg);
                domClass.add(submitMsg, 'error');
                break;
            case 'success':
                hide(submitImg);
                domClass.add(submitMsg, 'success');
                break;
        }
    };
    var sendDataToDatabase = function (feature) {
        // summary:
        //      sends the data to the server
        // feature: {FeatureObject}
        console.info('DataEntryPage::sendDataToDatabase', arguments);

        updateMsg('Submitting data to server...', 'update');

        function onError() {
            var msg = 'There was an error submitting your report.';
            updateMsg(msg, 'error');
        }

        var data = {
            f: 'json',
            features: JSON.stringify([feature])
        };

        var url = config.rkFeatureServiceAddFeaturesUrl + '?token=' + config.login.token;
        var params = {
            data: data,
            handleAs: 'json',
            timeout: 10000,
            method: 'POST'
        };

        request(url, params).then(function (response) {
            if (!response.error) {
                updateMsg('Report submitted successfully!', 'success');
                clearForm();
            } else {
                // config.errorLogger.log(response.error);
                onError();
            }
        }, function () {
            // config.errorLogger.log(er);
            onError();
        });
    };
    var submitForm = function () {
        // summary:
        //      assembles the data to be sent to the server
        console.info('DataEntryPage::submitForm', arguments);

        var feature = {
            attributes: {
                REPORT_DATE: date.value.getTime(),
                SPECIES: (species.selectedIndex !== 0) ? species.value : speciesTxt.value,
                GPS_ACCURACY: '-1',
                GENDER: HelperFunctions.getSelectedRadioValue('gender-group'),
                AGE_CLASS: HelperFunctions.getSelectedRadioValue('age-group'),
                XYPHOID: xyphoidChbx.checked ? -999 : xyphoid.value,
                COMMENTS: comments.value,
                RESPONDER_ID: config.login.user.userid,
                TAG_COLLAR_NUM: collartag.value
            },
            geometry: verifyMap.geo
        };
        if (verifyMap.currentField) {
            feature.attributes[verifyMap.currentField] = verifyMap.currentValue;
        }

        sendDataToDatabase(feature);
    };
    var wireEvents = function () {
        // summary:
        //      Wires the events for the page
        console.info('DataEntryPage::wireEvents', arguments);

        on(xyphoidChbx, 'change', function () {
            xyphoid.disabled = xyphoidChbx.checked;
        });
        on(clear, 'click', function () {
            clearForm();
        });
        on(species, 'change', function () {
            speciesTxt.value = '';
        });
        on(speciesTxt, 'change', function () {
            species.selectedIndex = 0;
        });
        on(submit, 'click', function () {
            if (validateForm()) {
                submitForm();
            }
        });
    };
    var getDomains = function () {
        // summary:
        //      Gets the domain from the feature service and populates the drop-down
        console.info('DataEntryPage::getDomains', arguments);

        Domains.populateSelectWithDomainValues(dom.byId('species-select'),
            config.rkFeatureServiceUrl + '?token=' + config.login.token,
            config.fields.SPECIES);
    };

    // public functions
    function DataEntryPage() {
        // summary:
        //      The object in charge of this page
        console.info('DataEntryPage::constructor', arguments);

        getElements();

        wireEvents();

        verifyMap = new VerifyMap();

        getDomains();
    }

    function init() {
        new DataEntryPage();
    }

    function checkRole() {
        if (config.login.user.role === config.roles.Admin ||
                config.login.user.role === config.roles.Submitter) {
            init();
        } else {
            alert('You do not have permission to submit reports!');
            query('input, .btn').forEach(function (node) {
                node.disabled = true;
            });
        }
    }

    if (config.login.user) {
        checkRole();
    } else {
        topic.subscribe(config.login.topics.signInSuccess, function () {
            checkRole();
        });
    }
});
