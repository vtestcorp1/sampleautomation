if (!Object.has(blink.app.fakeData, 'adminUI')) {
    blink.app.fakeData.adminUI = {};
}
blink.app.fakeData.adminUI.fakeSingleAlert = {
    "alert":[
        {
            "id":"TASK_TERMINATED",
            "guid":"6d7edd41-5716-4972-aade-5a0504e88ab9",
            "at":1446507744,
            "details":"service_name: \"falcon_manager\"\nservice_oid: 10\nservice_unit_index: 0\nservice_unit_oid: 11\noreo_http_address: \"localhost:12105\"\ntask_name: \"falcon_manager\"\nstart_time: 1446507657\ntermination_time: 1446507744\ntermination_signal: 9\nerror: \"Unknown\"\nlog_dir: \"/usr/local/scaligent/logs/orion/falcon_manager/falcon_manager/20151102-154057.399292.11\"\nrunning time: 1 minutes 27 seconds\nstarted: Mon Nov  2 15:40:57\n",
            "attribute":[
                {
                    "key":"Task",
                    "value":"falcon_manager"
                },
                {
                    "key":"Machine",
                    "value":"localhost"
                },
                {
                    "key":"Service",
                    "value":"falcon_manager"
                }
            ],
            "system_info":{
                "code":"A00001",
                "cluster_name":"local",
                "cluster_id":"local_11022015-15:38:38",
                "type":"INFO",
                "msg":"Task falcon_manager.falcon_manager terminated on machine localhost",
                "acted":true,
                "release_name":""
            }
        }
    ],
    "total_alerts":1
};
