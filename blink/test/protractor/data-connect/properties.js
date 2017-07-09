/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';


var elementType = {
    text: 'text',
    select: 'select'
};

var properties = {
    dataConnectProviders : [
        'SQL Server',
        'SalesForce',
        'Jira',
        'Twitter',
        'Oracle',
        'MySQL',
        'Flat File',
        'Amazon S3',
        'Teradata'
    ],
    dataConnectProvidersMap : {
        sqlServer: 'SQL Server',
        salesForce: 'SalesForce',
        jira: 'Jira',
        twitter: 'Twitter',
        oracle:  'Oracle',
        mySQL: 'MySQL',
        amazonS3: 'Amazon S3',
        jdbc: 'JDBC'
    },
    existingConnections: {
        'SQL Server' : ['Jenkins-SQLServer']
    },
    connectionProperties: {
        'SQL Server': {
            'Connection name': elementType  .text,
            'Server Version': elementType.select,
            'Username': elementType.text,
            'Password': elementType.text,
            'Host': elementType.text,
            'Port': elementType.text,
            'Instance Name': elementType.text,
            'Database Name': elementType.text,
            'Schema': elementType.text,
            'Code Page': elementType.select
        },
        'MySQL': {
            'Connection name': elementType.text,
            'Username': elementType.text,
            'Password': elementType.text,
            'Host': elementType.text,
            'Port': elementType.text,
            'Database Name': elementType.text,
            'Code Page': elementType.select
        },
        'SalesForce': {
            'Connection name': elementType.text,
            'Username': elementType.text,
            'Password': elementType.text,
            'Security Token': elementType.text,
            'Service URL': elementType.text
        },
        'Oracle': {
            'Connection name':elementType.text,
            'Username': elementType.text,
            'Password': elementType.text,
            'Host': elementType.text,
            'Port': elementType.text,
            'Service Name': elementType.text,
            'Schema': elementType.text,
            'Code Page': elementType.select
        },
        connectionName: 'Connection name',
        databaseName: 'Database Name',
        password: 'Password'
    },
    connectionParams: {
        'SQL Server': {
            'Connection name': 'dummy',
            'Server Version': 'SqlServer2012',
            'Username': 'sa',
            'Password': 'th0ughtSp0t',
            'Host': '192.168.2.99',
            'Instance Name': 'MSSQLSERVER',
            'Database Name': 'test',
            'Schema': 'dbo',
            'Code Page': 'UTF-8'
        },
        'MySQL': {
            'Connection name': 'DC_NewConnection',
            'Username': 'root',
            'Password': 'c0ntact',
            'Host': '192.168.2.55',
            'Database Name': 'employees',
            'Code Page': 'UTF_8'
        },
        'SalesForce': {
            'Connection name': 'dummy',
            'Username': 'dummy',
            'Password': 'dummy',
            'Security Token': 'dummy',
            'Service URL': 'dummy'
        },
        'Oracle': {
            'Connection name':'dummy',
            'Username': 'dummy',
            'Password': 'dummy',
            'Host': 'dummy',
            'Service Name': 'dummy',
            'Schema': 'dummy',
            'Code Page': 'dummy'
        }
    },
    FILTER_FUNCTIONS: [
        "IS NULL",
        "IS NOT NULL",
        "EQUALS",
        "NOT EQUALS",
        "LESS THAN",
        "LESS THAN OR EQUALS",
        "GREATER THAN",
        "GREATER THAN OR EQUALS",
        "STARTS WITH",
        "ENDS WITH",
        "CONTAINS"
    ]
};

// var map = {};
// map[properties.dataConnectProvidersMap.sqlServer] = [properties.existingConnectionsMap.sqlServerConn, ];

var tableValue = 'Employees';


module.exports = {
    properties: properties,
    tableValue: tableValue
};


