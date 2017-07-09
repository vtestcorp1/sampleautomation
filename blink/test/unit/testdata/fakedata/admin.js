if (!Object.has(blink.app.fakeData, 'adminUI')) {
    blink.app.fakeData.adminUI = {};
}

blink.app.fakeData.adminUI.fakeRoles = [
    {"userContent":{"userProperties":{},"userPreferences":{"notifyOnShare":true}},
        "header":{"displayName":"test1","id":"test1","name":"test1","author":"ts_admin","modifiedBy":"ts_admin","generationNum":0,"owner":"test1","isDeleted":false,"isHidden":false,"tags":[]},"complete":true,"isSuperUser":false},

    {"userContent":{"userProperties":{},"userPreferences":{"notifyOnShare":true}},
        "header":{"displayName":"test2","id":"test2","name":"test2","author":"ts_admin","modifiedBy":"ts_admin","owner":"guest","isDeleted":false,"isHidden":false,"clientState":{"preferences":{"sageDataSource":["5de19354-710f-448e-8ed2-4315d926a264"]}},"tags":[]},"complete":true,"isSuperUser":false},

    {"userContent":{"userProperties":{},"userPreferences":{"notifyOnShare":true}},
        "type":"LOCAL_USER","header":{ "displayName":"test3","id":"test3","name":"test3","author":"ts_admin","modifiedBy":"ts_admin","owner":"guest3","isDeleted":false,"isHidden":false,"tags":[]},"complete":true,"isSuperUser":false},

    {"userContent":{"userProperties":{},"userPreferences":{"notifyOnShare":true}},
        "header":{"id":"test4","displayName":"test4","name":"test4","author":"ts_admin","modifiedBy":"ts_admin","owner":"guest4","isDeleted":false,"isHidden":false,"tags":[]},"complete":true,"isSuperUser":false}
];

blink.app.fakeData.adminUI.fakeUsers = [
    {"userContent":{"userProperties":{},"userPreferences":{"notifyOnShare":true}},
        "assignedGroups":["TGuestGroup","everybdyGroup"],
        "privileges":["AUTHORING","USERDATAUPLOADING","DATADOWNLOADING"],"type":"LOCAL_USER",
        "header":{ "displayName":"TGuest","id":"crou6","name":"crou6","author":"ts_admin","modifiedBy":"ts_admin","generationNum":0,"owner":"crou6","isDeleted":false,"isHidden":false,"tags":[]},"complete":true,"isSuperUser":false},

    {"userContent":{"userProperties":{},"userPreferences":{"notifyOnShare":true}},
        "assignedGroups":["everybdyGroup","TGuestGroup","userDataUploaderGroup","dataDwnGroup"],
        "privileges":["AUTHORING","USERDATAUPLOADING","DATADOWNLOADING","SHAREWITHALL"],"type":"LOCAL_USER",
        "header":{ "displayName":"Guest","id":"guest","name":"guest","author":"ts_admin","modifiedBy":"ts_admin","owner":"guest","isDeleted":false,"isHidden":false,"clientState":{"preferences":{"sageDataSource":["5de19354-710f-448e-8ed2-4315d926a264"]}},"tags":[]},"complete":true,"isSuperUser":false},

    {"userContent":{"userProperties":{},"userPreferences":{"notifyOnShare":true}},
        "assignedGroups":["everybdyGroup","userDataUploaderGroup","dataDwnGroup","G34Group"],
        "privileges":["AUTHORING","USERDATAUPLOADING","DATADOWNLOADING","SHAREWITHALL"],
        "type":"LOCAL_USER","header":{"displayName":"Guest 3","id":"guest3","name":"guest3","author":"ts_admin","modifiedBy":"ts_admin","owner":"guest3","isDeleted":false,"isHidden":false,"tags":[]},"complete":true,"isSuperUser":false},

    {"userContent":{"userProperties":{},"userPreferences":{"notifyOnShare":true}},
        "assignedGroups":["dataDwnGroup","G34Group","G45Group","everybdyGroup","userDataUploaderGroup"],
        "privileges":["AUTHORING","USERDATAUPLOADING","DATADOWNLOADING","SHAREWITHALL"],"type":"LOCAL_USER",
        "header":{"displayName":"Guest 4","id":"guest4","name":"guest4","author":"ts_admin","modifiedBy":"ts_admin","owner":"guest4","isDeleted":false,"isHidden":false,"tags":[]},"complete":true,"isSuperUser":false},

    {"userContent":{"userProperties":{},"userPreferences":{"notifyOnShare":true}},
         "assignedGroups":["G45Group","everybdyGroup"],
        "privileges":["AUTHORING","USERDATAUPLOADING","DATADOWNLOADING"],"type":"LOCAL_USER",
        "header":{"displayName":"qgues5","id":"q","name":"q","author":"ts_admin","modifiedBy":"ts_admin","owner":"q","isDeleted":false,"isHidden":false,"tags":[]},"complete":true,"isSuperUser":false},

    {"userContent":{"userProperties":{},"userPreferences":{"notifyOnShare":true}},
        "assignedGroups":["everybdyGroup"],
        "privileges":["AUTHORING","USERDATAUPLOADING","DATADOWNLOADING"],"type":"LOCAL_USER",
        "header":{"displayName":"Ren1","id":"ren","name":"ren","author":"ts_admin","modifiedBy":"ts_admin","owner":"ren","isDeleted":false,"isHidden":false,"tags":[]},"complete":true,"isSuperUser":false},

    {"userContent":{"userProperties":{},"userPreferences":{"notifyOnShare":true}},
        "assignedGroups":["everybdyGroup","analystGroup","adminGroup"],
        "privileges":["ADMINISTRATION","AUTHORING","USERDATAUPLOADING","DATADOWNLOADING","SHAREWITHALL"],
        "type":"LOCAL_USER","header":{"displayName":"Administrator","id":"ts_admin","name":"tsadmin","modifiedBy":"ts_admin","owner":"ts_admin","isDeleted":false,"isHidden":false,
        "clientState":{"preferences":{"sageDataSource":["543cfa97-ec2f-4706-8149-5bfb6ae517ee"],"answer-display-mode-preference-key":"CHART-MODE","PANEL_STATE":"EXPANDED"}},"tags":[]},"complete":true,"isSuperUser":false}];

