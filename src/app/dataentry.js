require([
    "dojo/_base/event",
    'dojo/_base/array',
    "dojo/request",
    "dojo/window",
    'dojo/dom',
    'dojo/query',
    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/on',
    'dojo/dom-construct',
    'dojo/topic',

    "dijit/form/DateTextBox",
    'dijit/registry',

    "agrc/modules/HelperFunctions",
    'agrc/modules/Domains',

    "roadkill/VerifyMap"
], function (
    dojoEvent,
    array,
    request,
    win,
    dom,
    query,
    domClass,
    domStyle,
    on,
    domConstruct,
    topic,

    DateTextBox,
    registry,

    HelperFunctions,
    Domains
    ) {
    // private properties
    var that, 
        date,
        species,
        speciesTxt,
        xyphoidChbx,
        xyphoid,
        collartag,
        comments,
        lat,
        lng,
        route,
        milepost,
        address,
        zipcity,
        submit,
        clear,
        verifyMap,
        submitMsg,
        submitImg;
    
    // private functions
    var getElements = function(){
        // summary:
        //      gets references to all of the elements
        console.info("DataEntryPage::getElements", arguments);
        
        date = registry.byId('report-date');
        species = dom.byId('species-select');
        speciesTxt = dom.byId('species-txt');
        xyphoidChbx = dom.byId('xyphoid_chbx');
        xyphoid = dom.byId('xyphoid');
        collartag = dom.byId('collar_tag');
        comments = dom.byId('comments');
        lat = dom.byId('lat');
        lng = dom.byId('lng');
        route = dom.byId('route');
        milepost = dom.byId('milepost');
        address = dom.byId('address');
        zipcity = dom.byId('zipcity');
        submit = dom.byId('submit');
        clear = dom.byId('clear');
        submitMsg = dom.byId('submit-status-text');
        submitImg = dom.byId('submit-status-img');
    };
    var clearForm = function(){
        // summary:
        //      clears the form values
        console.info("DataEntryPage::clearForm", arguments);
        
        query('input[type="text"], input[type="number"], textarea')
            .forEach(function(node){node.value = '';});
        species.selectedIndex = 0;
        query('input[type="radio"]').forEach(function(node){node.checked = false;});
        xyphoidChbx.checked = true;
        xyphoid.disabled = true;
        verifyMap.onChange();
    };
    var validateForm = function(){
        // summary:
        //      checks to make sure that all required fields are populated with valid values
        // returns: Boolean
        console.info("DataEntryPage::validateForm", arguments);
        
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
        if(!xyphoidChbx.checked && xyphoid.value.length === 0) {
            alert('Xyphoid is required');
            return false;
        }
        if(!verifyMap.verified){
            alert('Please verify the location');
            return false;
        }
        
        return true;
    };
    var show = function(element){
        domStyle.set(element, 'display', 'inline');
    };
    var hide = function(element){
        domStyle.set(element, 'display', 'none');
    };
    var updateMsg = function(msg, msgType){
        // summary:
        //      updates the status text that shows up next to the clear button
        // msg: String
        // msgType: String (update, error, success)
        console.info("DataEntryPage::updateMsg", arguments);
        
        submitMsg.innerHTML = msg;
        show(submitMsg);
        
        domClass.remove(submitMsg, 'error');
        domClass.remove(submitMsg, 'success');
        
        switch(msgType){
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
    var sendDataToDatabase = function(feature){
        // summary:
        //      sends the data to the server
        // feature: {FeatureObject}
        console.info("DataEntryPage::sendDataToDatabase", arguments);
        
        updateMsg('Submitting data to server...', 'update');
        
        function onError(){
            var msg = 'There was an error submitting your report.';
            updateMsg(msg, 'error');
        }
        
        var data = {
            f: 'json',
            features: JSON.stringify([feature])
        };
        
        var url = ROADKILL.rkFeatureServiceAddFeaturesUrl + '?token=' + ROADKILL.login.token;
        var params = {
            data: data,
            handleAs: 'json',
            timeout: 10000,
            method: 'POST'
        };
        
        request(url, params).then(function(response) {
            if (!response.error) {
                updateMsg('Report submitted successfully!', 'success');
                clearForm();
            } else {
                ROADKILL.errorLogger.log(response.error);
                onError();
            }
        }, function(er){
            ROADKILL.errorLogger.log(er);
            onError();
        });
    };
    var submitForm = function(){
        // summary:
        //      assembles the data to be sent to the server
        console.info("DataEntryPage::submitForm", arguments);
        
        var feature = {
            attributes: {
                REPORT_DATE: date.value.getTime(),
                SPECIES: (species.selectedIndex !== 0) ? species.value : speciesTxt.value,
                GPS_ACCURACY: '-1',
                GENDER: HelperFunctions.getSelectedRadioValue('gender-group'),
                AGE_CLASS: HelperFunctions.getSelectedRadioValue('age-group'),
                XYPHOID: xyphoidChbx.checked ? -999 : xyphoid.value,
                COMMENTS: comments.value,
                RESPONDER_ID: ROADKILL.login.user.userid,
                TAG_COLLAR_NUM: collartag.value
            },
            geometry: verifyMap.geo
        };
        if (verifyMap.currentField){
            feature.attributes[verifyMap.currentField] = verifyMap.currentValue;
        }
        
        sendDataToDatabase(feature);
    };
    var wireEvents = function(){
        // summary:
        //      Wires the events for the page
        console.info("DataEntryPage::wireEvents", arguments);
        
        on(xyphoidChbx, "change", function(){
            xyphoid.disabled = xyphoidChbx.checked;
        });
        on(clear, "click", function(){
            clearForm();
        });
        on(species, "change", function(){
            speciesTxt.value = '';
        });
        on(speciesTxt, "change", function(){
            species.selectedIndex = 0;
        });
        on(submit, "click", function(){
            if (validateForm()) {
                submitForm();
            }
        });
    };
    // var getDomainValues = function(fieldName, dataObject) {
    //     // summary:
    //     //      returns the list of codes for the given domain
    //     // fieldName: String
    //     // dataObject: Object
    //     // returns: []
    //     console.info("DataEntryPage::getDomainValues", arguments);
        
    //     var field;
    //     array.some(dataObject.fields, function(f) {
    //         if (f.name === fieldName) {
    //             field = f;
    //             return true;
    //         }
    //     });
    //     if (field) {
    //         return field.domain.codedValues;
    //     } else {
    //         throw TypeError('Field: ' + fieldName + ' not found!');
    //     }
    // };
    // var populateSelect = function(selectid, values) {
    //     // summary:
    //     //      adds options for each value to the select
    //     // selectid: String
    //     // values: String[]
    //     console.info("DataEntryPage::populateSelect", arguments);
        
    //     var select = dom.byId(selectid);
        
    //     array.forEach(values, function(value){
    //         domConstruct.create('option', {
    //             value: value.code,
    //             innerHTML: value.name
    //         }, select);
    //     });
    // };
    var getDomains = function(){
        // summary:
        //      Gets the domain from the feature service and populates the drop-down
        console.info("DataEntryPage::getDomains", arguments);
        
        // var params = {
        //     url: ROADKILL.rkFeatureServiceUrl,
        //     callbackParamName: 'callback',
        //     timeout: 10000,
        //     content: {
        //         f: 'pjson'
        //     }
        // };
        // script.get(params).then(function(data){
        //     if (data.error) {
        //         // raise error
        //         ROADKILL.errorLogger.log(data.error);
        //     } else {
        //         var values = getDomainValues(ROADKILL.fields.SPECIES, data);
        //         populateSelect('species-select', values);
        //     }
        // });
        Domains.populateSelectWithDomainValues(dom.byId('species-select'), 
            ROADKILL.rkFeatureServiceUrl + '?token=' + ROADKILL.login.token,
            ROADKILL.fields.SPECIES);
    };
    
    // public functions
    function DataEntryPage(){
        // summary:
        //      The object in charge of this page
        console.info("DataEntryPage::constructor", arguments);
        
        that = this;
        
        getElements();
        
        wireEvents();
        
        verifyMap = new roadkill.VerifyMap();
        
        getDomains();
    }
    
    roadkill.DataEntryPage = DataEntryPage;

    var dataentryPage;
    function init() {
        dataentryPage = new roadkill.DataEntryPage();
    }
    
    function checkRole() {
        if (ROADKILL.login.user.role === ROADKILL.roles.Admin || 
                ROADKILL.login.user.role === ROADKILL.roles.Submitter) {
            init();
        } else {
            alert('You do not have permission to submit reports!');
            query('input, .btn').forEach(function (node) {
                node.disabled = true;
            });
        }
    }

    if (ROADKILL.login.user){
        checkRole();
    } else {
        topic.subscribe(ROADKILL.login.topics.signInSuccess, function(){
            checkRole();
        });
    }
});