blink.app.fakeData.adminUI.fakeGroups =    [
    {"assignedGroups":[],
        "privileges":["ADMINISTRATION","AUTHORING","USERDATAUPLOADING","DATADOWNLOADING","SHAREWITHALL"],
        "type":"LOCAL_GROUP","header":{"id":"adminGroup","name":"Administrator","author":"ts_admin","owner":"ts_admin"},"complete":true},

    {"assignedGroups":[],
        "privileges":["AUTHORING"],
        "type":"LOCAL_GROUP","header":{"id":"allGroup","name":"All","author":"ts_admin","owner":"ts_admin"},"complete":true},

    {"assignedGroups":[],
        "privileges":["ADMINISTRATION","USERDATAUPLOADING"],
        "type":"LOCAL_GROUP","header":{"id":"analystGroup","name":"Analyst","description":"analysts","author":"ts_admin","modifiedBy":"ts_admin","owner":"analystGroup"},"complete":true},

    {"assignedGroups":[],
        "privileges":["DATADOWNLOADING"],
        "type":"LOCAL_GROUP","header":{"id":"dataDwnGroup","name":"DataDownloader","description":"","author":"ts_admin","modifiedBy":"ts_admin","owner":"ts_admin"},"complete":true},

    {"assignedGroups":[],
        "privileges":["USERDATAUPLOADING","DATADOWNLOADING"],
        "type":"LOCAL_GROUP",
        "header":{"id":"everybdyGroup","name":"Everybody","description":"","author":"ts_admin","modifiedBy":"ts_admin","owner":"everybdyGroup"},"complete":true},

    {"assignedGroups":[],
        "privileges":["USERDATAUPLOADING","DATADOWNLOADING"],
        "type":"LOCAL_GROUP",
        "header":{"id":"G34Group","name":"G34","description":"","author":"ts_admin","modifiedBy":"ts_admin","owner":"G34Group"},"complete":true},

    {"assignedGroups":[],
        "privileges":["USERDATAUPLOADING","DATADOWNLOADING"],
        "type":"LOCAL_GROUP",
        "header":{"id":"G45Group","name":"G45","description":"","author":"ts_admin","modifiedBy":"ts_admin","owner":"G45Group"},"complete":true},

    {"assignedGroups":[],
        "privileges":["USERDATAUPLOADING","DATADOWNLOADING"],
        "type":"LOCAL_GROUP","header":{"id":"NobdyGroup","name":"Nobody","description":"","author":"ts_admin","modifiedBy":"ts_admin","owner":"NobdyGroup"},"complete":true},

    {"assignedGroups":[],
        "privileges":["USERDATAUPLOADING","DATADOWNLOADING"],
        "type":"LOCAL_GROUP","header":{"id":"TGuestGroup","name":"TGuest","description":"","author":"ts_admin","modifiedBy":"ts_admin","owner":"TGuestGroup"},"complete":true},

    {"assignedGroups":[],
        "privileges":["USERDATAUPLOADING"],"type":"LOCAL_GROUP",
        "header":{"id":"userDataUploaderGroup","name":"UserDataUploader","description":"","author":"ts_admin","modifiedBy":"ts_admin","owner":"ts_admin"},"complete":true}
];

blink.app.fakeData.adminUI.fakeNewUser =
{ "userContent": {
    "userProperties": {},
    "userPreferences": {
        "notifyOnShare": true
    }
},
    "name": "0A NEW USER",
    "assignedGroups": ["TGuestGroup", "everybdyGroup"],
    "privileges": ["AUTHORING", "USERDATAUPLOADING", "DATADOWNLOADING"],
    "header": {"id": "NEWUSER", "displayName": "0A NEW USER", "name": "0A NEW USER"}
};

blink.app.fakeData.adminUI.duplicateNameUser =
{
    "userContent":
        {"userProperties":{},"userPreferences":{"notifyOnShare":true}},
    "assignedGroups":["TGuestGroup","everybdyGroup"],
    "privileges":["AUTHORING","USERDATAUPLOADING","DATADOWNLOADING"],"type":"LOCAL_USER",
    "header":{"displayName":"TGuest","id":"crou6","name":"crou6","author":"ts_admin","modifiedBy":"ts_admin","generationNum":0,"owner":"crou6","isDeleted":false,"isHidden":false,"tags":[]},"complete":true,"isSuperUser":false
};

blink.app.fakeData.adminUI.fakeNewGroup =
{
    "assignedGroups": [],
    "privileges": ["SHAREWITHALL", "DATADOWNLOADING", "USERDATAUPLOADING", "ADMINISTRATION"],
    "type": "LOCAL_GROUP",
    "header": {
        "id": "NEWGROUP",
        "name": "TestGroup",
        "displayName": "TestGroup",
        "description": "xxx",
        "tags": []
    },
    "complete": true
};
