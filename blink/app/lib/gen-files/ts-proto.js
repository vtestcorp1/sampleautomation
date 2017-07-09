var _root = dcodeIO.ProtoBuf.newBuilder({})['import']({
    "package": null,
    "messages": [
        {
            "name": "common",
            "fields": [],
            "options": {
                "java_package": "com.thoughtspot.common",
                "go_package": "message_codes_pb",
                "java_outer_classname": "StatusOuter"
            },
            "messages": [
                {
                    "name": "ValueProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Type",
                            "name": "type",
                            "id": 6,
                            "options": {
                                "default": "TYPE_NULL"
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "i64",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "double",
                            "name": "d",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "s",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "b",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "uint64",
                            "name": "u64",
                            "id": 5
                        }
                    ],
                    "enums": [
                        {
                            "name": "Type",
                            "values": [
                                {
                                    "name": "TYPE_NULL",
                                    "id": 0
                                },
                                {
                                    "name": "TYPE_INT64",
                                    "id": 1
                                },
                                {
                                    "name": "TYPE_DOUBLE",
                                    "id": 2
                                },
                                {
                                    "name": "TYPE_STRING",
                                    "id": 3
                                },
                                {
                                    "name": "TYPE_BOOL",
                                    "id": 4
                                },
                                {
                                    "name": "TYPE_UINT64",
                                    "id": 5
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "KeyValue",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "key",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "ValueProto",
                            "name": "value",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "description",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "DeprecatedValue",
                            "name": "deprecated_value",
                            "id": 2,
                            "options": {
                                "deprecated": true
                            }
                        }
                    ],
                    "messages": [
                        {
                            "name": "DeprecatedValue",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "i64",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "double",
                                    "name": "d",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "s",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "KeyValueStr",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "key",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "value",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "KeyValueList",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "key",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "ValueProto",
                            "name": "value",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "description",
                            "id": 3
                        }
                    ]
                },
                {
                    "name": "EntityHeader",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "guid",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "display_name",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "description",
                            "id": 3
                        }
                    ]
                },
                {
                    "name": "StatusProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "ErrorCode",
                            "name": "code",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "message",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "BlogProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "timestamp",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "net.OrionAddress",
                            "name": "oaddr",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "hostname",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "thread_id",
                            "id": 4
                        }
                    ],
                    "extensions": [
                        1000,
                        536870911
                    ]
                },
                {
                    "name": "StringBlog",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "bytes",
                            "name": "msg",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "ref": "BlogProto",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "StringBlog",
                                    "name": "blog_id",
                                    "id": 1000
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "RpcBlog",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "StatusProto",
                            "name": "status",
                            "id": 1
                        }
                    ],
                    "extensions": [
                        1000,
                        536870911
                    ],
                    "messages": [
                        {
                            "ref": "BlogProto",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "RpcBlog",
                                    "name": "blog_id",
                                    "id": 1001
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "FormatingType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "NO_FORMATING",
                                    "id": 0
                                },
                                {
                                    "name": "NUMBER_FORMAT_PATTERN",
                                    "id": 1
                                },
                                {
                                    "name": "DATE_FORMAT_PATTERN",
                                    "id": 2
                                },
                                {
                                    "name": "TIME_FORMAT_PATTERN",
                                    "id": 3
                                },
                                {
                                    "name": "DATE_TIME_FORMAT_PATTERN",
                                    "id": 4
                                },
                                {
                                    "name": "HOUR_DATE_FORMAT_PATTERN",
                                    "id": 5
                                },
                                {
                                    "name": "HOUR_TIME_FORMAT_PATTERN",
                                    "id": 6
                                },
                                {
                                    "name": "YEAR_FORMAT_PATTERN",
                                    "id": 7
                                },
                                {
                                    "name": "QTR_IN_YEAR_FORMAT_PATTERN",
                                    "id": 8
                                },
                                {
                                    "name": "MONTH_IN_YEAR_FORMAT_PATTERN",
                                    "id": 9
                                },
                                {
                                    "name": "WEEK_YEAR_FORMAT_PATTERN",
                                    "id": 10
                                },
                                {
                                    "name": "DAY_IN_YEAR_FORMAT_PATTERN",
                                    "id": 11
                                },
                                {
                                    "name": "MONTH_IN_QTR_FORMAT_PATTERN",
                                    "id": 12
                                },
                                {
                                    "name": "DAY_IN_QTR_FORMAT_PATTERN",
                                    "id": 13
                                },
                                {
                                    "name": "DAY_IN_MONTH_FORMAT_PATTERN",
                                    "id": 14
                                },
                                {
                                    "name": "DAY_OF_WEEK_FORMAT_PATTERN",
                                    "id": 15
                                },
                                {
                                    "name": "QTR_YEAR_FORMAT_PATTERN",
                                    "id": 16
                                },
                                {
                                    "name": "MONTH_YEAR_FORMAT_PATTERN",
                                    "id": 17
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "MessageCode",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Severity",
                            "name": "severity",
                            "id": 1,
                            "options": {
                                "default": "ERROR"
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "code",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "summary",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "detail",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "action",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "external",
                            "id": 6
                        }
                    ],
                    "enums": [
                        {
                            "name": "Severity",
                            "values": [
                                {
                                    "name": "INFO",
                                    "id": 0
                                },
                                {
                                    "name": "WARNING",
                                    "id": 1
                                },
                                {
                                    "name": "ERROR",
                                    "id": 2
                                },
                                {
                                    "name": "FATAL",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "MessageCodeSet",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "MessageCode",
                            "name": "message_code",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "ContextMessageCode",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "code",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "incident_id_guid",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "trace_id_guid",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "debug",
                            "id": 4
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "parameter",
                            "id": 5
                        }
                    ]
                }
            ],
            "enums": [
                {
                    "name": "ErrorCode",
                    "values": [
                        {
                            "name": "OK",
                            "id": 0
                        },
                        {
                            "name": "ABORTED",
                            "id": 1
                        },
                        {
                            "name": "ALREADY_EXISTS",
                            "id": 2
                        },
                        {
                            "name": "BUSY",
                            "id": 3
                        },
                        {
                            "name": "CANCELLED",
                            "id": 4
                        },
                        {
                            "name": "INTERNAL",
                            "id": 5
                        },
                        {
                            "name": "INVALID_ARGUMENT",
                            "id": 6
                        },
                        {
                            "name": "LOAD_FAILED",
                            "id": 7
                        },
                        {
                            "name": "NOT_FOUND",
                            "id": 8
                        },
                        {
                            "name": "NOT_IMPLEMENTED",
                            "id": 9
                        },
                        {
                            "name": "PERMISSION_DENIED",
                            "id": 10
                        },
                        {
                            "name": "TIMEOUT",
                            "id": 11
                        },
                        {
                            "name": "NOT_READY",
                            "id": 12
                        },
                        {
                            "name": "UNKNOWN",
                            "id": 13
                        },
                        {
                            "name": "RESOURCE_EXCEEDED",
                            "id": 14
                        },
                        {
                            "name": "ALTER_TABLE_FAILED",
                            "id": 15
                        },
                        {
                            "name": "UNREACHABLE",
                            "id": 16
                        },
                        {
                            "name": "INVALID_TABLE_GRAPH",
                            "id": 17
                        },
                        {
                            "name": "CONNECTION_FAILED",
                            "id": 18
                        },
                        {
                            "name": "INVALID_JOIN_PATH",
                            "id": 19
                        },
                        {
                            "name": "TABLE_NOT_READY",
                            "id": 30000
                        },
                        {
                            "name": "ZOOKEEPER_ERROR",
                            "id": 50000
                        }
                    ]
                }
            ]
        },
        {
            "name": "net",
            "fields": [],
            "options": {
                "java_package": "com.thoughtspot.net.address",
                "go_package": "common_pb"
            },
            "messages": [
                {
                    "name": "TraceEvent",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "start_us",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "duration_us",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "ChronoType",
                            "name": "chrono_type",
                            "id": 4
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "log",
                            "id": 14
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "error",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "deadline_expired",
                            "id": 6,
                            "options": {
                                "default": false
                            }
                        },
                        {
                            "rule": "repeated",
                            "type": "TraceEvent",
                            "name": "child",
                            "id": 7
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "tid",
                            "id": 8
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "parent_tid",
                            "id": 9
                        },
                        {
                            "rule": "optional",
                            "type": "ClockAlign",
                            "name": "clock_align",
                            "id": 10
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "trace_id",
                            "id": 11
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "real_start_us",
                            "id": 12
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "host",
                            "id": 13
                        }
                    ],
                    "extensions": [
                        1000,
                        536870911
                    ],
                    "messages": [
                        {
                            "name": "ClockAlign",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "Type",
                                    "name": "type",
                                    "id": 1,
                                    "options": {
                                        "default": "LOCAL_CLOCK"
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "skew_us",
                                    "id": 2,
                                    "options": {
                                        "default": 0
                                    }
                                }
                            ],
                            "enums": [
                                {
                                    "name": "Type",
                                    "values": [
                                        {
                                            "name": "LOCAL_CLOCK",
                                            "id": 0
                                        },
                                        {
                                            "name": "REMOTE_CLOCK_UNKNOWN",
                                            "id": 1
                                        },
                                        {
                                            "name": "REMOTE_CLOCK_KNOWN",
                                            "id": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    "enums": [
                        {
                            "name": "ChronoType",
                            "values": [
                                {
                                    "name": "CHRONO_CONCURRENT",
                                    "id": 1
                                },
                                {
                                    "name": "CHRONO_SEQUENTIAL",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "StringDebugInfo",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "msg",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "ref": "TraceEvent",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "StringDebugInfo",
                                    "name": "trace",
                                    "id": 1000
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "KeyValueDebugInfo",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "common.KeyValue",
                            "name": "item",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "ref": "TraceEvent",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "KeyValueDebugInfo",
                                    "name": "trace",
                                    "id": 1004
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "TraceSummary",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "EventSummary",
                            "name": "event_summary",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "name": "EventMetric",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "start_ms",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "actual_time_ms",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "total_time_ms",
                                    "id": 3
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "num_calls",
                                    "id": 4
                                }
                            ]
                        },
                        {
                            "name": "EventSummary",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "event_name",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "int32",
                                    "name": "num_calls",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "max_time_ms",
                                    "id": 3
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "min_time_ms",
                                    "id": 4
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "avg_total_time_ms",
                                    "id": 5
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "avg_actual_time_ms",
                                    "id": 6
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "total_time_ms",
                                    "id": 7
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "actual_time_ms",
                                    "id": 8
                                },
                                {
                                    "rule": "repeated",
                                    "type": "EventMetric",
                                    "name": "metric",
                                    "id": 9
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "PartialTraceIds",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "guid",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "TraceMetadata",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "incident_id",
                            "id": 1,
                            "options": {
                                "default": ""
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "ip",
                            "id": 2,
                            "options": {
                                "default": ""
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "service_name",
                            "id": 3,
                            "options": {
                                "default": ""
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "sunit",
                            "id": 4,
                            "options": {
                                "default": -1
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "additional_info",
                            "id": 5,
                            "options": {
                                "default": ""
                            }
                        },
                        {
                            "rule": "repeated",
                            "type": "common.KeyValueStr",
                            "name": "tag",
                            "id": 6
                        }
                    ]
                },
                {
                    "name": "PutTraceRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "id",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "tag",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "TraceEvent",
                            "name": "trace",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "collector",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "TraceMetadata",
                            "name": "metadata",
                            "id": 5
                        }
                    ]
                },
                {
                    "name": "PutTraceResponse",
                    "fields": []
                },
                {
                    "name": "PutTracesRequest",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "PutTraceRequest",
                            "name": "request",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "PutTracesResponse",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "PutTraceResponse",
                            "name": "response",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "GetTraceRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "ignore_descendants",
                            "id": 2,
                            "options": {
                                "default": false
                            }
                        }
                    ]
                },
                {
                    "name": "GetTraceResponse",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "tag",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "TraceEvent",
                            "name": "trace",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "TraceMetadata",
                            "name": "metadata",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "timestamp",
                            "id": 100
                        }
                    ]
                },
                {
                    "name": "GetTracesRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "incident_id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "ip",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "service_name",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "sunit",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "additional_info",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "from_epoch",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "to_epoch",
                            "id": 7
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "metadata",
                            "id": 8
                        }
                    ]
                },
                {
                    "name": "GetTracesResponse",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "trace_id",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "SummarizeTraceRequest",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "trace_id",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "SummarizeTraceResponse",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "TraceSummary",
                            "name": "trace_summary",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "HostPort",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "host",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "port",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "OrionAddress",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "HostPort",
                            "name": "zoo_server",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "cluster_name",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "service_name",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "service_unit_index",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "task_name",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "port_name",
                            "id": 6
                        },
                        {
                            "rule": "repeated",
                            "type": "Label",
                            "name": "label",
                            "id": 7
                        }
                    ],
                    "messages": [
                        {
                            "name": "Label",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "key",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "value",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "AddressProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "HostPort",
                            "name": "host_port",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "OrionAddress",
                            "name": "orion_address",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "rpc",
                    "fields": [],
                    "options": {
                        "java_package": "com.thoughtspot.net.rpc",
                        "go_package": "rpc_pb"
                    },
                    "messages": [
                        {
                            "name": "RpcRequestInfo",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "sender_ip",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "no_full_trace",
                                    "id": 2,
                                    "options": {
                                        "default": false
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "trace_id",
                                    "id": 3
                                }
                            ]
                        },
                        {
                            "name": "RpcResponseInfo",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "TraceEvent",
                                    "name": "trace",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "host",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "use_snappy",
                                    "id": 3,
                                    "options": {
                                        "default": false
                                    }
                                }
                            ]
                        },
                        {
                            "name": "RpcDebugInfo",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "size",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "uncompressed_size",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "sender_ip",
                                    "id": 3,
                                    "options": {
                                        "default": "unknown"
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "trace_id",
                                    "id": 4,
                                    "options": {
                                        "default": "unknown"
                                    }
                                }
                            ],
                            "messages": [
                                {
                                    "ref": "TraceEvent",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "rpc.RpcDebugInfo",
                                            "name": "trace",
                                            "id": 1008
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "RpcOptions",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "ThriftOptions",
                                    "name": "thrift",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "int32",
                                    "name": "retry_seconds",
                                    "id": 2,
                                    "options": {
                                        "default": 120
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "int32",
                                    "name": "retry_sleep_interval_ms",
                                    "id": 3,
                                    "options": {
                                        "default": 100
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "int32",
                                    "name": "connection_pool_max_size",
                                    "id": 4,
                                    "options": {
                                        "default": 200
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "int32",
                                    "name": "max_request_mb",
                                    "id": 5
                                }
                            ]
                        },
                        {
                            "name": "ThriftOptions",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "framed_transport",
                                    "id": 1,
                                    "options": {
                                        "default": true
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "int32",
                                    "name": "socket_timeout_ms",
                                    "id": 2,
                                    "options": {
                                        "default": 10000
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "int32",
                                    "name": "max_active_processors",
                                    "id": 3,
                                    "options": {
                                        "default": -1
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "ProtocolType",
                                    "name": "protocol_type",
                                    "id": 4,
                                    "options": {
                                        "default": "BINARY"
                                    }
                                }
                            ],
                            "enums": [
                                {
                                    "name": "ProtocolType",
                                    "values": [
                                        {
                                            "name": "BINARY",
                                            "id": 0
                                        },
                                        {
                                            "name": "JSON",
                                            "id": 1
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "services": [
                {
                    "name": "TraceVaultService",
                    "options": {
                        "(net.rpc.RpcOptions.service).retry_seconds": 0,
                        "(net.rpc.RpcOptions.service).max_request_mb": 511
                    },
                    "rpc": {
                        "GetTrace": {
                            "request": "GetTraceRequest",
                            "response": "GetTraceResponse",
                            "options": {}
                        },
                        "PutTrace": {
                            "request": "PutTraceRequest",
                            "response": "PutTraceResponse",
                            "options": {}
                        },
                        "SummarizeTrace": {
                            "request": "SummarizeTraceRequest",
                            "response": "SummarizeTraceResponse",
                            "options": {}
                        },
                        "GetTraces": {
                            "request": "GetTracesRequest",
                            "response": "GetTracesResponse",
                            "options": {}
                        }
                    }
                }
            ]
        },
        {
            "name": "falcon",
            "fields": [],
            "options": {
                "java_package": "com.thoughtspot.falcon",
                "java_outer_classname": "PartitionWindowOuter"
            },
            "messages": [
                {
                    "name": "DataType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "UNKNOWN",
                                    "id": 0
                                },
                                {
                                    "name": "BOOL",
                                    "id": 1
                                },
                                {
                                    "name": "CHAR",
                                    "id": 2
                                },
                                {
                                    "name": "DATE",
                                    "id": 3
                                },
                                {
                                    "name": "INT32",
                                    "id": 4
                                },
                                {
                                    "name": "INT64",
                                    "id": 5
                                },
                                {
                                    "name": "FLOAT",
                                    "id": 6
                                },
                                {
                                    "name": "DOUBLE",
                                    "id": 7
                                },
                                {
                                    "name": "DATE_TIME",
                                    "id": 8
                                },
                                {
                                    "name": "TIME",
                                    "id": 9
                                },
                                {
                                    "name": "MAX_TYPE",
                                    "id": 9
                                }
                            ],
                            "options": {
                                "allow_alias": true
                            }
                        }
                    ]
                },
                {
                    "name": "ObjectId",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "guid",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "TableHeaderProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "guid",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "schema_version",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "data_version",
                            "id": 4
                        }
                    ]
                },
                {
                    "name": "ValueProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Type",
                            "name": "type",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "s",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "b",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "sint64",
                            "name": "i",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "double",
                            "name": "d",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "null",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "scase_strlen",
                            "id": 7
                        },
                        {
                            "rule": "optional",
                            "type": "bytes",
                            "name": "case_bytes",
                            "id": 8
                        }
                    ],
                    "enums": [
                        {
                            "name": "Type",
                            "values": [
                                {
                                    "name": "TYPE_STRING",
                                    "id": 0
                                },
                                {
                                    "name": "TYPE_BOOL",
                                    "id": 1
                                },
                                {
                                    "name": "TYPE_INT64",
                                    "id": 2
                                },
                                {
                                    "name": "TYPE_DOUBLE",
                                    "id": 3
                                },
                                {
                                    "name": "TYPE_NULL",
                                    "id": 4
                                },
                                {
                                    "name": "TYPE_STRING_CASE",
                                    "id": 5
                                }
                            ],
                            "options": {
                                "allow_alias": true
                            }
                        }
                    ]
                },
                {
                    "name": "EncodedFileNameSharedProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "data_dir_prefix",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "data_file_prefix",
                            "id": 2,
                            "options": {
                                "deprecated": true
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "db",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "user_schema",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "table",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "schema_version",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "partition",
                            "id": 7
                        }
                    ]
                },
                {
                    "name": "EncodedFileNameProto",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "DataVersionRange",
                            "name": "data_version",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "name": "DataVersionRange",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "from",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "to",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "schema_version",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "MultiPartNameProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "ObjectId",
                            "name": "db_id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "ObjectId",
                            "name": "user_schema_id",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "ObjectId",
                            "name": "table_id",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "ObjectId",
                            "name": "column_id",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "alias",
                            "id": 5
                        }
                    ]
                },
                {
                    "name": "MultiPartTableNameProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "ObjectId",
                            "name": "db_id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "ObjectId",
                            "name": "user_schema_id",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "ObjectId",
                            "name": "table_id",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "alias",
                            "id": 4
                        }
                    ]
                },
                {
                    "name": "ObjectSummary",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "created_by",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "created_on",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "last_modified_by",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "last_modified_on",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "description",
                            "id": 5
                        }
                    ]
                },
                {
                    "name": "AggregateOp",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "AGGR_NONE",
                                    "id": 0
                                },
                                {
                                    "name": "AGGR_SUM",
                                    "id": 1
                                },
                                {
                                    "name": "AGGR_AVERAGE",
                                    "id": 2
                                },
                                {
                                    "name": "AGGR_COUNT_NON_NULL",
                                    "id": 3
                                },
                                {
                                    "name": "AGGR_MIN",
                                    "id": 4
                                },
                                {
                                    "name": "AGGR_MAX",
                                    "id": 5
                                },
                                {
                                    "name": "AGGR_VARIANCE",
                                    "id": 6
                                },
                                {
                                    "name": "AGGR_STDEV",
                                    "id": 7
                                },
                                {
                                    "name": "AGGR_GROWTH",
                                    "id": 8
                                },
                                {
                                    "name": "AGGR_MEDIAN",
                                    "id": 9
                                },
                                {
                                    "name": "AGGR_COUNT_DISTINCT",
                                    "id": 10
                                },
                                {
                                    "name": "AGGR_COUNT_WITH_NULL",
                                    "id": 11
                                },
                                {
                                    "name": "AGGR_ROW_NUMBER",
                                    "id": 12
                                },
                                {
                                    "name": "AGGR_RANK",
                                    "id": 13
                                },
                                {
                                    "name": "AGGR_DENSE_RANK",
                                    "id": 14
                                },
                                {
                                    "name": "AGGR_APPROX_COUNT_DISTINCT",
                                    "id": 15
                                },
                                {
                                    "name": "AGGR_DISTINCT",
                                    "id": 16
                                },
                                {
                                    "name": "NONE",
                                    "id": 0
                                },
                                {
                                    "name": "SUM",
                                    "id": 1
                                },
                                {
                                    "name": "AVG",
                                    "id": 2
                                },
                                {
                                    "name": "COUNT",
                                    "id": 3
                                },
                                {
                                    "name": "COUNT_NON_NULL",
                                    "id": 3
                                },
                                {
                                    "name": "MIN",
                                    "id": 4
                                },
                                {
                                    "name": "MAX",
                                    "id": 5
                                },
                                {
                                    "name": "VARIANCE",
                                    "id": 6
                                },
                                {
                                    "name": "STDEV",
                                    "id": 7
                                },
                                {
                                    "name": "GROWTH",
                                    "id": 8
                                },
                                {
                                    "name": "MEDIAN",
                                    "id": 9
                                },
                                {
                                    "name": "COUNT_DISTINCT",
                                    "id": 10
                                },
                                {
                                    "name": "COUNT_WITH_NULL",
                                    "id": 11
                                }
                            ],
                            "options": {
                                "allow_alias": true
                            }
                        }
                    ]
                },
                {
                    "name": "ExpressionOp",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "OP_NONE",
                                    "id": 0
                                },
                                {
                                    "name": "OP_PLUS",
                                    "id": 1
                                },
                                {
                                    "name": "OP_MINUS",
                                    "id": 2
                                },
                                {
                                    "name": "OP_MULTIPLY",
                                    "id": 3
                                },
                                {
                                    "name": "OP_DIVIDE",
                                    "id": 4
                                },
                                {
                                    "name": "OP_MOD",
                                    "id": 5
                                },
                                {
                                    "name": "OP_EXP",
                                    "id": 6
                                },
                                {
                                    "name": "OP_ABS_YEAR",
                                    "id": 7
                                },
                                {
                                    "name": "OP_ABS_QUARTER",
                                    "id": 8
                                },
                                {
                                    "name": "OP_ABS_MONTH",
                                    "id": 9
                                },
                                {
                                    "name": "OP_ABS_DAY",
                                    "id": 10
                                },
                                {
                                    "name": "OP_QUARTER_IN_YEAR",
                                    "id": 11
                                },
                                {
                                    "name": "OP_MONTH_IN_YEAR",
                                    "id": 12
                                },
                                {
                                    "name": "OP_DAY_IN_YEAR",
                                    "id": 13
                                },
                                {
                                    "name": "OP_MONTH_IN_QUARTER",
                                    "id": 14
                                },
                                {
                                    "name": "OP_DAY_IN_QUARTER",
                                    "id": 15
                                },
                                {
                                    "name": "OP_DAY_IN_MONTH",
                                    "id": 16
                                },
                                {
                                    "name": "OP_DAY_OF_WEEK",
                                    "id": 17
                                },
                                {
                                    "name": "OP_YEAR_START_EPOCH",
                                    "id": 21
                                },
                                {
                                    "name": "OP_QUARTER_START_EPOCH",
                                    "id": 22
                                },
                                {
                                    "name": "OP_MONTH_START_EPOCH",
                                    "id": 23
                                },
                                {
                                    "name": "OP_DAY_START_EPOCH",
                                    "id": 24
                                },
                                {
                                    "name": "OP_WEEK_IN_YEAR",
                                    "id": 25
                                },
                                {
                                    "name": "OP_WEEK_IN_QUARTER",
                                    "id": 26
                                },
                                {
                                    "name": "OP_WEEK_IN_MONTH",
                                    "id": 27
                                },
                                {
                                    "name": "OP_WEEK_IN_YEAR_AS_EPOCH",
                                    "id": 28
                                },
                                {
                                    "name": "OP_WEEK_IN_QUARTER_AS_EPOCH",
                                    "id": 29
                                },
                                {
                                    "name": "OP_WEEK_IN_MONTH_AS_EPOCH",
                                    "id": 30
                                },
                                {
                                    "name": "OP_ABS_HOUR",
                                    "id": 31
                                },
                                {
                                    "name": "OP_HOUR_START_EPOCH",
                                    "id": 32
                                },
                                {
                                    "name": "OP_ABS_WEEK",
                                    "id": 33
                                },
                                {
                                    "name": "OP_WEEK_START_EPOCH",
                                    "id": 34
                                },
                                {
                                    "name": "OP_NOT",
                                    "id": 35
                                },
                                {
                                    "name": "OP_SQRT",
                                    "id": 36
                                },
                                {
                                    "name": "OP_STRLEN",
                                    "id": 37
                                },
                                {
                                    "name": "OP_IS_NULL",
                                    "id": 38
                                },
                                {
                                    "name": "OP_EQUALS",
                                    "id": 39
                                },
                                {
                                    "name": "OP_NOT_EQUALS",
                                    "id": 40
                                },
                                {
                                    "name": "OP_LESS_THAN",
                                    "id": 41
                                },
                                {
                                    "name": "OP_LESSER_EQUALS",
                                    "id": 42
                                },
                                {
                                    "name": "OP_GREATER_THAN",
                                    "id": 43
                                },
                                {
                                    "name": "OP_GREATER_EQUALS",
                                    "id": 44
                                },
                                {
                                    "name": "OP_AND",
                                    "id": 45
                                },
                                {
                                    "name": "OP_OR",
                                    "id": 46
                                },
                                {
                                    "name": "OP_BEGINS_WITH",
                                    "id": 47
                                },
                                {
                                    "name": "OP_ENDS_WITH",
                                    "id": 48
                                },
                                {
                                    "name": "OP_CONTAINS",
                                    "id": 49
                                },
                                {
                                    "name": "OP_EQUALS_NOCASE",
                                    "id": 50
                                },
                                {
                                    "name": "OP_NOT_EQUALS_NOCASE",
                                    "id": 51
                                },
                                {
                                    "name": "OP_LESS_THAN_NOCASE",
                                    "id": 52
                                },
                                {
                                    "name": "OP_LESSER_EQUALS_NOCASE",
                                    "id": 53
                                },
                                {
                                    "name": "OP_GREATER_THAN_NOCASE",
                                    "id": 54
                                },
                                {
                                    "name": "OP_GREATER_EQUALS_NOCASE",
                                    "id": 55
                                },
                                {
                                    "name": "OP_BEGINS_WITH_NOCASE",
                                    "id": 56
                                },
                                {
                                    "name": "OP_ENDS_WITH_NOCASE",
                                    "id": 57
                                },
                                {
                                    "name": "OP_CONTAINS_NOCASE",
                                    "id": 58
                                },
                                {
                                    "name": "OP_NEGATE",
                                    "id": 59
                                },
                                {
                                    "name": "OP_ABS",
                                    "id": 60
                                },
                                {
                                    "name": "OP_FLOOR",
                                    "id": 61
                                },
                                {
                                    "name": "OP_CEIL",
                                    "id": 62
                                },
                                {
                                    "name": "OP_SQUARE",
                                    "id": 63
                                },
                                {
                                    "name": "OP_CUBE",
                                    "id": 64
                                },
                                {
                                    "name": "OP_CUBEROOT",
                                    "id": 65
                                },
                                {
                                    "name": "OP_EXP2",
                                    "id": 66
                                },
                                {
                                    "name": "OP_LN",
                                    "id": 67
                                },
                                {
                                    "name": "OP_LOG2",
                                    "id": 68
                                },
                                {
                                    "name": "OP_LOG10",
                                    "id": 69
                                },
                                {
                                    "name": "OP_SIGN",
                                    "id": 70
                                },
                                {
                                    "name": "OP_POW",
                                    "id": 71
                                },
                                {
                                    "name": "OP_LEAST",
                                    "id": 72
                                },
                                {
                                    "name": "OP_GREATEST",
                                    "id": 73
                                },
                                {
                                    "name": "OP_DATE_DIFF_DAYS",
                                    "id": 74
                                },
                                {
                                    "name": "OP_COS",
                                    "id": 75
                                },
                                {
                                    "name": "OP_SIN",
                                    "id": 76
                                },
                                {
                                    "name": "OP_TAN",
                                    "id": 77
                                },
                                {
                                    "name": "OP_ACOS",
                                    "id": 78
                                },
                                {
                                    "name": "OP_ASIN",
                                    "id": 79
                                },
                                {
                                    "name": "OP_ATAN",
                                    "id": 80
                                },
                                {
                                    "name": "OP_ATAN2",
                                    "id": 81
                                },
                                {
                                    "name": "OP_IF_NULL",
                                    "id": 82
                                },
                                {
                                    "name": "OP_IF",
                                    "id": 83
                                },
                                {
                                    "name": "OP_RANDOM",
                                    "id": 84
                                },
                                {
                                    "name": "OP_ROUND",
                                    "id": 85
                                },
                                {
                                    "name": "OP_STRPOS",
                                    "id": 86
                                },
                                {
                                    "name": "OP_NOW",
                                    "id": 87
                                },
                                {
                                    "name": "OP_SUBSTR",
                                    "id": 88
                                },
                                {
                                    "name": "OP_SPHERICAL_DISTANCE",
                                    "id": 89
                                },
                                {
                                    "name": "OP_IS_WEEKEND",
                                    "id": 90
                                },
                                {
                                    "name": "OP_DAY_OF_WEEK_STR",
                                    "id": 91
                                },
                                {
                                    "name": "OP_DATE_ADD_DAYS",
                                    "id": 92
                                },
                                {
                                    "name": "OP_HOUR_IN_DAY",
                                    "id": 93
                                },
                                {
                                    "name": "OP_SECOND_IN_DAY",
                                    "id": 94
                                },
                                {
                                    "name": "OP_MONTH_IN_YEAR_STR",
                                    "id": 95
                                },
                                {
                                    "name": "OP_IDENTITY",
                                    "id": 96
                                },
                                {
                                    "name": "OP_HASH",
                                    "id": 97
                                },
                                {
                                    "name": "OP_COMBINE_HASH",
                                    "id": 98
                                },
                                {
                                    "name": "OP_DATE_PARSE",
                                    "id": 99
                                },
                                {
                                    "name": "OP_TIME_PART",
                                    "id": 100
                                },
                                {
                                    "name": "OP_STRCAT",
                                    "id": 101
                                },
                                {
                                    "name": "OP_IN",
                                    "id": 102
                                },
                                {
                                    "name": "OP_CONVERT_BOOL_NUMERIC",
                                    "id": 103
                                },
                                {
                                    "name": "OP_CONVERT_BOOL_STRING",
                                    "id": 104
                                },
                                {
                                    "name": "OP_CONVERT_NUMERIC_BOOL",
                                    "id": 105
                                },
                                {
                                    "name": "OP_CONVERT_STRING_BOOL",
                                    "id": 106
                                },
                                {
                                    "name": "OP_CONVERT_FLOAT_INTEGER",
                                    "id": 107
                                },
                                {
                                    "name": "OP_CONVERT_STRING_INT64",
                                    "id": 108
                                },
                                {
                                    "name": "OP_CONVERT_STRING_DOUBLE",
                                    "id": 109
                                },
                                {
                                    "name": "OP_CONVERT_INT64_STRING",
                                    "id": 110
                                },
                                {
                                    "name": "OP_CONVERT_DOUBLE_STRING",
                                    "id": 111
                                },
                                {
                                    "name": "OP_CONVERT_DATE_STRING",
                                    "id": 112
                                },
                                {
                                    "name": "OP_SPELLS_LIKE",
                                    "id": 113
                                },
                                {
                                    "name": "OP_SOUNDS_LIKE",
                                    "id": 114
                                },
                                {
                                    "name": "OP_LIKE",
                                    "id": 115
                                },
                                {
                                    "name": "OP_STRING_MATCH_SCORE",
                                    "id": 116
                                },
                                {
                                    "name": "OP_EDIT_DISTANCE",
                                    "id": 117
                                },
                                {
                                    "name": "OP_EDIT_DISTANCE_WITH_CAP",
                                    "id": 118
                                },
                                {
                                    "name": "OP_TODAY",
                                    "id": 119
                                },
                                {
                                    "name": "OP_APPROX_SET_CARDINALITY",
                                    "id": 120
                                },
                                {
                                    "name": "OP_CONTAINER_SIZE",
                                    "id": 121
                                },
                                {
                                    "name": "OP_CONVERT_STRING_FLOAT",
                                    "id": 122
                                },
                                {
                                    "name": "OP_NUM_OPS",
                                    "id": 123
                                },
                                {
                                    "name": "NONE",
                                    "id": 0
                                },
                                {
                                    "name": "SUM",
                                    "id": 1
                                },
                                {
                                    "name": "DIFF",
                                    "id": 2
                                },
                                {
                                    "name": "MULT",
                                    "id": 3
                                },
                                {
                                    "name": "DIV",
                                    "id": 4
                                },
                                {
                                    "name": "MOD",
                                    "id": 5
                                },
                                {
                                    "name": "EXP",
                                    "id": 6
                                },
                                {
                                    "name": "ABS_YEAR",
                                    "id": 7
                                },
                                {
                                    "name": "ABS_QUARTER",
                                    "id": 8
                                },
                                {
                                    "name": "ABS_MONTH",
                                    "id": 9
                                },
                                {
                                    "name": "ABS_DAY",
                                    "id": 10
                                },
                                {
                                    "name": "QUARTER_IN_YEAR",
                                    "id": 11
                                },
                                {
                                    "name": "MONTH_IN_YEAR",
                                    "id": 12
                                },
                                {
                                    "name": "DAY_IN_YEAR",
                                    "id": 13
                                },
                                {
                                    "name": "MONTH_IN_QUARTER",
                                    "id": 14
                                },
                                {
                                    "name": "DAY_IN_QUARTER",
                                    "id": 15
                                },
                                {
                                    "name": "DAY_IN_MONTH",
                                    "id": 16
                                },
                                {
                                    "name": "DAY_OF_WEEK",
                                    "id": 17
                                },
                                {
                                    "name": "ABS_YEAR_AS_EPOCH",
                                    "id": 21
                                },
                                {
                                    "name": "YEAR_START_EPOCH",
                                    "id": 21
                                },
                                {
                                    "name": "ABS_QUARTER_AS_EPOCH",
                                    "id": 22
                                },
                                {
                                    "name": "QUARTER_START_EPOCH",
                                    "id": 22
                                },
                                {
                                    "name": "ABS_MONTH_AS_EPOCH",
                                    "id": 23
                                },
                                {
                                    "name": "MONTH_START_EPOCH",
                                    "id": 23
                                },
                                {
                                    "name": "ABS_DAY_AS_EPOCH",
                                    "id": 24
                                },
                                {
                                    "name": "DAY_START_EPOCH",
                                    "id": 24
                                },
                                {
                                    "name": "WEEK_IN_YEAR",
                                    "id": 25
                                },
                                {
                                    "name": "WEEK_IN_QUARTER",
                                    "id": 26
                                },
                                {
                                    "name": "WEEK_IN_MONTH",
                                    "id": 27
                                },
                                {
                                    "name": "WEEK_IN_YEAR_AS_EPOCH",
                                    "id": 28
                                },
                                {
                                    "name": "WEEK_IN_QUARTER_AS_EPOCH",
                                    "id": 29
                                },
                                {
                                    "name": "WEEK_IN_MONTH_AS_EPOCH",
                                    "id": 30
                                },
                                {
                                    "name": "ABS_HOUR",
                                    "id": 31
                                },
                                {
                                    "name": "ABS_HOUR_AS_EPOCH",
                                    "id": 32
                                },
                                {
                                    "name": "HOUR_START_EPOCH",
                                    "id": 32
                                },
                                {
                                    "name": "ABS_WEEK",
                                    "id": 33
                                },
                                {
                                    "name": "WEEK_START_EPOCH",
                                    "id": 34
                                }
                            ],
                            "options": {
                                "allow_alias": true
                            }
                        }
                    ]
                },
                {
                    "name": "PartitionWindow",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Point",
                            "name": "start",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "Point",
                            "name": "end",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "WindowType",
                            "name": "window_type",
                            "id": 3,
                            "options": {
                                "default": "RANGE"
                            }
                        }
                    ],
                    "messages": [
                        {
                            "name": "Point",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "PointType",
                                    "name": "type",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "sint64",
                                    "name": "n",
                                    "id": 2
                                }
                            ]
                        }
                    ],
                    "enums": [
                        {
                            "name": "PointType",
                            "values": [
                                {
                                    "name": "UNBOUNDED_PRECEDING",
                                    "id": 1
                                },
                                {
                                    "name": "PRECEDING",
                                    "id": 2
                                },
                                {
                                    "name": "UNBOUNDED_FOLLOWING",
                                    "id": 3
                                },
                                {
                                    "name": "FOLLOWING",
                                    "id": 4
                                },
                                {
                                    "name": "CURRENT_ROW",
                                    "id": 5
                                }
                            ]
                        },
                        {
                            "name": "WindowType",
                            "values": [
                                {
                                    "name": "RANGE",
                                    "id": 1
                                },
                                {
                                    "name": "ROW",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "DeprecatedUserAnnotation",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "type",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "ConstantValue",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "sint32",
                            "name": "int32_val",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "sint64",
                            "name": "int64_val",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "string_val",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "bool_val",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "double",
                            "name": "double_val",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "float",
                            "name": "float_val",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "null_val",
                            "id": 7,
                            "options": {
                                "default": false
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "normalize",
                            "id": 8,
                            "options": {
                                "default": true
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "ValueProto.Type",
                            "name": "null_type",
                            "id": 9
                        }
                    ]
                },
                {
                    "name": "ValueDefinition",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "display_name",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "ConstantValue",
                            "name": "value",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "Internal",
                            "name": "internal",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "DeprecatedUserAnnotation",
                            "name": "user_annotation",
                            "id": 4,
                            "options": {
                                "deprecated": true
                            }
                        }
                    ],
                    "messages": [
                        {
                            "name": "Internal",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "ValueProto",
                                    "name": "vproto",
                                    "id": 1
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ColumnDefinition",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "display_name",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "Column",
                            "name": "column",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "DeprecatedUserAnnotation",
                            "name": "user_annotation",
                            "id": 4,
                            "options": {
                                "deprecated": true
                            }
                        }
                    ],
                    "messages": [
                        {
                            "name": "Column",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "table_name",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "table_display_name",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "column_name",
                                    "id": 3
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "column_display_name",
                                    "id": 4
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "user_schema_name",
                                    "id": 5
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "user_schema_display_name",
                                    "id": 6
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "PartitionOverDefinition",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "partition_by",
                            "id": 1,
                            "options": {
                                "(defn_ref)": true
                            }
                        },
                        {
                            "rule": "repeated",
                            "type": "OrderingColumn",
                            "name": "order_by",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "PartitionWindow",
                            "name": "window",
                            "id": 3
                        }
                    ],
                    "messages": [
                        {
                            "name": "OrderingColumn",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "column",
                                    "id": 1,
                                    "options": {
                                        "(defn_ref)": true
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "ascending",
                                    "id": 2,
                                    "options": {
                                        "default": true
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ExpressionDefinition",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "display_name",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "ExpressionOp.E",
                            "name": "op",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "left_node_tag",
                            "id": 4,
                            "options": {
                                "deprecated": true
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "right_node_tag",
                            "id": 5,
                            "options": {
                                "deprecated": true
                            }
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "operand_tag",
                            "id": 9,
                            "options": {
                                "(defn_ref)": true
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "AggregateOp.E",
                            "name": "function",
                            "id": 6,
                            "options": {
                                "default": "NONE"
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "DataType.E",
                            "name": "data_type",
                            "id": 7,
                            "options": {
                                "default": "UNKNOWN"
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "DeprecatedUserAnnotation",
                            "name": "user_annotation",
                            "id": 8,
                            "options": {
                                "deprecated": true
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "PartitionOverDefinition",
                            "name": "partition_over",
                            "id": 10
                        }
                    ]
                },
                {
                    "name": "ExpressionDefinitionList",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "ExpressionDefinition",
                            "name": "nodes",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "Definitions",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "ColumnDefinition",
                            "name": "columns",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "ExpressionDefinitionList",
                            "name": "expressions_old",
                            "id": 2,
                            "options": {
                                "deprecated": true
                            }
                        },
                        {
                            "rule": "repeated",
                            "type": "ExpressionDefinition",
                            "name": "expressions",
                            "id": 3
                        },
                        {
                            "rule": "repeated",
                            "type": "ValueDefinition",
                            "name": "values",
                            "id": 4
                        }
                    ]
                },
                {
                    "name": "TableVersionInfo",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "table",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "alias",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "sint32",
                            "name": "data_version",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "sint32",
                            "name": "schema_version",
                            "id": 4
                        }
                    ]
                }
            ]
        },
        {
            "name": "sage",
            "fields": [],
            "options": {
                "java_package": "com.thoughtspot.sage",
                "java_outer_classname": "SageA3Interface"
            },
            "messages": [
                {
                    "name": "MatchType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "EXACT",
                                    "id": 0
                                },
                                {
                                    "name": "PREFIX",
                                    "id": 1
                                },
                                {
                                    "name": "SUFFIX",
                                    "id": 2
                                },
                                {
                                    "name": "SUBSTRING",
                                    "id": 3
                                },
                                {
                                    "name": "APPROXIMATE",
                                    "id": 4
                                },
                                {
                                    "name": "APPROXIMATE_PREFIX",
                                    "id": 5
                                },
                                {
                                    "name": "UNDEFINED",
                                    "id": 6
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "MatchedToken",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "token",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "type",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "double",
                            "name": "weight",
                            "id": 3,
                            "options": {
                                "default": 0
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "double",
                            "name": "cardinality_score",
                            "id": 4,
                            "options": {
                                "default": 0
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "double",
                            "name": "usage_score",
                            "id": 5,
                            "options": {
                                "default": 0
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "MatchType.E",
                            "name": "match_type",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "auto_generated_synonym",
                            "id": 7,
                            "options": {
                                "default": false
                            }
                        }
                    ]
                },
                {
                    "name": "EntityCategory",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "DEFAULT",
                                    "id": 0
                                },
                                {
                                    "name": "PERSON",
                                    "id": 1
                                },
                                {
                                    "name": "PLACE",
                                    "id": 2
                                },
                                {
                                    "name": "TIME",
                                    "id": 3
                                },
                                {
                                    "name": "MONEY",
                                    "id": 4
                                },
                                {
                                    "name": "PRODUCT",
                                    "id": 5
                                },
                                {
                                    "name": "NUM_TYPES",
                                    "id": 6
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "EntityHeader",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "guid",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "description",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "created",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "modified",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "index_version",
                            "id": 6
                        }
                    ]
                },
                {
                    "name": "SynonymProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "EntityHeader",
                            "name": "permitted_users",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "SparseBitmapProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "uint32",
                            "name": "size",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "base",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "bytes",
                            "name": "data",
                            "id": 3
                        }
                    ]
                },
                {
                    "name": "AggregationType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "NONE",
                                    "id": 0
                                },
                                {
                                    "name": "COUNT",
                                    "id": 1
                                },
                                {
                                    "name": "UNIQUE_COUNT",
                                    "id": 2
                                },
                                {
                                    "name": "SUM",
                                    "id": 3
                                },
                                {
                                    "name": "AVERAGE",
                                    "id": 4
                                },
                                {
                                    "name": "MIN",
                                    "id": 5
                                },
                                {
                                    "name": "MAX",
                                    "id": 6
                                },
                                {
                                    "name": "STD_DEVIATION",
                                    "id": 7
                                },
                                {
                                    "name": "VARIANCE",
                                    "id": 8
                                },
                                {
                                    "name": "AGGREGATE_DISTINCT",
                                    "id": 9
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "CompareTypeProto",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "EQ",
                                    "id": 0
                                },
                                {
                                    "name": "NE",
                                    "id": 1
                                },
                                {
                                    "name": "LT",
                                    "id": 2
                                },
                                {
                                    "name": "LE",
                                    "id": 3
                                },
                                {
                                    "name": "GT",
                                    "id": 4
                                },
                                {
                                    "name": "GE",
                                    "id": 5
                                },
                                {
                                    "name": "IN",
                                    "id": 6
                                },
                                {
                                    "name": "BW",
                                    "id": 7
                                },
                                {
                                    "name": "CONTAINS",
                                    "id": 8
                                },
                                {
                                    "name": "BEGINS_WITH",
                                    "id": 9
                                },
                                {
                                    "name": "ENDS_WITH",
                                    "id": 10
                                },
                                {
                                    "name": "BW_INC",
                                    "id": 11
                                },
                                {
                                    "name": "BW_INC_MIN",
                                    "id": 12
                                },
                                {
                                    "name": "BW_INC_MAX",
                                    "id": 13
                                },
                                {
                                    "name": "LIKE",
                                    "id": 14
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "TimeBucket",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "NO_BUCKET",
                                    "id": 0
                                },
                                {
                                    "name": "DAILY",
                                    "id": 1
                                },
                                {
                                    "name": "WEEKLY",
                                    "id": 2
                                },
                                {
                                    "name": "MONTHLY",
                                    "id": 3
                                },
                                {
                                    "name": "QUARTERLY",
                                    "id": 4
                                },
                                {
                                    "name": "YEARLY",
                                    "id": 5
                                },
                                {
                                    "name": "HOURLY",
                                    "id": 6
                                },
                                {
                                    "name": "DAY_OF_WEEK",
                                    "id": 7
                                },
                                {
                                    "name": "AUTO",
                                    "id": 8
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "TimeBucketQualifierProto",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "YEAR_OVER_YEAR",
                                    "id": 0
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "TokenType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "UNRECOGNIZED",
                                    "id": 1
                                },
                                {
                                    "name": "MEASURE",
                                    "id": 2
                                },
                                {
                                    "name": "ATTRIBUTE",
                                    "id": 3
                                },
                                {
                                    "name": "VALUE",
                                    "id": 4
                                },
                                {
                                    "name": "KEYWORD",
                                    "id": 5
                                },
                                {
                                    "name": "OPERATOR",
                                    "id": 6
                                },
                                {
                                    "name": "POSITIVE_INT",
                                    "id": 7
                                },
                                {
                                    "name": "SUBSTRING_VALUE",
                                    "id": 8
                                },
                                {
                                    "name": "PREFIX_VALUE",
                                    "id": 9
                                },
                                {
                                    "name": "SUFFIX_VALUE",
                                    "id": 10
                                },
                                {
                                    "name": "YEAR",
                                    "id": 14
                                },
                                {
                                    "name": "DATE_BUCKET",
                                    "id": 17
                                },
                                {
                                    "name": "FUNCTION_NAME",
                                    "id": 22
                                },
                                {
                                    "name": "DELIMITER",
                                    "id": 23
                                },
                                {
                                    "name": "FORMULA",
                                    "id": 24
                                },
                                {
                                    "name": "CONSTANT",
                                    "id": 25
                                },
                                {
                                    "name": "STOP_WORD",
                                    "id": 26
                                },
                                {
                                    "name": "SKIP_TOKEN",
                                    "id": 27
                                },
                                {
                                    "name": "INCLUDE_FSM",
                                    "id": 11
                                },
                                {
                                    "name": "ANY",
                                    "id": 18
                                },
                                {
                                    "name": "END_FSM",
                                    "id": 19
                                },
                                {
                                    "name": "MAX_TYPE",
                                    "id": 28
                                },
                                {
                                    "name": "INTEGER",
                                    "id": 12
                                },
                                {
                                    "name": "DOUBLE",
                                    "id": 13
                                },
                                {
                                    "name": "STRING",
                                    "id": 20
                                },
                                {
                                    "name": "BOOL",
                                    "id": 21
                                },
                                {
                                    "name": "DATE",
                                    "id": 15
                                },
                                {
                                    "name": "TIME",
                                    "id": 16
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "PhraseType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "AGGREGATED_COLUMN_PHRASE",
                                    "id": 1
                                },
                                {
                                    "name": "GROUP_BY_COLUMN_PHRASE",
                                    "id": 2
                                },
                                {
                                    "name": "FILTER_PHRASE",
                                    "id": 3
                                },
                                {
                                    "name": "HAVING_PHRASE",
                                    "id": 4
                                },
                                {
                                    "name": "TOP_BOTTOM_PHRASE",
                                    "id": 5
                                },
                                {
                                    "name": "GROWTH_PHRASE",
                                    "id": 6
                                },
                                {
                                    "name": "SORT_BY_PHRASE",
                                    "id": 7
                                },
                                {
                                    "name": "FOR_EACH_PHRASE",
                                    "id": 8
                                },
                                {
                                    "name": "SHOW_COLUMN_PHRASE",
                                    "id": 9
                                },
                                {
                                    "name": "AGGREGATED_ATTRIBUTE_VALUE_PHRASE",
                                    "id": 10
                                },
                                {
                                    "name": "FORMULA_PHRASE",
                                    "id": 11
                                },
                                {
                                    "name": "PIVOT_PHRASE",
                                    "id": 12
                                },
                                {
                                    "name": "GEOFILTER_PHRASE",
                                    "id": 13
                                },
                                {
                                    "name": "STOP_WORD_PHRASE",
                                    "id": 14
                                },
                                {
                                    "name": "SKIP_TOKEN_PHRASE",
                                    "id": 15
                                },
                                {
                                    "name": "UNDEFINED_PHRASE",
                                    "id": 16
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "IndexType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "DATA",
                                    "id": 0
                                },
                                {
                                    "name": "METADATA",
                                    "id": 1
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "IndexCategory",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "GLOBAL",
                                    "id": 0
                                },
                                {
                                    "name": "PERSONAL",
                                    "id": 1
                                },
                                {
                                    "name": "NUM_CATEGORY",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "PhysicalTableType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "SYSTEM",
                                    "id": 0
                                },
                                {
                                    "name": "USER",
                                    "id": 1
                                },
                                {
                                    "name": "STATSDB",
                                    "id": 2
                                },
                                {
                                    "name": "NUM_TYPES",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ColumnType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "UNKNOWN",
                                    "id": 0
                                },
                                {
                                    "name": "ATTRIBUTE",
                                    "id": 1
                                },
                                {
                                    "name": "MEASURE",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ColumnIndexType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "DEFAULT",
                                    "id": 0
                                },
                                {
                                    "name": "DONT_INDEX",
                                    "id": 1
                                },
                                {
                                    "name": "PREFIX_ONLY",
                                    "id": 2
                                },
                                {
                                    "name": "PREFIX_AND_WORD_SUBSTRING",
                                    "id": 3
                                },
                                {
                                    "name": "PREFIX_AND_SUBSTRING",
                                    "id": 4
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ColumnIndexSourceType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "FALCON_QUERY",
                                    "id": 0
                                },
                                {
                                    "name": "INLINE_VALUES",
                                    "id": 1
                                },
                                {
                                    "name": "RLS_AWARE_FALCON_QUERY",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "LogicalTableType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "ONE_TO_ONE",
                                    "id": 0
                                },
                                {
                                    "name": "WORKSHEET",
                                    "id": 1
                                },
                                {
                                    "name": "USER_TABLE",
                                    "id": 2
                                },
                                {
                                    "name": "NUM_TYPES",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "DateFilterProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "DateFilterType",
                            "name": "type",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "DatePeriod",
                            "name": "date_period",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "year",
                            "id": 3,
                            "options": {
                                "default": -1
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "Quarter",
                            "name": "quarter",
                            "id": 4,
                            "options": {
                                "default": "NUM_QUARTERS"
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "Month",
                            "name": "month",
                            "id": 5,
                            "options": {
                                "default": "NUM_MONTHS"
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "WeekDay",
                            "name": "week_day",
                            "id": 6,
                            "options": {
                                "default": "NUM_WEEK_DAYS"
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "number",
                            "id": 7
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "epoch",
                            "id": 8,
                            "options": {
                                "default": -1
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "CompareTypeProto.E",
                            "name": "op",
                            "id": 9
                        },
                        {
                            "rule": "optional",
                            "type": "DateRange",
                            "name": "date_range",
                            "id": 10
                        }
                    ],
                    "messages": [
                        {
                            "name": "DateRange",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "low_epoch",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "high_epoch",
                                    "id": 2
                                }
                            ]
                        }
                    ],
                    "enums": [
                        {
                            "name": "DatePeriod",
                            "values": [
                                {
                                    "name": "DAY",
                                    "id": 0
                                },
                                {
                                    "name": "WEEK",
                                    "id": 1
                                },
                                {
                                    "name": "MONTH",
                                    "id": 2
                                },
                                {
                                    "name": "QUARTER",
                                    "id": 3
                                },
                                {
                                    "name": "YEAR",
                                    "id": 4
                                },
                                {
                                    "name": "HOUR",
                                    "id": 5
                                },
                                {
                                    "name": "MINUTE",
                                    "id": 6
                                },
                                {
                                    "name": "SECOND",
                                    "id": 7
                                },
                                {
                                    "name": "NUM_DATE_PERIODS",
                                    "id": 8
                                }
                            ]
                        },
                        {
                            "name": "Quarter",
                            "values": [
                                {
                                    "name": "Q1",
                                    "id": 0
                                },
                                {
                                    "name": "Q2",
                                    "id": 1
                                },
                                {
                                    "name": "Q3",
                                    "id": 2
                                },
                                {
                                    "name": "Q4",
                                    "id": 3
                                },
                                {
                                    "name": "NUM_QUARTERS",
                                    "id": 4
                                }
                            ]
                        },
                        {
                            "name": "Month",
                            "values": [
                                {
                                    "name": "JANUARY",
                                    "id": 0
                                },
                                {
                                    "name": "FEBRUARY",
                                    "id": 1
                                },
                                {
                                    "name": "MARCH",
                                    "id": 2
                                },
                                {
                                    "name": "APRIL",
                                    "id": 3
                                },
                                {
                                    "name": "MAY",
                                    "id": 4
                                },
                                {
                                    "name": "JUNE",
                                    "id": 5
                                },
                                {
                                    "name": "JULY",
                                    "id": 6
                                },
                                {
                                    "name": "AUGUST",
                                    "id": 7
                                },
                                {
                                    "name": "SEPTEMBER",
                                    "id": 8
                                },
                                {
                                    "name": "OCTOBER",
                                    "id": 9
                                },
                                {
                                    "name": "NOVEMBER",
                                    "id": 10
                                },
                                {
                                    "name": "DECEMBER",
                                    "id": 11
                                },
                                {
                                    "name": "NUM_MONTHS",
                                    "id": 12
                                }
                            ]
                        },
                        {
                            "name": "WeekDay",
                            "values": [
                                {
                                    "name": "MONDAY",
                                    "id": 0
                                },
                                {
                                    "name": "TUESDAY",
                                    "id": 1
                                },
                                {
                                    "name": "WEDNESDAY",
                                    "id": 2
                                },
                                {
                                    "name": "THURSDAY",
                                    "id": 3
                                },
                                {
                                    "name": "FRIDAY",
                                    "id": 4
                                },
                                {
                                    "name": "SATURDAY",
                                    "id": 5
                                },
                                {
                                    "name": "SUNDAY",
                                    "id": 6
                                },
                                {
                                    "name": "NUM_WEEK_DAYS",
                                    "id": 7
                                }
                            ]
                        },
                        {
                            "name": "DateFilterType",
                            "values": [
                                {
                                    "name": "YESTERDAY",
                                    "id": 0
                                },
                                {
                                    "name": "TODAY",
                                    "id": 1
                                },
                                {
                                    "name": "TOMORROW",
                                    "id": 18
                                },
                                {
                                    "name": "LAST_PERIOD",
                                    "id": 2
                                },
                                {
                                    "name": "LAST_N_PERIOD",
                                    "id": 3
                                },
                                {
                                    "name": "PERIOD_TO_DATE",
                                    "id": 4
                                },
                                {
                                    "name": "YEAR_ONLY",
                                    "id": 5
                                },
                                {
                                    "name": "QUARTER_YEAR",
                                    "id": 6
                                },
                                {
                                    "name": "QUARTER_ONLY",
                                    "id": 20
                                },
                                {
                                    "name": "MONTH_ONLY",
                                    "id": 7
                                },
                                {
                                    "name": "WEEKDAY_ONLY",
                                    "id": 8
                                },
                                {
                                    "name": "MONTH_YEAR",
                                    "id": 9
                                },
                                {
                                    "name": "N_PERIOD_AGO",
                                    "id": 10
                                },
                                {
                                    "name": "THIS_PERIOD",
                                    "id": 13
                                },
                                {
                                    "name": "NEXT_PERIOD",
                                    "id": 14
                                },
                                {
                                    "name": "NEXT_N_PERIOD",
                                    "id": 17
                                },
                                {
                                    "name": "EXACT_DATE",
                                    "id": 11
                                },
                                {
                                    "name": "EXACT_TIME",
                                    "id": 19
                                },
                                {
                                    "name": "EXACT_DATE_TIME",
                                    "id": 12
                                },
                                {
                                    "name": "NOW",
                                    "id": 15
                                },
                                {
                                    "name": "EXACT_DATE_RANGE",
                                    "id": 16
                                },
                                {
                                    "name": "NUM_DATE_FILTERS",
                                    "id": 21
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "JoinProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "EntityHeader",
                            "name": "id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "EntityHeader",
                            "name": "source",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "EntityHeader",
                            "name": "destination",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "JoinType",
                            "name": "join_type",
                            "id": 4,
                            "options": {
                                "default": "INNER"
                            }
                        },
                        {
                            "rule": "repeated",
                            "type": "EntityHeader",
                            "name": "source_column",
                            "id": 5
                        },
                        {
                            "rule": "repeated",
                            "type": "EntityHeader",
                            "name": "dest_column",
                            "id": 6
                        }
                    ],
                    "enums": [
                        {
                            "name": "JoinType",
                            "values": [
                                {
                                    "name": "INNER",
                                    "id": 0
                                },
                                {
                                    "name": "FULL_OUTER",
                                    "id": 1
                                },
                                {
                                    "name": "LEFT_OUTER",
                                    "id": 2
                                },
                                {
                                    "name": "RIGHT_OUTER",
                                    "id": 3
                                },
                                {
                                    "name": "CROSS",
                                    "id": 4
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "JoinPathProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "EntityHeader",
                            "name": "id",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "EntityHeader",
                            "name": "root_table",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "JoinProto",
                            "name": "join",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "EntityHeader",
                            "name": "leaf_table",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "is_connected",
                            "id": 4,
                            "options": {
                                "default": true
                            }
                        },
                        {
                            "rule": "repeated",
                            "type": "EntityHeader",
                            "name": "joins",
                            "id": 2,
                            "options": {
                                "deprecated": true
                            }
                        }
                    ]
                },
                {
                    "name": "Column",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "EntityHeader",
                            "name": "id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "EntityHeader",
                            "name": "table",
                            "id": 2
                        },
                        {
                            "rule": "repeated",
                            "type": "JoinPathProto",
                            "name": "join_paths",
                            "id": 3
                        }
                    ]
                },
                {
                    "name": "SageExpression",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "ExpressionClass",
                            "name": "expr_class",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "Constant",
                            "name": "constant",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "Column",
                            "name": "column",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "Function",
                            "name": "function",
                            "id": 7
                        },
                        {
                            "rule": "optional",
                            "type": "Variable",
                            "name": "variable",
                            "id": 10
                        },
                        {
                            "rule": "optional",
                            "type": "ExpressionRef",
                            "name": "expr_ref",
                            "id": 11
                        },
                        {
                            "rule": "optional",
                            "type": "falcon.DataType.E",
                            "name": "data_type",
                            "id": 8
                        },
                        {
                            "rule": "optional",
                            "type": "common.FormatingType.E",
                            "name": "formating_type",
                            "id": 9
                        }
                    ],
                    "messages": [
                        {
                            "name": "Constant",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "str_value",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "int_value",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "double",
                                    "name": "double_value",
                                    "id": 3
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "date_epoch_value",
                                    "id": 4
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "bool_value",
                                    "id": 5
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "is_null",
                                    "id": 6,
                                    "options": {
                                        "default": false
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "normalize",
                                    "id": 7,
                                    "options": {
                                        "default": true
                                    }
                                }
                            ]
                        },
                        {
                            "name": "Function",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "name",
                                    "id": 1
                                },
                                {
                                    "rule": "repeated",
                                    "type": "SageExpression",
                                    "name": "arguments",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "is_aggregate",
                                    "id": 3,
                                    "options": {
                                        "default": false
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "has_varargs",
                                    "id": 4,
                                    "options": {
                                        "default": false
                                    }
                                }
                            ]
                        },
                        {
                            "name": "Variable",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "EntityHeader",
                                    "name": "id",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "SageExpression",
                                    "name": "value",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "is_default",
                                    "id": 3
                                }
                            ]
                        },
                        {
                            "name": "ExpressionRef",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "EntityHeader",
                                    "name": "ref_id",
                                    "id": 1
                                }
                            ]
                        }
                    ],
                    "enums": [
                        {
                            "name": "ExpressionClass",
                            "values": [
                                {
                                    "name": "EXPR_CONSTANT",
                                    "id": 0
                                },
                                {
                                    "name": "EXPR_COLUMN",
                                    "id": 1
                                },
                                {
                                    "name": "EXPR_FUNCTION",
                                    "id": 2
                                },
                                {
                                    "name": "EXPR_VARIABLE",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "A3AnalysisStatus",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "State",
                            "name": "state",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "error",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "done_percentage",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "current_status",
                            "id": 4
                        }
                    ],
                    "enums": [
                        {
                            "name": "State",
                            "values": [
                                {
                                    "name": "NOT_STARTED",
                                    "id": 0
                                },
                                {
                                    "name": "RUNNING",
                                    "id": 1
                                },
                                {
                                    "name": "DONE",
                                    "id": 2
                                },
                                {
                                    "name": "FAILED",
                                    "id": 3
                                },
                                {
                                    "name": "CANCELLED",
                                    "id": 4
                                },
                                {
                                    "name": "NOT_FOUND",
                                    "id": 5
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "AnalysisAlgorithm",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Type",
                            "name": "type",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "StdevMean",
                            "name": "stdev_mean",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "AbsDiffMajority",
                            "name": "abs_diff_majority",
                            "id": 3
                        }
                    ],
                    "messages": [
                        {
                            "name": "StdevMean",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "sint64",
                                    "name": "min_rows",
                                    "id": 1,
                                    "options": {
                                        "default": 5
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "double",
                                    "name": "multiplier",
                                    "id": 2,
                                    "options": {
                                        "default": -1
                                    }
                                }
                            ]
                        },
                        {
                            "name": "AbsDiffMajority",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "sint64",
                                    "name": "max_diff_elements",
                                    "id": 1,
                                    "options": {
                                        "default": 10
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "double",
                                    "name": "max_fraction",
                                    "id": 2,
                                    "options": {
                                        "default": 0.5
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "double",
                                    "name": "min_abs_change_ratio",
                                    "id": 3,
                                    "options": {
                                        "default": 0.1
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "double",
                                    "name": "min_change_ratio",
                                    "id": 4,
                                    "options": {
                                        "default": 0.1
                                    }
                                }
                            ]
                        }
                    ],
                    "enums": [
                        {
                            "name": "Type",
                            "values": [
                                {
                                    "name": "STDEV_MEAN",
                                    "id": 1
                                },
                                {
                                    "name": "ABS_DIFF_MAJORITY",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "AnalysisDescriptor",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "AnalysisClass",
                            "name": "analysis_class",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "OutlierDetection",
                            "name": "outlier_detection",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "DiffExplanation",
                            "name": "diff_explanation",
                            "id": 3
                        }
                    ],
                    "messages": [
                        {
                            "name": "OutlierDetection",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "AnalysisAlgorithm",
                                    "name": "algorithm",
                                    "id": 1
                                }
                            ]
                        },
                        {
                            "name": "DiffExplanation",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "AnalysisAlgorithm",
                                    "name": "algorithm",
                                    "id": 1
                                }
                            ]
                        }
                    ],
                    "enums": [
                        {
                            "name": "AnalysisClass",
                            "values": [
                                {
                                    "name": "OUTLIER_DETECTION",
                                    "id": 1
                                },
                                {
                                    "name": "DIFF_EXPLANATION",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "AnalysisParam",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "AnalysisDescriptor",
                            "name": "analysis_descriptor",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "sint64",
                            "name": "max_falcon_response_rows",
                            "id": 2,
                            "options": {
                                "default": -1
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "sint64",
                            "name": "max_falcon_queries",
                            "id": 3,
                            "options": {
                                "default": -1
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "exclude_null",
                            "id": 4,
                            "options": {
                                "default": false
                            }
                        }
                    ]
                },
                {
                    "name": "VisualizationAnalysisRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "user_guid",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "callosum.VisualizationQueryProto",
                            "name": "visualization_query",
                            "id": 2
                        },
                        {
                            "rule": "repeated",
                            "type": "auto_complete.v2.RecognizedToken",
                            "name": "selected_token",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "analysis_id",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "send_email",
                            "id": 5,
                            "options": {
                                "default": true
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "AnalysisParam",
                            "name": "param",
                            "id": 6
                        },
                        {
                            "rule": "repeated",
                            "type": "auto_complete.v2.RecognizedToken",
                            "name": "excluded_token",
                            "id": 7
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "sage.VisualizationAnalysisRequest",
                                    "name": "rpc_id",
                                    "id": 1178
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "VisualizationAnalysisResponse",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "pinboard_id",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "DataAnalysisRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "user_guid",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "callosum.VisualizationQueryProto",
                            "name": "visualization_query",
                            "id": 2
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "sage_output_column_id",
                            "id": 3
                        },
                        {
                            "rule": "repeated",
                            "type": "callosum.DataRow",
                            "name": "data_row",
                            "id": 4
                        },
                        {
                            "rule": "repeated",
                            "type": "auto_complete.v2.RecognizedToken",
                            "name": "selected_token",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "analysis_id",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "send_email",
                            "id": 7,
                            "options": {
                                "default": true
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "AnalysisParam",
                            "name": "param",
                            "id": 8
                        },
                        {
                            "rule": "repeated",
                            "type": "auto_complete.v2.RecognizedToken",
                            "name": "excluded_token",
                            "id": 9
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "sage.DataAnalysisRequest",
                                    "name": "rpc_id",
                                    "id": 1179
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "DataAnalysisResponse",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "pinboard_id",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "TableAnalysisRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "user_guid",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "table_guid",
                            "id": 2
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "selected_column",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "analysis_id",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "send_email",
                            "id": 5,
                            "options": {
                                "default": true
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "AnalysisParam",
                            "name": "param",
                            "id": 6
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "excluded_column",
                            "id": 7
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "table_name",
                            "id": 8
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "is_worksheet",
                            "id": 9,
                            "options": {
                                "default": false
                            }
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "sage.TableAnalysisRequest",
                                    "name": "rpc_id",
                                    "id": 1190
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "TableAnalysisResponse",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "pinboard_id",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "A3AnalysisType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "UNKNOWN",
                                    "id": 0
                                },
                                {
                                    "name": "VISUALIZATION",
                                    "id": 1
                                },
                                {
                                    "name": "DATA",
                                    "id": 2
                                },
                                {
                                    "name": "TABLE",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "AnalysisFacts",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "sint64",
                            "name": "rows_processed",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "sint64",
                            "name": "duration_ms",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "A3Request",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "VisualizationAnalysisRequest",
                            "name": "visualization_analysis",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "DataAnalysisRequest",
                            "name": "data_analysis",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "TableAnalysisRequest",
                            "name": "table_analysis",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "A3AnalysisType.E",
                            "name": "type",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "analysis_id",
                            "id": 5
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "sage.A3Request",
                                    "name": "rpc_id",
                                    "id": 1212
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "A3Response",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "VisualizationAnalysisResponse",
                            "name": "visualization_analysis",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "DataAnalysisResponse",
                            "name": "data_analysis",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "TableAnalysisResponse",
                            "name": "table_analysis",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "A3AnalysisType.E",
                            "name": "type",
                            "id": 4
                        }
                    ]
                },
                {
                    "name": "A3AnalysisStatusRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "analysis_id",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "sage.A3AnalysisStatusRequest",
                                    "name": "rpc_id",
                                    "id": 1213
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "A3AnalysisStatusResponse",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "analysis_id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "A3AnalysisStatus",
                            "name": "analysis_status",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "A3Response",
                            "name": "response",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "timely_job_id",
                            "id": 4
                        }
                    ]
                },
                {
                    "name": "A3AnalysisCancelRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "analysis_id",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "sage.A3AnalysisCancelRequest",
                                    "name": "rpc_id",
                                    "id": 1214
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "A3AnalysisCancelResponse",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "analysis_id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "A3AnalysisStatus",
                            "name": "analysis_status",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "A3Response",
                            "name": "response",
                            "id": 3
                        }
                    ]
                },
                {
                    "name": "auto_complete",
                    "fields": [],
                    "messages": [
                        {
                            "name": "v2",
                            "fields": [],
                            "options": {
                                "java_package": "com.thoughtspot.sage.AutoComplete",
                                "java_outer_classname": "AutoCompleteProto"
                            },
                            "messages": [
                                {
                                    "name": "LanguageType",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "ANSWER",
                                                    "id": 0
                                                },
                                                {
                                                    "name": "WORKSHEET",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "FORMULA",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "RLS_FORMULA",
                                                    "id": 3
                                                },
                                                {
                                                    "name": "NUM_LANGUAGE_TYPES",
                                                    "id": 4
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "FeatureFlag",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "ENABLE_OUT_OF_SCOPE_MATCHES",
                                                    "id": 0
                                                },
                                                {
                                                    "name": "ENABLE_REQUEST_PROFILING",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "DISABLE_UBR",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "SINGLE_TOKEN_COMPLETIONS_ONLY",
                                                    "id": 3
                                                },
                                                {
                                                    "name": "DISABLE_APPROXIMATE_MATCHES",
                                                    "id": 4
                                                },
                                                {
                                                    "name": "DISABLE_OBJECT_SEARCH",
                                                    "id": 5
                                                },
                                                {
                                                    "name": "WRITE_REQUEST_SNAPSHOT",
                                                    "id": 6
                                                },
                                                {
                                                    "name": "ENABLE_SEARCH_HISTORY",
                                                    "id": 7
                                                },
                                                {
                                                    "name": "AUTO_RESOLVE_JOIN_AMBIGUITY",
                                                    "id": 8
                                                },
                                                {
                                                    "name": "NUM_FEATURE_FLAGS",
                                                    "id": 9
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "ErrorCode",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "SUCCESS",
                                                    "id": 0
                                                },
                                                {
                                                    "name": "NOT_READY",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "CANCELLED",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "TIME_OUT_ERROR",
                                                    "id": 3
                                                },
                                                {
                                                    "name": "PERMISSION_DENIED",
                                                    "id": 4
                                                },
                                                {
                                                    "name": "FAILURE",
                                                    "id": 5
                                                },
                                                {
                                                    "name": "UNSUPPORTED_LANGUAGE",
                                                    "id": 6
                                                },
                                                {
                                                    "name": "NO_MATCH",
                                                    "id": 7
                                                },
                                                {
                                                    "name": "AMBIGUOUS_TOKEN",
                                                    "id": 8
                                                },
                                                {
                                                    "name": "BAD_RECOGNIZED_TOKENS",
                                                    "id": 9
                                                },
                                                {
                                                    "name": "BAD_TOKEN_SEQUENCE",
                                                    "id": 10
                                                },
                                                {
                                                    "name": "JOIN_PATH_AMBIGUITY",
                                                    "id": 11
                                                },
                                                {
                                                    "name": "NO_JOIN_PATH",
                                                    "id": 12
                                                },
                                                {
                                                    "name": "INVALID_TRANSFORM",
                                                    "id": 13
                                                },
                                                {
                                                    "name": "INCONSISTENT_JOIN_PATH",
                                                    "id": 14
                                                },
                                                {
                                                    "name": "RELATIONSHIP_GRAPH_HAS_CYCLES",
                                                    "id": 15
                                                },
                                                {
                                                    "name": "USER_GROUP_MASK_NOT_SET",
                                                    "id": 16
                                                },
                                                {
                                                    "name": "INCREMENTAL_REQUEST_NOT_APPLICABLE",
                                                    "id": 17
                                                },
                                                {
                                                    "name": "NOT_FOUND",
                                                    "id": 18
                                                },
                                                {
                                                    "name": "INVALID_REQUEST",
                                                    "id": 19
                                                },
                                                {
                                                    "name": "INVALID_JOIN_PATH",
                                                    "id": 20
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "ErrorSeverity",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "ERROR",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "WARNING",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "SUGGESTION",
                                                    "id": 3
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "RequestStage",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "QUEUE",
                                                    "id": 0
                                                },
                                                {
                                                    "name": "QUERY_TRANSFORMATION",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "TOKENIZATION",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "QUERY_GEN",
                                                    "id": 3
                                                },
                                                {
                                                    "name": "COMPLETION",
                                                    "id": 4
                                                },
                                                {
                                                    "name": "QUERY_COMPLETION",
                                                    "id": 5
                                                },
                                                {
                                                    "name": "HINT_GEN",
                                                    "id": 6
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "AuthToken",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "user",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "expiration_time",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int64",
                                            "name": "value",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int64",
                                            "name": "logical_schema_version",
                                            "id": 5
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SparseBitmapProto",
                                            "name": "rls_groups",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int64",
                                            "name": "group_mask",
                                            "id": 4,
                                            "options": {
                                                "deprecated": true
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "TokenMetadata",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "name",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "table",
                                            "id": 4
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "EntityHeader",
                                            "name": "root_tables",
                                            "id": 5
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "deprecated_table_name",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "deprecated_table_guid",
                                            "id": 3
                                        }
                                    ]
                                },
                                {
                                    "name": "ColumnMetadata",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "guid",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "estimated_unique_count",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "is_indexed",
                                            "id": 3
                                        }
                                    ]
                                },
                                {
                                    "name": "ClientState",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "original_token",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "truncated",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "deprecated_serialized_formula_tokens",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "deprecated_token_color",
                                            "id": 1
                                        }
                                    ]
                                },
                                {
                                    "name": "RecognizedToken",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "token",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "canonical_form",
                                            "id": 29
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "TokenType.E",
                                            "name": "type_enum",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "falcon.DataType.E",
                                            "name": "data_type",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "MatchType.E",
                                            "name": "match_type",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "guid",
                                            "id": 5
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "DateFilterProto",
                                            "name": "date_filter",
                                            "id": 27
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "output_guid",
                                            "id": 6
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "JoinPathProto",
                                            "name": "join_path",
                                            "id": 7
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "can_edit_join_path",
                                            "id": 8
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "explicit_join_path_edit",
                                            "id": 9,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "TokenMetadata",
                                            "name": "token_metadata",
                                            "id": 10
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "value_match",
                                            "id": 11
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "double",
                                            "name": "ranking_score",
                                            "id": 12
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "requires_delimiters",
                                            "id": 13
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "placeholder_text",
                                            "id": 14
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "auto_inserted_space",
                                            "id": 15,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "has_space_after",
                                            "id": 16,
                                            "options": {
                                                "default": true
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "can_be_extended",
                                            "id": 17,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "re_resolve",
                                            "id": 28,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "is_auto_disambiguated",
                                            "id": 19
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "formula_id",
                                            "id": 20
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "worksheet_column_guid",
                                            "id": 22
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ClientState",
                                            "name": "client_state",
                                            "id": 23
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "bulk_filter_value",
                                            "id": 24
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SageExpression",
                                            "name": "sage_expression",
                                            "id": 26
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "auto_generated_synonym",
                                            "id": 18
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "inconsistent_join_paths",
                                            "id": 25,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bytes",
                                            "name": "deprecated_sage_expression",
                                            "id": 21
                                        }
                                    ]
                                },
                                {
                                    "name": "JoinPathChoice",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "new_root",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "old_root",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "JoinPathProto",
                                            "name": "prepend_path",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "int32",
                                            "name": "affected_token",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "JoinPathProto",
                                            "name": "new_token_path",
                                            "id": 5
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "preferred_choice",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "new_token_editable",
                                            "id": 7
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "old_tokens_editable",
                                            "id": 8
                                        }
                                    ]
                                },
                                {
                                    "name": "JoinPathCollection",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "JoinPathChoice",
                                            "name": "choice",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "old_column_guid",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "new_token_index",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "root_index",
                                            "id": 4
                                        }
                                    ]
                                },
                                {
                                    "name": "ACChosenJoinPath",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "JoinPathProto",
                                            "name": "join_path",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "chosen_idx",
                                            "id": 2,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "start_idx",
                                            "id": 3,
                                            "options": {
                                                "default": -1
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "ACChosenColumn",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "column",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "chosen_idx",
                                            "id": 2,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "start_idx",
                                            "id": 3,
                                            "options": {
                                                "default": -1
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "ACTokenDisambiguation",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACChosenColumn",
                                            "name": "chosen_column",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACChosenJoinPath",
                                            "name": "chosen_join_path",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACVersion.E",
                                            "name": "version",
                                            "id": 3,
                                            "options": {
                                                "default": "PRE_4_3"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "SageQuery",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "header",
                                            "id": 9
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Column",
                                            "name": "columns",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Filter",
                                            "name": "filters",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "GrowthDimension",
                                            "name": "growth_dimension",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Column",
                                            "name": "result_for_each_value",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "top_count",
                                            "id": 5,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "is_sub_query",
                                            "id": 10,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "query_root_guid",
                                            "id": 11
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "is_pivot_table",
                                            "id": 12,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Column",
                                            "name": "related_attributes",
                                            "id": 6
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Column",
                                            "name": "related_measures",
                                            "id": 7
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Column",
                                            "name": "default_time_dimensions",
                                            "id": 8
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "name": "JoinPath",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "root_table_guid",
                                                    "id": 1
                                                },
                                                {
                                                    "rule": "repeated",
                                                    "type": "string",
                                                    "name": "join_guid",
                                                    "id": 2
                                                }
                                            ]
                                        },
                                        {
                                            "name": "Column",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "SageExpression",
                                                    "name": "column",
                                                    "id": 14
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "EntityHeader",
                                                    "name": "header",
                                                    "id": 16
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "ColumnType.E",
                                                    "name": "column_type",
                                                    "id": 4,
                                                    "options": {
                                                        "default": "UNKNOWN"
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "AggregationType.E",
                                                    "name": "aggregation_type",
                                                    "id": 7,
                                                    "options": {
                                                        "default": "NONE"
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "group_by",
                                                    "id": 3,
                                                    "options": {
                                                        "default": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "int32",
                                                    "name": "sort_order",
                                                    "id": 5,
                                                    "options": {
                                                        "default": -1
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "sort_ascending",
                                                    "id": 6,
                                                    "options": {
                                                        "default": true
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "show_growth",
                                                    "id": 8,
                                                    "options": {
                                                        "default": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "TimeBucket.E",
                                                    "name": "bucket",
                                                    "id": 9,
                                                    "options": {
                                                        "default": "NO_BUCKET"
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "worksheet_column_guid",
                                                    "id": 19
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "int64",
                                                    "name": "unique_values",
                                                    "id": 12
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "formula_id",
                                                    "id": 15
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "pivot_by",
                                                    "id": 20,
                                                    "options": {
                                                        "default": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "RecognizedToken",
                                                    "name": "recognized_token",
                                                    "id": 21
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "is_unmapped",
                                                    "id": 22,
                                                    "options": {
                                                        "default": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "id",
                                                    "id": 1,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "name",
                                                    "id": 2,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "JoinPath",
                                                    "name": "join_path",
                                                    "id": 11,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "marked_for_disambiguation",
                                                    "id": 13,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "show_column",
                                                    "id": 10,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "falcon.DataType.E",
                                                    "name": "deprecated_data_type",
                                                    "id": 17,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bytes",
                                                    "name": "deprecated_serialized_recognized_token",
                                                    "id": 18
                                                }
                                            ]
                                        },
                                        {
                                            "name": "Filter",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "SageExpression",
                                                    "name": "column",
                                                    "id": 16
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "EntityHeader",
                                                    "name": "header",
                                                    "id": 18
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "AggregationType.E",
                                                    "name": "aggregation_type",
                                                    "id": 12,
                                                    "options": {
                                                        "default": "NONE"
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "ColumnType.E",
                                                    "name": "column_type",
                                                    "id": 20,
                                                    "options": {
                                                        "default": "UNKNOWN"
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "CompareTypeProto.E",
                                                    "name": "op",
                                                    "id": 3
                                                },
                                                {
                                                    "rule": "repeated",
                                                    "type": "int64",
                                                    "name": "int64_value",
                                                    "id": 4
                                                },
                                                {
                                                    "rule": "repeated",
                                                    "type": "string",
                                                    "name": "string_value",
                                                    "id": 5
                                                },
                                                {
                                                    "rule": "repeated",
                                                    "type": "double",
                                                    "name": "double_value",
                                                    "id": 6
                                                },
                                                {
                                                    "rule": "repeated",
                                                    "type": "bool",
                                                    "name": "boolean_value",
                                                    "id": 7
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "negate_filter",
                                                    "id": 8,
                                                    "options": {
                                                        "default": false
                                                    }
                                                },
                                                {
                                                    "rule": "repeated",
                                                    "type": "int32",
                                                    "name": "int32_value",
                                                    "id": 9
                                                },
                                                {
                                                    "rule": "repeated",
                                                    "type": "float",
                                                    "name": "float_value",
                                                    "id": 10
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "include_null",
                                                    "id": 11,
                                                    "options": {
                                                        "default": false
                                                    }
                                                },
                                                {
                                                    "rule": "repeated",
                                                    "type": "DateFilterProto",
                                                    "name": "date_filter",
                                                    "id": 15
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "worksheet_column_guid",
                                                    "id": 17
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "formula_id",
                                                    "id": 19
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "FilterType",
                                                    "name": "type",
                                                    "id": 21,
                                                    "options": {
                                                        "default": "SIMPLE"
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "GeoInfo",
                                                    "name": "geo_info",
                                                    "id": 22
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "column_name",
                                                    "id": 1,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "column_guid",
                                                    "id": 2,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "JoinPath",
                                                    "name": "join_path",
                                                    "id": 13,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "marked_for_disambiguation",
                                                    "id": 14,
                                                    "options": {
                                                        "default": false
                                                    }
                                                }
                                            ],
                                            "messages": [
                                                {
                                                    "name": "GeoInfo",
                                                    "fields": [
                                                        {
                                                            "rule": "repeated",
                                                            "type": "GeoCircle",
                                                            "name": "circle",
                                                            "id": 1
                                                        }
                                                    ],
                                                    "messages": [
                                                        {
                                                            "name": "GeoCircle",
                                                            "fields": [
                                                                {
                                                                    "rule": "optional",
                                                                    "type": "double",
                                                                    "name": "latitude",
                                                                    "id": 1
                                                                },
                                                                {
                                                                    "rule": "optional",
                                                                    "type": "double",
                                                                    "name": "longitude",
                                                                    "id": 2
                                                                },
                                                                {
                                                                    "rule": "optional",
                                                                    "type": "double",
                                                                    "name": "radius",
                                                                    "id": 3
                                                                },
                                                                {
                                                                    "rule": "optional",
                                                                    "type": "bool",
                                                                    "name": "inclusive",
                                                                    "id": 4
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            "name": "GrowthDimension",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "SageExpression",
                                                    "name": "column",
                                                    "id": 6
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "EntityHeader",
                                                    "name": "header",
                                                    "id": 8
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "TimeBucket.E",
                                                    "name": "bucket",
                                                    "id": 3,
                                                    "options": {
                                                        "default": "MONTHLY"
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "year_over_year",
                                                    "id": 4,
                                                    "options": {
                                                        "default": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "worksheet_column_guid",
                                                    "id": 7
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "time_column",
                                                    "id": 1,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "time_column_guid",
                                                    "id": 2,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "JoinPath",
                                                    "name": "join_path",
                                                    "id": 5,
                                                    "options": {
                                                        "deprecated": false
                                                    }
                                                }
                                            ]
                                        }
                                    ],
                                    "enums": [
                                        {
                                            "name": "FilterType",
                                            "values": [
                                                {
                                                    "name": "SIMPLE",
                                                    "id": 0
                                                },
                                                {
                                                    "name": "GEO",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "NUM_FILTERS",
                                                    "id": 2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "TableJoin",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "header",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "JoinInputTable",
                                            "name": "tables",
                                            "id": 4
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "JoinedColumn",
                                            "name": "joined_columns",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "EntityHeader",
                                            "name": "deprecated_tables",
                                            "id": 2
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "name": "JoinInputTable",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "EntityHeader",
                                                    "name": "table",
                                                    "id": 1
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bool",
                                                    "name": "outer_join",
                                                    "id": 2,
                                                    "options": {
                                                        "default": true
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            "name": "JoinedColumn",
                                            "fields": [
                                                {
                                                    "rule": "repeated",
                                                    "type": "EntityHeader",
                                                    "name": "input",
                                                    "id": 1
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "EntityHeader",
                                                    "name": "output",
                                                    "id": 2
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "bytes",
                                                    "name": "serialized_recognized_token",
                                                    "id": 3
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "Statement",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "SageQuery",
                                            "name": "query",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "TableJoin",
                                            "name": "join",
                                            "id": 2
                                        }
                                    ]
                                },
                                {
                                    "name": "SageProgram",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "Statement",
                                            "name": "statements",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SageQuery",
                                            "name": "display_sage_query",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ProgramType",
                                            "name": "program_type",
                                            "id": 3,
                                            "options": {
                                                "default": "SIMPLE"
                                            }
                                        }
                                    ],
                                    "enums": [
                                        {
                                            "name": "ProgramType",
                                            "values": [
                                                {
                                                    "name": "SIMPLE",
                                                    "id": 0
                                                },
                                                {
                                                    "name": "CHASM_TRAP",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "QUERY_ON_QUERY",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "UNKNOWN",
                                                    "id": 3
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "QueryCompletionType",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "UNDEFINED",
                                                    "id": 0
                                                },
                                                {
                                                    "name": "SYNONYM",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "REWRITE",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "SEARCH_HISTORY_SELF",
                                                    "id": 3
                                                },
                                                {
                                                    "name": "SEARCH_HISTORY_OTHERS",
                                                    "id": 4
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "CompletionScope",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "IN_SCOPE",
                                                    "id": 0
                                                },
                                                {
                                                    "name": "NON_JOINABLE_SCOPE",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "OUT_OF_SCOPE",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "JOINABLE_THROUGH_CHASM_TRAP",
                                                    "id": 3
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "Completion",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "RecognizedToken",
                                            "name": "recognized_token",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "num_tokens_to_replace",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "CompletionScope.E",
                                            "name": "scope",
                                            "id": 3,
                                            "options": {
                                                "default": "IN_SCOPE"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "QueryCompletion",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "RecognizedToken",
                                            "name": "query",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "num_prefix_tokens",
                                            "id": 2,
                                            "options": {
                                                "default": 0
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "search_text",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "double",
                                            "name": "score",
                                            "id": 4,
                                            "options": {
                                                "default": 0
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "num_suffix_tokens",
                                            "id": 5,
                                            "options": {
                                                "default": 0
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "CompletionScope.E",
                                            "name": "scope",
                                            "id": 6,
                                            "options": {
                                                "default": "IN_SCOPE"
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "MatchType.E",
                                            "name": "match_type",
                                            "id": 7,
                                            "options": {
                                                "default": "UNDEFINED"
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "QueryCompletionType.E",
                                            "name": "completion_type",
                                            "id": 8,
                                            "options": {
                                                "default": "UNDEFINED"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "QueryTransformType",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "ADD_COLUMN",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "REMOVE_COLUMN",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "REMOVE_ALL_PHRASES_BY_COLUMN",
                                                    "id": 3
                                                },
                                                {
                                                    "name": "ADD_SORT_COLUMN",
                                                    "id": 4
                                                },
                                                {
                                                    "name": "REMOVE_ALL_SORT_PHRASES",
                                                    "id": 5
                                                },
                                                {
                                                    "name": "ADD_EMPTY_GROUP_BY",
                                                    "id": 6
                                                },
                                                {
                                                    "name": "ADD_IN_FILTER",
                                                    "id": 7
                                                },
                                                {
                                                    "name": "REMOVE_IN_FILTER",
                                                    "id": 8
                                                },
                                                {
                                                    "name": "ADD_PREDICATE_FILTER",
                                                    "id": 9
                                                },
                                                {
                                                    "name": "REMOVE_PREDICATE_FILTER",
                                                    "id": 10
                                                },
                                                {
                                                    "name": "REMOVE_ALL_FILTERS_FOR_COLUMN",
                                                    "id": 11
                                                },
                                                {
                                                    "name": "REMOVE_ALL_DATE_RANGE_FILTERS_FOR_COLUMN",
                                                    "id": 12
                                                },
                                                {
                                                    "name": "REMOVE_NON_FILTER_PHRASES",
                                                    "id": 13
                                                },
                                                {
                                                    "name": "ADD_HAVING_FILTER",
                                                    "id": 14
                                                },
                                                {
                                                    "name": "REMOVE_HAVING_FILTER",
                                                    "id": 15
                                                },
                                                {
                                                    "name": "REMOVE_ALL_HAVING_FILTERS",
                                                    "id": 17
                                                },
                                                {
                                                    "name": "REMOVE_ALL_HAVING_FILTERS_BY_AGGREGATE",
                                                    "id": 16
                                                },
                                                {
                                                    "name": "REMOVE_ALL_HAVING_FILTERS_BY_COLUMN",
                                                    "id": 18
                                                },
                                                {
                                                    "name": "ADD_FORMULA",
                                                    "id": 19
                                                },
                                                {
                                                    "name": "REMOVE_FORMULA",
                                                    "id": 20
                                                },
                                                {
                                                    "name": "ADD_TIME_BUCKET",
                                                    "id": 21
                                                },
                                                {
                                                    "name": "REMOVE_TIME_BUCKET",
                                                    "id": 22
                                                },
                                                {
                                                    "name": "ADD_TIME_BUCKET_QUALIFIER",
                                                    "id": 23
                                                },
                                                {
                                                    "name": "REMOVE_TIME_BUCKET_QUALIFIER",
                                                    "id": 24
                                                },
                                                {
                                                    "name": "CHANGE_AGGREGATION",
                                                    "id": 25
                                                },
                                                {
                                                    "name": "NUM_TRANSFORMS",
                                                    "id": 26
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "ChangeAggregationParam",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "AggregationType.E",
                                            "name": "old_aggregation",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "AggregationType.E",
                                            "name": "default_aggregation",
                                            "id": 2,
                                            "options": {
                                                "default": "NONE"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "QueryTransform",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "QueryTransformType.E",
                                            "name": "type",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "column_guid",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "AggregationType.E",
                                            "name": "aggregation",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "JoinPathProto",
                                            "name": "join_path",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "token_output_guid",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "CompareTypeProto.E",
                                            "name": "op",
                                            "id": 7
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "value",
                                            "id": 8
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "value2",
                                            "id": 9
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "bulk_value",
                                            "id": 10
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "negate_op",
                                            "id": 11
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "prepend_new_phrase",
                                            "id": 12
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "resolve_value_token",
                                            "id": 13,
                                            "options": {
                                                "default": true
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "combine_value_tokens",
                                            "id": 14,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "ascending",
                                            "id": 15,
                                            "options": {
                                                "default": true
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "TimeBucket.E",
                                            "name": "time_bucket",
                                            "id": 16
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "TimeBucketQualifierProto.E",
                                            "name": "time_bucket_qualifier",
                                            "id": 17
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "formula_name",
                                            "id": 18
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "formula_id",
                                            "id": 19
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "formula_output_guid",
                                            "id": 20
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "TokenType.E",
                                            "name": "formula_token_type",
                                            "id": 21,
                                            "options": {
                                                "default": "FORMULA"
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ChangeAggregationParam",
                                            "name": "change_aggregation_param",
                                            "id": 22
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SageExpression",
                                            "name": "column",
                                            "id": 23
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SageQuery.Column",
                                            "name": "query_column",
                                            "id": 24
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "date_column_guid",
                                            "id": 25
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bytes",
                                            "name": "deprecated_serialized_column",
                                            "id": 5
                                        }
                                    ]
                                },
                                {
                                    "name": "DataScope",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "logical_table",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "logical_column",
                                            "id": 2
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "RecognizedToken",
                                            "name": "filter_sage_query",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "forced_root",
                                            "id": 4
                                        }
                                    ]
                                },
                                {
                                    "name": "DataScopeTableType",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "LOGICAL",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "WORKSHEET",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "USER_DEFINED",
                                                    "id": 3
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "DataScopeTable",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "header",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "EntityHeader",
                                            "name": "column",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "DataScopeTableType.E",
                                            "name": "type",
                                            "id": 3
                                        }
                                    ]
                                },
                                {
                                    "name": "CompletionRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "AuthToken",
                                            "name": "auth_token",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "request_call_id",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "incident_id",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "query_stream_id",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int64",
                                            "name": "client_timestamp_ms",
                                            "id": 5
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "session_id",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "browser_window_id",
                                            "id": 7
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "time_budget_in_ms",
                                            "id": 8,
                                            "options": {
                                                "default": 1800
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "LanguageType.E",
                                            "name": "language_type",
                                            "id": 9,
                                            "options": {
                                                "default": "ANSWER"
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "locale",
                                            "id": 30,
                                            "options": {
                                                "default": "en_US.utf8"
                                            }
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "FeatureFlag.E",
                                            "name": "flag",
                                            "id": 10
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "include_objects",
                                            "id": 11,
                                            "options": {
                                                "default": true
                                            }
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "RecognizedToken",
                                            "name": "input_token",
                                            "id": 12
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "IncrementalRequest",
                                            "name": "incremental_request",
                                            "id": 26
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "currently_edited_token",
                                            "id": 13,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "cursor_offset_in_token",
                                            "id": 14,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "DataScope",
                                            "name": "data_scope",
                                            "id": 15
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "QueryTransform",
                                            "name": "transform",
                                            "id": 16
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "completions_with_keywords",
                                            "id": 17,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "exact_match_only",
                                            "id": 18
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "end_index_for_exact_match",
                                            "id": 28,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "single_token_completions_only",
                                            "id": 19,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "max_join_paths",
                                            "id": 20,
                                            "options": {
                                                "default": 100
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "max_completions",
                                            "id": 21,
                                            "options": {
                                                "default": 10
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "object_search_max_results",
                                            "id": 29,
                                            "options": {
                                                "default": 10
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "delete_invalid_phrases",
                                            "id": 22
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "context_query_root",
                                            "id": 23
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "ACTokenDisambiguation",
                                            "name": "token_disambiguation",
                                            "id": 24
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "UserFeedback",
                                            "name": "user_feedback",
                                            "id": 27
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.CompletionRequest",
                                                    "name": "rpc_id",
                                                    "id": 1145
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "CompletionResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCollection",
                                            "name": "error",
                                            "id": 26
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "server_latency_in_ms",
                                            "id": 5
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "int32",
                                            "name": "latency_break_up",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "response_call_id",
                                            "id": 7
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "incident_id",
                                            "id": 8
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Object",
                                            "name": "object_result",
                                            "id": 10
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "ColumnMetadata",
                                            "name": "column_metadata",
                                            "id": 11
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "RecognizedToken",
                                            "name": "new_token",
                                            "id": 12
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Completion",
                                            "name": "language_completion",
                                            "id": 13
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Completion",
                                            "name": "data_completion",
                                            "id": 14
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "QueryCompletion",
                                            "name": "query_completion",
                                            "id": 15
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Completion",
                                            "name": "formula_completion",
                                            "id": 16
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "completion_position",
                                            "id": 17
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "unique_completion_used_for_query",
                                            "id": 18,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "RecognizedToken",
                                            "name": "formula_ghost",
                                            "id": 19
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "PhraseDefinition",
                                            "name": "phrase",
                                            "id": 20
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "JoinPathCollection",
                                            "name": "join_path_ambiguity",
                                            "id": 22
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "accessible_table",
                                            "id": 23
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SageProgram",
                                            "name": "query",
                                            "id": 24
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SageExpression",
                                            "name": "expression",
                                            "id": 25
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "deprecated_error",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "deprecated_error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "deprecated_error_message_position",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "deprecated_error_span",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ErrorSeverity.E",
                                            "name": "deprecated_severity",
                                            "id": 9
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bytes",
                                            "name": "deprecated_query",
                                            "id": 21,
                                            "options": {
                                                "deprecated": true
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "TokenEditOp",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "INSERT",
                                                    "id": 0
                                                },
                                                {
                                                    "name": "DELETE",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "REPLACE",
                                                    "id": 2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "TokenEdit",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "TokenEditOp.E",
                                            "name": "op",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "RecognizedToken",
                                            "name": "token",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "start_offset",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "end_offset",
                                            "id": 4
                                        }
                                    ]
                                },
                                {
                                    "name": "IncrementalRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "prev_response_incident_id",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "TokenEdit",
                                            "name": "edit",
                                            "id": 2
                                        }
                                    ]
                                },
                                {
                                    "name": "ACColumn",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "header",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "table",
                                            "id": 2
                                        }
                                    ]
                                },
                                {
                                    "name": "ACFormula",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "header",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACFormulaError",
                                            "name": "error",
                                            "id": 2
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "RecognizedToken",
                                            "name": "token",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "falcon.DataType.E",
                                            "name": "data_type",
                                            "id": 5,
                                            "options": {
                                                "default": "UNKNOWN"
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "AggregationType.E",
                                            "name": "aggregation_type",
                                            "id": 6,
                                            "options": {
                                                "default": "NONE"
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ColumnType.E",
                                            "name": "column_type",
                                            "id": 7,
                                            "options": {
                                                "default": "UNKNOWN"
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "is_auto_generated",
                                            "id": 8,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SageExpression",
                                            "name": "expression",
                                            "id": 9
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACVersion.E",
                                            "name": "version",
                                            "id": 10,
                                            "options": {
                                                "default": "PRE_4_3"
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bytes",
                                            "name": "deprecated_expression",
                                            "id": 3
                                        }
                                    ]
                                },
                                {
                                    "name": "PhraseDefinition",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "PhraseType.E",
                                            "name": "phrase_type",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "start_index",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "num_tokens",
                                            "id": 3,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "is_complete_phrase",
                                            "id": 4,
                                            "options": {
                                                "default": true
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "FormattedTokens",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "RecognizedToken",
                                            "name": "token",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "PhraseDefinition",
                                            "name": "phrase",
                                            "id": 2
                                        }
                                    ]
                                },
                                {
                                    "name": "ACTable",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "header",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCollection",
                                            "name": "error",
                                            "id": 9
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "FormattedTokens",
                                            "name": "formatted",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "EntityHeader",
                                            "name": "column",
                                            "id": 5
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "hash_key",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SageProgram",
                                            "name": "query",
                                            "id": 7
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SageExpression",
                                            "name": "expression",
                                            "id": 8
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "EntityHeader",
                                            "name": "unmapped_column",
                                            "id": 10
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACVersion.E",
                                            "name": "version",
                                            "id": 11,
                                            "options": {
                                                "default": "PRE_4_3"
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bytes",
                                            "name": "deprecated_query",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTableError",
                                            "name": "deprecated_error",
                                            "id": 2
                                        }
                                    ]
                                },
                                {
                                    "name": "ACJoin",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "header",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACJoinError",
                                            "name": "error",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "left",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "right",
                                            "id": 4
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "EntityHeader",
                                            "name": "left_column",
                                            "id": 5
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "EntityHeader",
                                            "name": "right_column",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACVersion.E",
                                            "name": "version",
                                            "id": 7,
                                            "options": {
                                                "default": "PRE_4_3"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "ValueList",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "falcon.ConstantValue",
                                            "name": "value",
                                            "id": 1
                                        }
                                    ]
                                },
                                {
                                    "name": "PivotColumn",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ValueList",
                                            "name": "values",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "output_guid",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "formula_guid",
                                            "id": 3
                                        }
                                    ]
                                },
                                {
                                    "name": "PivotGroup",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "measure_output_guid",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "AggregationType.E",
                                            "name": "aggregation",
                                            "id": 2
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "PivotColumn",
                                            "name": "columns",
                                            "id": 3
                                        }
                                    ]
                                },
                                {
                                    "name": "PivotContext",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "attribute_output_guids",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "PivotGroup",
                                            "name": "pivot_groups",
                                            "id": 2
                                        }
                                    ]
                                },
                                {
                                    "name": "ACVersion",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "PRE_4_3",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "V_4_3",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "MAX_VERSION",
                                                    "id": 2
                                                }
                                            ],
                                            "options": {
                                                "allow_alias": true
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "ACContext",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "ACTable",
                                            "name": "table",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "ACJoin",
                                            "name": "join",
                                            "id": 2
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "ACFormula",
                                            "name": "formula",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "ACTokenDisambiguation",
                                            "name": "token_disambiguation",
                                            "id": 4
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "EntityHeader",
                                            "name": "header_def",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "Version",
                                            "name": "version",
                                            "id": 7,
                                            "options": {
                                                "default": "V1"
                                            }
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "PivotContext",
                                            "name": "pivot_contexts",
                                            "id": 5
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACVersion.E",
                                            "name": "v",
                                            "id": 8,
                                            "options": {
                                                "default": "PRE_4_3"
                                            }
                                        }
                                    ],
                                    "enums": [
                                        {
                                            "name": "Version",
                                            "values": [
                                                {
                                                    "name": "V1",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "V2",
                                                    "id": 2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "ACTableRequest",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "RecognizedToken",
                                            "name": "input_token",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "IncrementalRequest",
                                            "name": "incremental_request",
                                            "id": 10
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "currently_edited_token",
                                            "id": 2,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "cursor_offset_in_token",
                                            "id": 3,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "DataScope",
                                            "name": "data_scope",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "completions_with_keywords",
                                            "id": 5,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "exact_match_only",
                                            "id": 6,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "end_index_for_exact_match",
                                            "id": 13,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "single_token_completions_only",
                                            "id": 7,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "max_join_paths",
                                            "id": 8,
                                            "options": {
                                                "default": 100
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "max_completions",
                                            "id": 9,
                                            "options": {
                                                "default": 10
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "object_search_max_results",
                                            "id": 15,
                                            "options": {
                                                "default": 10
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "is_row_security_formula",
                                            "id": 11,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "context_query_root",
                                            "id": 12
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "attribute_completions_only",
                                            "id": 14
                                        }
                                    ]
                                },
                                {
                                    "name": "ACTableResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "EntityHeader",
                                            "name": "header",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "RecognizedToken",
                                            "name": "new_token",
                                            "id": 2
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Completion",
                                            "name": "language_completion",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Completion",
                                            "name": "data_completion",
                                            "id": 4
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "QueryCompletion",
                                            "name": "query_completion",
                                            "id": 5
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Completion",
                                            "name": "formula_completion",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "completion_position",
                                            "id": 7,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "unique_completion_used_for_query",
                                            "id": 8,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "RecognizedToken",
                                            "name": "formula_ghost",
                                            "id": 9
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "PhraseDefinition",
                                            "name": "phrase",
                                            "id": 10
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "JoinPathCollection",
                                            "name": "join_path_ambiguity",
                                            "id": 11
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "accessible_table",
                                            "id": 12
                                        }
                                    ]
                                },
                                {
                                    "name": "ACJoinRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACJoin",
                                            "name": "join",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "left_idx",
                                            "id": 2,
                                            "options": {
                                                "default": -1
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "right_idx",
                                            "id": 3,
                                            "options": {
                                                "default": -1
                                            }
                                        }
                                    ]
                                },
                                {
                                    "name": "ACJoinResponse",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "ACColumn",
                                            "name": "completion",
                                            "id": 1
                                        }
                                    ]
                                },
                                {
                                    "name": "UserRating",
                                    "fields": [],
                                    "enums": [
                                        {
                                            "name": "E",
                                            "values": [
                                                {
                                                    "name": "UNKNOWN",
                                                    "id": 0
                                                },
                                                {
                                                    "name": "GOOD",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "BAD",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "UGLY",
                                                    "id": 3
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "UserFeedback",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "UserRating.E",
                                            "name": "user_rating",
                                            "id": 1,
                                            "options": {
                                                "default": "UNKNOWN"
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "description",
                                            "id": 2
                                        }
                                    ]
                                },
                                {
                                    "name": "ACRequestInfo",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "AuthToken",
                                            "name": "auth_token",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "query_stream_id",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "request_call_id",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "incident_id",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int64",
                                            "name": "client_timestamp_ms",
                                            "id": 5
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "time_budget_ms",
                                            "id": 6,
                                            "options": {
                                                "default": 1800
                                            }
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "FeatureFlag.E",
                                            "name": "flag",
                                            "id": 7
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "delete_invalid_phrases",
                                            "id": 8,
                                            "options": {
                                                "default": false
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "UserFeedback",
                                            "name": "user_feedback",
                                            "id": 10
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "locale",
                                            "id": 11,
                                            "options": {
                                                "default": "en_US.utf8"
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "is_answer_page",
                                            "id": 12
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "worksheet_guid",
                                            "id": 9
                                        }
                                    ]
                                },
                                {
                                    "name": "ACResponseInfo",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "response_call_id",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "incident_id",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "server_latency_ms",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "int32",
                                            "name": "latency_break_up",
                                            "id": 4
                                        }
                                    ]
                                },
                                {
                                    "name": "Error",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2,
                                            "options": {
                                                "default": ""
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ErrorSeverity.E",
                                            "name": "severity",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "error_message_position",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "error_span",
                                            "id": 5
                                        }
                                    ]
                                },
                                {
                                    "name": "ErrorCollection",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "Error",
                                            "name": "error",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Error",
                                            "name": "error_detail",
                                            "id": 2
                                        }
                                    ]
                                },
                                {
                                    "name": "ACJoinError",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        }
                                    ]
                                },
                                {
                                    "name": "ACFormulaError",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        }
                                    ]
                                },
                                {
                                    "name": "ValidateContextRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.ValidateContextRequest",
                                                    "name": "rpc_id",
                                                    "id": 1129
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "ValidateContextResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 4
                                        }
                                    ]
                                },
                                {
                                    "name": "CleanupContextRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.CleanupContextRequest",
                                                    "name": "rpc_id",
                                                    "id": 1130
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "CleanupContextResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 4
                                        }
                                    ]
                                },
                                {
                                    "name": "RefreshGuidsRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.RefreshGuidsRequest",
                                                    "name": "rpc_id",
                                                    "id": 1131
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "RefreshGuidsResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 4
                                        }
                                    ]
                                },
                                {
                                    "name": "GetDataScopeRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "AuthToken",
                                            "name": "auth_token",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "last_seen_version",
                                            "id": 2
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.GetDataScopeRequest",
                                                    "name": "rpc_id",
                                                    "id": 1144
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "GetDataScopeResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "DataScopeTable",
                                            "name": "table",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "version",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bool",
                                            "name": "building_index",
                                            "id": 5
                                        }
                                    ]
                                },
                                {
                                    "name": "GetAccessibleTablesRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "idx",
                                            "id": 3
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.GetAccessibleTablesRequest",
                                                    "name": "rpc_id",
                                                    "id": 1164
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "GetAccessibleTablesResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "string",
                                            "name": "table",
                                            "id": 4
                                        }
                                    ]
                                },
                                {
                                    "name": "PingRequest",
                                    "fields": [],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.PingRequest",
                                                    "name": "rpc_id",
                                                    "id": 1146
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "PingResponse",
                                    "fields": []
                                },
                                {
                                    "name": "GetMetadataStatusRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.GetMetadataStatusRequest",
                                                    "name": "rpc_id",
                                                    "id": 1218
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "MetadataStatus",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "int64",
                                            "name": "version",
                                            "id": 1
                                        }
                                    ]
                                },
                                {
                                    "name": "GetMetadataStatusResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "MetadataStatus",
                                            "name": "metadata_status",
                                            "id": 4
                                        }
                                    ]
                                },
                                {
                                    "name": "AddTableRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTableRequest",
                                            "name": "table",
                                            "id": 3
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.AddTableRequest",
                                                    "name": "rpc_id",
                                                    "id": 1132
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "EditTableRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "idx",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTableRequest",
                                            "name": "table",
                                            "id": 4
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.EditTableRequest",
                                                    "name": "rpc_id",
                                                    "id": 1133
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "DeleteTableRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "idx",
                                            "id": 3
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.DeleteTableRequest",
                                                    "name": "rpc_id",
                                                    "id": 1134
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "TransformTableRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "idx",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "QueryTransform",
                                            "name": "transform",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "DataScope",
                                            "name": "data_scope",
                                            "id": 5
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.TransformTableRequest",
                                                    "name": "rpc_id",
                                                    "id": 1135
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "SaveFormulaRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACFormula",
                                            "name": "formula",
                                            "id": 3
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.SaveFormulaRequest",
                                                    "name": "rpc_id",
                                                    "id": 1136
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "RemoveFormulaRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACFormula",
                                            "name": "formula",
                                            "id": 3
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.RemoveFormulaRequest",
                                                    "name": "rpc_id",
                                                    "id": 1137
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "AddTableFilterRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACFormula",
                                            "name": "filter_defn",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "table_guid",
                                            "id": 3
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.AddTableFilterRequest",
                                                    "name": "rpc_id",
                                                    "id": 1147
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "UpdateTableFilterRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACFormula",
                                            "name": "filter_defn",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "RecognizedToken",
                                            "name": "table_filter",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "table_guid",
                                            "id": 4
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.UpdateTableFilterRequest",
                                                    "name": "rpc_id",
                                                    "id": 1148
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "AnswerResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTableResponse",
                                            "name": "resp",
                                            "id": 5
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Object",
                                            "name": "object_result",
                                            "id": 6
                                        }
                                    ]
                                },
                                {
                                    "name": "TableFilterResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "RecognizedToken",
                                            "name": "added_filter",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "bytes",
                                            "name": "deprecated_filter_expression",
                                            "id": 5,
                                            "options": {
                                                "deprecated": true
                                            }
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "JoinPathCollection",
                                            "name": "join_path_ambiguity",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SageExpression",
                                            "name": "filter_expression",
                                            "id": 7
                                        }
                                    ]
                                },
                                {
                                    "name": "UpdateWorksheetRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTableRequest",
                                            "name": "worksheet",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 3
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.UpdateWorksheetRequest",
                                                    "name": "rpc_id",
                                                    "id": 1138
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "TransformWorksheetRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "QueryTransform",
                                            "name": "transform",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "DataScope",
                                            "name": "data_scope",
                                            "id": 4
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.TransformWorksheetRequest",
                                                    "name": "rpc_id",
                                                    "id": 1139
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "WorksheetResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTableResponse",
                                            "name": "resp",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 5
                                        }
                                    ]
                                },
                                {
                                    "name": "UpdateFormulaRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTableRequest",
                                            "name": "table",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "formula_id",
                                            "id": 4
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.UpdateFormulaRequest",
                                                    "name": "rpc_id",
                                                    "id": 1140
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "FormulaResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTable",
                                            "name": "table",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTableResponse",
                                            "name": "resp",
                                            "id": 5
                                        }
                                    ]
                                },
                                {
                                    "name": "AddJoinRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACJoinRequest",
                                            "name": "join",
                                            "id": 3
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.AddJoinRequest",
                                                    "name": "rpc_id",
                                                    "id": 1141
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "EditJoinRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "idx",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACJoinRequest",
                                            "name": "join",
                                            "id": 4
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.EditJoinRequest",
                                                    "name": "rpc_id",
                                                    "id": 1142
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "DeleteJoinRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "idx",
                                            "id": 3
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.DeleteJoinRequest",
                                                    "name": "rpc_id",
                                                    "id": 1143
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "JoinResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACJoinResponse",
                                            "name": "resp",
                                            "id": 5
                                        }
                                    ]
                                },
                                {
                                    "name": "GetJoinTablesRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTable",
                                            "name": "source_table",
                                            "id": 3
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.GetJoinTablesRequest",
                                                    "name": "rpc_id",
                                                    "id": 1195
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "ColumnPair",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "source_column",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "target_column",
                                            "id": 2
                                        }
                                    ]
                                },
                                {
                                    "name": "GetJoinTablesResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "JoinTable",
                                            "name": "join_tables",
                                            "id": 4
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "name": "JoinTable",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "table",
                                                    "id": 1
                                                },
                                                {
                                                    "rule": "repeated",
                                                    "type": "ColumnPair",
                                                    "name": "join_columns",
                                                    "id": 2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "GetJoinColumnsRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTable",
                                            "name": "source_table",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACTable",
                                            "name": "target_table",
                                            "id": 4
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.GetJoinColumnsRequest",
                                                    "name": "rpc_id",
                                                    "id": 1194
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "GetJoinColumnsResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "ColumnPair",
                                            "name": "join_columns",
                                            "id": 4
                                        }
                                    ]
                                },
                                {
                                    "name": "UpgradeContextRequest",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ACRequestInfo",
                                            "name": "info",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 2
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.UpgradeContextRequest",
                                                    "name": "rpc_id",
                                                    "id": 1205
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "UpgradeContextResponse",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACResponseInfo",
                                            "name": "info",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ACContext",
                                            "name": "context",
                                            "id": 4
                                        }
                                    ]
                                },
                                {
                                    "name": "Request",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "Type",
                                            "name": "type",
                                            "id": 21
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ValidateContextRequest",
                                            "name": "validate_context",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "CleanupContextRequest",
                                            "name": "cleanup_context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "RefreshGuidsRequest",
                                            "name": "refresh_guids",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "GetDataScopeRequest",
                                            "name": "get_data_scope",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "PingRequest",
                                            "name": "ping",
                                            "id": 5
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "AddTableRequest",
                                            "name": "add_table",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "EditTableRequest",
                                            "name": "edit_table",
                                            "id": 7
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "DeleteTableRequest",
                                            "name": "delete_table",
                                            "id": 8
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "TransformTableRequest",
                                            "name": "transform_table",
                                            "id": 9
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "SaveFormulaRequest",
                                            "name": "save_formula",
                                            "id": 10
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "RemoveFormulaRequest",
                                            "name": "remove_table",
                                            "id": 11
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "AddTableFilterRequest",
                                            "name": "add_table_filter",
                                            "id": 12
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "UpdateTableFilterRequest",
                                            "name": "update_table_filter",
                                            "id": 13
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "UpdateWorksheetRequest",
                                            "name": "update_worksheet",
                                            "id": 14
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "TransformWorksheetRequest",
                                            "name": "transform_worksheet",
                                            "id": 15
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "UpdateFormulaRequest",
                                            "name": "update_formula",
                                            "id": 16
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "RemoveFormulaRequest",
                                            "name": "remove_formula",
                                            "id": 17
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "AddJoinRequest",
                                            "name": "add_join",
                                            "id": 18
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "EditJoinRequest",
                                            "name": "edit_join",
                                            "id": 19
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "DeleteJoinRequest",
                                            "name": "delete_join",
                                            "id": 20
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "GetAccessibleTablesRequest",
                                            "name": "get_accessible_tables",
                                            "id": 22
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "GetJoinColumnsRequest",
                                            "name": "get_join_columns",
                                            "id": 23
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "GetJoinTablesRequest",
                                            "name": "get_join_tables",
                                            "id": 24
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "UpgradeContextRequest",
                                            "name": "upgrade_context",
                                            "id": 25
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "GetMetadataStatusRequest",
                                            "name": "get_metadata_status",
                                            "id": 26
                                        }
                                    ],
                                    "enums": [
                                        {
                                            "name": "Type",
                                            "values": [
                                                {
                                                    "name": "ADD_TABLE",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "EDIT_TABLE",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "DELETE_TABLE",
                                                    "id": 3
                                                },
                                                {
                                                    "name": "TRANSFORM_TABLE",
                                                    "id": 4
                                                },
                                                {
                                                    "name": "UPDATE_WORKSHEET",
                                                    "id": 5
                                                },
                                                {
                                                    "name": "TRANSFORM_WORKSHEET",
                                                    "id": 6
                                                },
                                                {
                                                    "name": "UPDATE_FORMULA",
                                                    "id": 7
                                                },
                                                {
                                                    "name": "SAVE_FORMULA",
                                                    "id": 8
                                                },
                                                {
                                                    "name": "REMOVE_FORMULA",
                                                    "id": 9
                                                },
                                                {
                                                    "name": "ADD_JOIN",
                                                    "id": 10
                                                },
                                                {
                                                    "name": "EDIT_JOIN",
                                                    "id": 11
                                                },
                                                {
                                                    "name": "DELETE_JOIN",
                                                    "id": 12
                                                },
                                                {
                                                    "name": "ADD_TABLE_FILTER",
                                                    "id": 13
                                                },
                                                {
                                                    "name": "UPDATE_TABLE_FILTER",
                                                    "id": 14
                                                },
                                                {
                                                    "name": "VALIDATE_CONTEXT",
                                                    "id": 15
                                                },
                                                {
                                                    "name": "CLEANUP_CONTEXT",
                                                    "id": 16
                                                },
                                                {
                                                    "name": "REFRESH_GUIDS",
                                                    "id": 17
                                                },
                                                {
                                                    "name": "GET_DATA_SCOPE",
                                                    "id": 18
                                                },
                                                {
                                                    "name": "COMPLETE",
                                                    "id": 19
                                                },
                                                {
                                                    "name": "PING",
                                                    "id": 20
                                                },
                                                {
                                                    "name": "GET_ACCESSIBLE_TABLES",
                                                    "id": 21
                                                },
                                                {
                                                    "name": "GET_JOIN_COLUMNS",
                                                    "id": 22
                                                },
                                                {
                                                    "name": "GET_JOIN_TABLES",
                                                    "id": 23
                                                },
                                                {
                                                    "name": "UPGRADE_CONTEXT",
                                                    "id": 24
                                                },
                                                {
                                                    "name": "GET_METADATA_STATUS",
                                                    "id": 25
                                                },
                                                {
                                                    "name": "NUM_TYPES",
                                                    "id": 26
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "Response",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ValidateContextResponse",
                                            "name": "validate_context",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "CleanupContextResponse",
                                            "name": "cleanup_context",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "RefreshGuidsResponse",
                                            "name": "refresh_guids",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "GetDataScopeResponse",
                                            "name": "get_data_scope",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "PingResponse",
                                            "name": "ping",
                                            "id": 5
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "AnswerResponse",
                                            "name": "answer",
                                            "id": 6
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "TableFilterResponse",
                                            "name": "table_filter",
                                            "id": 7
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "WorksheetResponse",
                                            "name": "worksheet",
                                            "id": 8
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "FormulaResponse",
                                            "name": "formula",
                                            "id": 9
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "JoinResponse",
                                            "name": "join",
                                            "id": 10
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "GetAccessibleTablesResponse",
                                            "name": "get_accessible_tables",
                                            "id": 11
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "GetJoinColumnsResponse",
                                            "name": "get_join_columns",
                                            "id": 12
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "GetJoinTablesResponse",
                                            "name": "get_join_tables",
                                            "id": 13
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "UpgradeContextResponse",
                                            "name": "upgrade_context",
                                            "id": 14
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "GetMetadataStatusResponse",
                                            "name": "get_metadata_status",
                                            "id": 15
                                        }
                                    ]
                                },
                                {
                                    "name": "BatchRequest",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "Request",
                                            "name": "request",
                                            "id": 1
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "ref": "common.RpcBlog",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "sage.auto_complete.v2.BatchRequest",
                                                    "name": "rpc_id",
                                                    "id": 1161
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "name": "BatchResponse",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "Response",
                                            "name": "response",
                                            "id": 1
                                        }
                                    ]
                                },
                                {
                                    "name": "ACTableError",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "ErrorCode.E",
                                            "name": "error_code",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "error_message",
                                            "id": 2,
                                            "options": {
                                                "default": ""
                                            }
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "ErrorSeverity.E",
                                            "name": "severity",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "error_message_position",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int32",
                                            "name": "error_span",
                                            "id": 5
                                        }
                                    ]
                                },
                                {
                                    "name": "Object",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "guid",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "HighlightedString",
                                            "name": "name",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "author_guid",
                                            "id": 3
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "HighlightedString",
                                            "name": "author_name",
                                            "id": 4
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "HighlightedString",
                                            "name": "author_display_name",
                                            "id": 12
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "Type",
                                            "name": "type",
                                            "id": 5
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "float",
                                            "name": "score",
                                            "id": 6
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Question",
                                            "name": "question",
                                            "id": 8
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Viz",
                                            "name": "viz",
                                            "id": 10
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "int64",
                                            "name": "modified_epoch_ms",
                                            "id": 11
                                        }
                                    ],
                                    "messages": [
                                        {
                                            "name": "Question",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "HighlightedString",
                                                    "name": "text",
                                                    "id": 1
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "ACContext",
                                                    "name": "ac_context",
                                                    "id": 3
                                                }
                                            ]
                                        },
                                        {
                                            "name": "HighlightedString",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "text",
                                                    "id": 1
                                                },
                                                {
                                                    "rule": "repeated",
                                                    "type": "Highlight",
                                                    "name": "highlight",
                                                    "id": 2
                                                }
                                            ]
                                        },
                                        {
                                            "name": "Highlight",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "int32",
                                                    "name": "start",
                                                    "id": 1
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "int32",
                                                    "name": "size",
                                                    "id": 2
                                                }
                                            ]
                                        },
                                        {
                                            "name": "Viz",
                                            "fields": [
                                                {
                                                    "rule": "optional",
                                                    "type": "string",
                                                    "name": "guid",
                                                    "id": 1
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "HighlightedString",
                                                    "name": "title",
                                                    "id": 2
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "VizType",
                                                    "name": "type",
                                                    "id": 3
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "Question",
                                                    "name": "question",
                                                    "id": 4
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "float",
                                                    "name": "score",
                                                    "id": 5
                                                },
                                                {
                                                    "rule": "optional",
                                                    "type": "int64",
                                                    "name": "modified_epoch_ms",
                                                    "id": 6
                                                }
                                            ]
                                        }
                                    ],
                                    "enums": [
                                        {
                                            "name": "Type",
                                            "values": [
                                                {
                                                    "name": "ANSWER",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "PINBOARD",
                                                    "id": 2
                                                }
                                            ]
                                        },
                                        {
                                            "name": "VizType",
                                            "values": [
                                                {
                                                    "name": "HEADLINE",
                                                    "id": 1
                                                },
                                                {
                                                    "name": "TABLE",
                                                    "id": 2
                                                },
                                                {
                                                    "name": "CHART",
                                                    "id": 3
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "services": [
                {
                    "name": "AutoAwesomeService",
                    "options": {
                        "(net.rpc.RpcOptions.service).thrift.protocol_type": "JSON"
                    },
                    "rpc": {
                        "VisualizationAnalysis": {
                            "request": "VisualizationAnalysisRequest",
                            "response": "VisualizationAnalysisResponse",
                            "options": {}
                        },
                        "DataAnalysis": {
                            "request": "DataAnalysisRequest",
                            "response": "DataAnalysisResponse",
                            "options": {}
                        },
                        "TableAnalysis": {
                            "request": "TableAnalysisRequest",
                            "response": "TableAnalysisResponse",
                            "options": {}
                        },
                        "A3Analysis": {
                            "request": "A3Request",
                            "response": "A3AnalysisStatusResponse",
                            "options": {}
                        },
                        "A3AnalysisStatus": {
                            "request": "A3AnalysisStatusRequest",
                            "response": "A3AnalysisStatusResponse",
                            "options": {}
                        },
                        "A3AnalysisCancel": {
                            "request": "A3AnalysisCancelRequest",
                            "response": "A3AnalysisCancelResponse",
                            "options": {}
                        }
                    }
                }
            ]
        },
        {
            "name": "callosum",
            "fields": [],
            "options": {
                "java_package": "com.thoughtspot.callosum.client",
                "java_outer_classname": "PublicEnum"
            },
            "messages": [
                {
                    "name": "KeyValueProto",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "falcon.ConstantValue",
                            "name": "key",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "falcon.ConstantValue",
                            "name": "value",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "ClientStateProto",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "KeyValueProto",
                            "name": "state",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "ColumnDataTypeEnumProto",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "UNKNOWN",
                                    "id": 0
                                },
                                {
                                    "name": "BOOL",
                                    "id": 1
                                },
                                {
                                    "name": "CHAR",
                                    "id": 2
                                },
                                {
                                    "name": "VARCHAR",
                                    "id": 3
                                },
                                {
                                    "name": "DATE",
                                    "id": 4
                                },
                                {
                                    "name": "DATE_TIME",
                                    "id": 5
                                },
                                {
                                    "name": "TIME",
                                    "id": 6
                                },
                                {
                                    "name": "DATE_NUM",
                                    "id": 7
                                },
                                {
                                    "name": "DATE_NUM_QUARTER_IN_YEAR",
                                    "id": 8
                                },
                                {
                                    "name": "DATE_NUM_MONTH_IN_YEAR",
                                    "id": 9
                                },
                                {
                                    "name": "DATE_NUM_MONTH_IN_QUARTER",
                                    "id": 10
                                },
                                {
                                    "name": "DATE_NUM_WEEK_IN_YEAR",
                                    "id": 11
                                },
                                {
                                    "name": "DATE_NUM_DAY_IN_YEAR",
                                    "id": 12
                                },
                                {
                                    "name": "DATE_NUM_DAY_IN_QUARTER",
                                    "id": 13
                                },
                                {
                                    "name": "DATE_NUM_DAY_IN_MONTH",
                                    "id": 14
                                },
                                {
                                    "name": "DATE_NUM_DAY_OF_WEEK",
                                    "id": 15
                                },
                                {
                                    "name": "DATE_NUM_DAY_OF_WEEK_STR",
                                    "id": 16
                                },
                                {
                                    "name": "DATE_NUM_ABS_YEAR",
                                    "id": 17
                                },
                                {
                                    "name": "DATE_NUM_ABS_QUARTER",
                                    "id": 18
                                },
                                {
                                    "name": "DATE_NUM_ABS_DAY",
                                    "id": 19
                                },
                                {
                                    "name": "DATE_NUM_ABS_MONTH",
                                    "id": 20
                                },
                                {
                                    "name": "DATE_NUM_ABS_HOUR",
                                    "id": 21
                                },
                                {
                                    "name": "DATE_NUM_ABS_WEEK",
                                    "id": 22
                                },
                                {
                                    "name": "DATE_NUM_SEC_IN_DAY",
                                    "id": 23
                                },
                                {
                                    "name": "INT32",
                                    "id": 24
                                },
                                {
                                    "name": "INT64",
                                    "id": 25
                                },
                                {
                                    "name": "FLOAT",
                                    "id": 26
                                },
                                {
                                    "name": "DOUBLE",
                                    "id": 27
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "AggregateFunctionTypeEnumProto",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "NONE",
                                    "id": 0
                                },
                                {
                                    "name": "COUNT",
                                    "id": 1
                                },
                                {
                                    "name": "COUNT_DISTINCT",
                                    "id": 2
                                },
                                {
                                    "name": "SUM",
                                    "id": 3
                                },
                                {
                                    "name": "AVERAGE",
                                    "id": 4
                                },
                                {
                                    "name": "MIN",
                                    "id": 5
                                },
                                {
                                    "name": "MAX",
                                    "id": 6
                                },
                                {
                                    "name": "STD_DEVIATION",
                                    "id": 7
                                },
                                {
                                    "name": "VARIANCE",
                                    "id": 8
                                },
                                {
                                    "name": "GROWTH",
                                    "id": 9
                                },
                                {
                                    "name": "AGGR_DISTINCT",
                                    "id": 10
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "GeoTypeEnumProto",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "NONE",
                                    "id": 0
                                },
                                {
                                    "name": "AREA_CODE",
                                    "id": 1
                                },
                                {
                                    "name": "CBSA_MSA",
                                    "id": 2
                                },
                                {
                                    "name": "CITY",
                                    "id": 3
                                },
                                {
                                    "name": "CONGRESSIONAL_DISTRICT",
                                    "id": 4
                                },
                                {
                                    "name": "COUNTRY_REGION",
                                    "id": 5
                                },
                                {
                                    "name": "COUNTY",
                                    "id": 6
                                },
                                {
                                    "name": "LATITUDE",
                                    "id": 7
                                },
                                {
                                    "name": "LONGITUDE",
                                    "id": 8
                                },
                                {
                                    "name": "STATE_PROVINCE",
                                    "id": 9
                                },
                                {
                                    "name": "ZIP_CODE",
                                    "id": 10
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "GeoConfigProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Type",
                            "name": "type",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "fixedValue",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "columnGuid",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "customFileGuid",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "GeoConfigProto",
                            "name": "parent",
                            "id": 4
                        }
                    ],
                    "enums": [
                        {
                            "name": "Type",
                            "values": [
                                {
                                    "name": "LATITUDE",
                                    "id": 0
                                },
                                {
                                    "name": "LONGITUDE",
                                    "id": 1
                                },
                                {
                                    "name": "ZIP_CODE",
                                    "id": 2
                                },
                                {
                                    "name": "ADMIN_DIV_0",
                                    "id": 3
                                },
                                {
                                    "name": "ADMIN_DIV_1",
                                    "id": 4
                                },
                                {
                                    "name": "ADMIN_DIV_2",
                                    "id": 5
                                },
                                {
                                    "name": "CUSTOM_REGION",
                                    "id": 6
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "LogicalRelationshipJoinTypeEnumProto",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "INNER",
                                    "id": 0
                                },
                                {
                                    "name": "LEFT_OUTER",
                                    "id": 1
                                },
                                {
                                    "name": "RIGHT_OUTER",
                                    "id": 2
                                },
                                {
                                    "name": "OUTER",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "WorksheetTypeEnumProto",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "VIEW",
                                    "id": 0
                                },
                                {
                                    "name": "CONTAINER",
                                    "id": 1
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "LogicalTableTypeEnumProto",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "ONE_TO_ONE_LOGICAL",
                                    "id": 1
                                },
                                {
                                    "name": "WORKSHEET",
                                    "id": 2
                                },
                                {
                                    "name": "PRIVATE_WORKSHEET",
                                    "id": 3
                                },
                                {
                                    "name": "USER_DEFINED",
                                    "id": 4
                                },
                                {
                                    "name": "DB_VIEW",
                                    "id": 5
                                },
                                {
                                    "name": "AGGR_WORKSHEET",
                                    "id": 6
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "MetadataHeaderProto",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "string",
                            "name": "id_guid",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "description",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "author_guid",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "author_name",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "author_display_name",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "created",
                            "id": 7
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "modified",
                            "id": 8
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "modified_by",
                            "id": 9
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "generation_num",
                            "id": 10
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "owner_guid",
                            "id": 11
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "deleted",
                            "id": 12
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "hidden",
                            "id": 13
                        },
                        {
                            "rule": "optional",
                            "type": "ClientStateProto",
                            "name": "client_state",
                            "id": 14
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "database_stripe",
                            "id": 15
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "schema_stripe",
                            "id": 16
                        },
                        {
                            "rule": "repeated",
                            "type": "MetadataHeaderProto",
                            "name": "tag",
                            "id": 17
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "type",
                            "id": 18
                        }
                    ]
                },
                {
                    "name": "MetricDefinitionProto",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "Row",
                            "name": "row",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 2
                        }
                    ],
                    "messages": [
                        {
                            "name": "Range",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "double",
                                    "name": "min",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "double",
                                    "name": "max",
                                    "id": 2
                                }
                            ]
                        },
                        {
                            "name": "Row",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "Range",
                                    "name": "range",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "color",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "icon_path",
                                    "id": 3
                                },
                                {
                                    "rule": "optional",
                                    "type": "Action",
                                    "name": "action",
                                    "id": 4
                                }
                            ]
                        }
                    ],
                    "enums": [
                        {
                            "name": "Action",
                            "values": [
                                {
                                    "name": "NONE",
                                    "id": 0
                                },
                                {
                                    "name": "ALERT",
                                    "id": 1
                                },
                                {
                                    "name": "EMAIL",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ExpressionProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 1
                        },
                        {
                            "rule": "required",
                            "type": "string",
                            "name": "id",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "ColumnType",
                            "name": "column_type",
                            "id": 3,
                            "options": {
                                "default": "NONE"
                            }
                        },
                        {
                            "rule": "repeated",
                            "type": "falcon.ConstantValue",
                            "name": "value",
                            "id": 5
                        },
                        {
                            "rule": "repeated",
                            "type": "ExpressionProto",
                            "name": "child",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "falcon.AggregateOp.E",
                            "name": "aggregation",
                            "id": 7
                        },
                        {
                            "rule": "optional",
                            "type": "falcon.ExpressionOp.E",
                            "name": "operator",
                            "id": 8
                        },
                        {
                            "rule": "repeated",
                            "type": "sage.JoinPathProto",
                            "name": "join_paths",
                            "id": 9
                        }
                    ],
                    "enums": [
                        {
                            "name": "ColumnType",
                            "values": [
                                {
                                    "name": "NONE",
                                    "id": 0
                                },
                                {
                                    "name": "LOGICAL_COLUMN",
                                    "id": 1
                                },
                                {
                                    "name": "VIZ_COLUMN",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "LogicalColumnProto",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "MetadataHeaderProto",
                            "name": "header",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "LogicalColumnContentProto",
                            "name": "content",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "derived",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "ExpressionProto",
                            "name": "derivation_expression",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "physical_column_guid",
                            "id": 5
                        }
                    ],
                    "messages": [
                        {
                            "name": "LogicalColumnContentProto",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "ColumnDataTypeEnumProto.E",
                                    "name": "data_type",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "ColumnTypeEnumProto",
                                    "name": "type",
                                    "id": 2,
                                    "options": {
                                        "default": "UNKNOWN"
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "AggregateFunctionTypeEnumProto.E",
                                    "name": "default_aggr_type",
                                    "id": 3,
                                    "options": {
                                        "default": "NONE"
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "sage_formula_id",
                                    "id": 4
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "sage_output_column_guid",
                                    "id": 5
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "default_format_pattern",
                                    "id": 6
                                },
                                {
                                    "rule": "optional",
                                    "type": "GeoTypeEnumProto.E",
                                    "name": "geo_type",
                                    "id": 7,
                                    "options": {
                                        "deprecated": true
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "GeoConfigProto",
                                    "name": "geo_config",
                                    "id": 18
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "attribution_dimension",
                                    "id": 8
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "additive",
                                    "id": 9
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "primary_key",
                                    "id": 10
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "foreign_key",
                                    "id": 11
                                },
                                {
                                    "rule": "optional",
                                    "type": "sage.ColumnIndexType.E",
                                    "name": "index_type",
                                    "id": 12
                                },
                                {
                                    "rule": "optional",
                                    "type": "float",
                                    "name": "index_priority",
                                    "id": 13
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "physical_column_name",
                                    "id": 14
                                },
                                {
                                    "rule": "repeated",
                                    "type": "string",
                                    "name": "synonym",
                                    "id": 15
                                },
                                {
                                    "rule": "optional",
                                    "type": "MetricDefinitionProto",
                                    "name": "metric_definition",
                                    "id": 16
                                },
                                {
                                    "rule": "optional",
                                    "type": "sage.EntityCategory.E",
                                    "name": "entity_category",
                                    "id": 17
                                }
                            ]
                        }
                    ],
                    "enums": [
                        {
                            "name": "ColumnTypeEnumProto",
                            "values": [
                                {
                                    "name": "UNKNOWN",
                                    "id": 0
                                },
                                {
                                    "name": "ATTRIBUTE",
                                    "id": 1
                                },
                                {
                                    "name": "MEASURE",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "LogicalTableProto",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "MetadataHeaderProto",
                            "name": "header",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "LogicalTableContentProto",
                            "name": "content",
                            "id": 2
                        },
                        {
                            "rule": "repeated",
                            "type": "LogicalColumnProto",
                            "name": "column",
                            "id": 3
                        },
                        {
                            "rule": "repeated",
                            "type": "LogicalRelationshipProto",
                            "name": "relationship",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "physical_table_guid",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "physical_table_version",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "LogicalTableTypeEnumProto.E",
                            "name": "type",
                            "id": 7,
                            "options": {
                                "default": "ONE_TO_ONE_LOGICAL"
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "data_source_guid",
                            "id": 8
                        }
                    ],
                    "messages": [
                        {
                            "name": "LogicalTableContentProto",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "LogicalRelationshipJoinTypeEnumProto.E",
                                    "name": "join_type",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "physical_table_name",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "WorksheetTypeEnumProto.E",
                                    "name": "worksheet_type",
                                    "id": 3
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "aggregated_worksheet",
                                    "id": 4
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "LogicalRelationshipProto",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "MetadataHeaderProto",
                            "name": "header",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "LogicalRelationshipContentProto",
                            "name": "content",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "source_table_guid",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "destination_table_guid",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "LogicalRelationshipJoinTypeEnumProto.E",
                            "name": "join_type",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "LogicalRelationshipTypeEnumProto",
                            "name": "type",
                            "id": 6
                        }
                    ],
                    "messages": [
                        {
                            "name": "LogicalRelationshipContentProto",
                            "fields": [
                                {
                                    "rule": "repeated",
                                    "type": "SingleColumnLogicalRelationshipProto",
                                    "name": "relationship",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "ExpressionProto",
                                    "name": "generic_join",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "float",
                                    "name": "weight",
                                    "id": 3
                                }
                            ],
                            "messages": [
                                {
                                    "name": "SingleColumnLogicalRelationshipProto",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "source_column_guid",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "destination_column_guid",
                                            "id": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    "enums": [
                        {
                            "name": "LogicalRelationshipTypeEnumProto",
                            "values": [
                                {
                                    "name": "USER_DEFINED",
                                    "id": 1
                                },
                                {
                                    "name": "PK_FK",
                                    "id": 2
                                },
                                {
                                    "name": "GENERIC",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "SchemaViewerProto",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "LogicalTableProto",
                            "name": "table",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "VisualizationColumnProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "LogicalColumnProto",
                            "name": "column",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "sort_ascending",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "sort_index",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "user_sorted",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "AggregateFunctionTypeEnumProto.E",
                            "name": "aggr_type_override",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "format_pattern_override",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "LogicalColumnProto.ColumnTypeEnumProto",
                            "name": "type_override",
                            "id": 7
                        },
                        {
                            "rule": "optional",
                            "type": "ColumnDataTypeEnumProto.E",
                            "name": "data_type_overrde",
                            "id": 8
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "group_by",
                            "id": 9
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "sage_column_id",
                            "id": 10
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "sage_output_column_guid",
                            "id": 11
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "aggr_applied",
                            "id": 12
                        },
                        {
                            "rule": "optional",
                            "type": "MetricDefinitionProto",
                            "name": "metric_definition",
                            "id": 13
                        }
                    ]
                },
                {
                    "name": "VisualizationProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "MetadataHeaderProto",
                            "name": "header",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "title",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "VisualizationTypeEnumProto",
                            "name": "type",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "TableVisualizationContentProto",
                            "name": "table_content",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "ChartVisualizationContentProto",
                            "name": "chart_content",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "description",
                            "id": 6
                        }
                    ],
                    "messages": [
                        {
                            "name": "VisualizationContentProto",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "locked",
                                    "id": 3
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "data_on_demand",
                                    "id": 4
                                }
                            ]
                        },
                        {
                            "name": "TableVisualizationContentProto",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "VisualizationContentProto",
                                    "name": "content",
                                    "id": 1
                                },
                                {
                                    "rule": "repeated",
                                    "type": "VisualizationColumnProto",
                                    "name": "column",
                                    "id": 2
                                }
                            ]
                        },
                        {
                            "name": "ChartVisualizationContentProto",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "VisualizationContentProto",
                                    "name": "content",
                                    "id": 1
                                },
                                {
                                    "rule": "repeated",
                                    "type": "VisualizationColumnProto",
                                    "name": "column",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "AxisConfig",
                                    "name": "axis_config",
                                    "id": 3
                                },
                                {
                                    "rule": "optional",
                                    "type": "ChartTypeEnumProto",
                                    "name": "chart_type",
                                    "id": 4
                                }
                            ],
                            "messages": [
                                {
                                    "name": "Axis",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "guid",
                                            "id": 1
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "string",
                                            "name": "name",
                                            "id": 2
                                        },
                                        {
                                            "rule": "optional",
                                            "type": "MetricDefinitionProto",
                                            "name": "metric_definition",
                                            "id": 3
                                        }
                                    ]
                                },
                                {
                                    "name": "AxisConfig",
                                    "fields": [
                                        {
                                            "rule": "repeated",
                                            "type": "Axis",
                                            "name": "x",
                                            "id": 1
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Axis",
                                            "name": "y",
                                            "id": 2
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Axis",
                                            "name": "legend",
                                            "id": 3
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Axis",
                                            "name": "radial",
                                            "id": 4
                                        },
                                        {
                                            "rule": "repeated",
                                            "type": "Axis",
                                            "name": "color",
                                            "id": 5
                                        }
                                    ]
                                }
                            ],
                            "enums": [
                                {
                                    "name": "ChartTypeEnumProto",
                                    "values": [
                                        {
                                            "name": "NONE",
                                            "id": 1
                                        },
                                        {
                                            "name": "COLUMN",
                                            "id": 2
                                        },
                                        {
                                            "name": "BAR",
                                            "id": 3
                                        },
                                        {
                                            "name": "LINE",
                                            "id": 4
                                        },
                                        {
                                            "name": "PIE",
                                            "id": 5
                                        },
                                        {
                                            "name": "SCATTER",
                                            "id": 6
                                        },
                                        {
                                            "name": "BUBBLE",
                                            "id": 7
                                        },
                                        {
                                            "name": "STACKED_COLUMN",
                                            "id": 8
                                        },
                                        {
                                            "name": "AREA",
                                            "id": 9
                                        },
                                        {
                                            "name": "PARETO",
                                            "id": 10
                                        },
                                        {
                                            "name": "GEO_AREA",
                                            "id": 11
                                        },
                                        {
                                            "name": "GEO_BUBBLE",
                                            "id": 12
                                        },
                                        {
                                            "name": "GEO_HEATMAP",
                                            "id": 13
                                        },
                                        {
                                            "name": "GEO_EARTH_AREA",
                                            "id": 14
                                        },
                                        {
                                            "name": "GEO_EARTH_BUBBLE",
                                            "id": 15
                                        },
                                        {
                                            "name": "GEO_EARTH_BAR",
                                            "id": 16
                                        },
                                        {
                                            "name": "GEO_EARTH_HEATMAP",
                                            "id": 17
                                        },
                                        {
                                            "name": "GEO_EARTH_GRAPH",
                                            "id": 18
                                        },
                                        {
                                            "name": "WATERFALL",
                                            "id": 19
                                        },
                                        {
                                            "name": "TREEMAP",
                                            "id": 20
                                        },
                                        {
                                            "name": "HEATMAP",
                                            "id": 21
                                        },
                                        {
                                            "name": "STACKED_AREA",
                                            "id": 22
                                        },
                                        {
                                            "name": "LINE_COLUMN",
                                            "id": 23
                                        },
                                        {
                                            "name": "FUNNEL",
                                            "id": 24
                                        },
                                        {
                                            "name": "PIVOT_TABLE",
                                            "id": 25
                                        },
                                        {
                                            "name": "LINE_STACKED_COLUMN",
                                            "id": 26
                                        },
                                        {
                                            "name": "SANKEY",
                                            "id": 27
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    "enums": [
                        {
                            "name": "VisualizationTypeEnumProto",
                            "values": [
                                {
                                    "name": "TABLE",
                                    "id": 1
                                },
                                {
                                    "name": "CHART",
                                    "id": 2
                                },
                                {
                                    "name": "HEADLINE",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "VisualizationQueryProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "serialized_sage_program",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "sage.auto_complete.v2.SageProgram",
                            "name": "sage_program",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "VisualizationProto",
                            "name": "visualization",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "sage.auto_complete.v2.ACContext",
                            "name": "context",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "table_index",
                            "id": 5
                        }
                    ]
                },
                {
                    "name": "DataRow",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "falcon.ConstantValue",
                            "name": "data_value",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "VisualizationDataProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "VisualizationColumnProto",
                            "name": "visualization_column",
                            "id": 2
                        },
                        {
                            "rule": "repeated",
                            "type": "DataRow",
                            "name": "data_row",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "double",
                            "name": "sampling_ratio",
                            "id": 4
                        },
                        {
                            "rule": "repeated",
                            "type": "falcon.TableVersionInfo",
                            "name": "bound_version",
                            "id": 5
                        }
                    ]
                },
                {
                    "name": "RequestType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "ANSWER_UNSAVED",
                                    "id": 0
                                },
                                {
                                    "name": "ANSWER_SAVED",
                                    "id": 1
                                },
                                {
                                    "name": "ANSWER_PINBOARD_CONTEXT",
                                    "id": 2
                                },
                                {
                                    "name": "ANSWER_AGGREGATED_WORKSHEET",
                                    "id": 3
                                },
                                {
                                    "name": "ANSWER_UPGRADE",
                                    "id": 4
                                },
                                {
                                    "name": "PINBOARD_VIEW",
                                    "id": 5
                                },
                                {
                                    "name": "PINBOARD_FILTER",
                                    "id": 6
                                },
                                {
                                    "name": "PINBOARD_AD_HOC",
                                    "id": 7
                                },
                                {
                                    "name": "DATA_CHART_CONFIG",
                                    "id": 8
                                },
                                {
                                    "name": "DATA_SHOW_UNDERLYING_ROW",
                                    "id": 9
                                },
                                {
                                    "name": "DATA_EXPORT",
                                    "id": 10
                                },
                                {
                                    "name": "TSPUBLIC_DATA_RUNTIME_FILTER",
                                    "id": 11
                                },
                                {
                                    "name": "ANSWER_AGGREGATED_WORKSHEET_VIEW",
                                    "id": 12
                                },
                                {
                                    "name": "ANSWER_AGGREGATED_WORKSHEET_SAVE",
                                    "id": 13
                                },
                                {
                                    "name": "ANSWER_ADD_NEW_FILTER",
                                    "id": 14
                                },
                                {
                                    "name": "DATA_SHOW_UNDERLYING_VIZ",
                                    "id": 15
                                },
                                {
                                    "name": "UNKNOWN",
                                    "id": 10000
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ClientType",
                    "fields": [],
                    "enums": [
                        {
                            "name": "E",
                            "values": [
                                {
                                    "name": "BLINK",
                                    "id": 0
                                },
                                {
                                    "name": "MOBILE",
                                    "id": 1
                                },
                                {
                                    "name": "FULL_EMBED",
                                    "id": 2
                                },
                                {
                                    "name": "PUBLIC_API_DIRECT",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "PreferenceProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "A3PreferenceProto",
                            "name": "a3",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "name": "NotificationProto",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "notifiy",
                                    "id": 1,
                                    "options": {
                                        "default": true
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "on_success",
                                    "id": 2,
                                    "options": {
                                        "default": true
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "on_failure",
                                    "id": 3,
                                    "options": {
                                        "default": true
                                    }
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "attach_content",
                                    "id": 4,
                                    "options": {
                                        "default": false
                                    }
                                }
                            ]
                        },
                        {
                            "name": "A3PreferenceProto",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "NotificationProto",
                                    "name": "email_notification",
                                    "id": 1
                                },
                                {
                                    "rule": "repeated",
                                    "type": "string",
                                    "name": "exclude_columns",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "exclude_null",
                                    "id": 3,
                                    "options": {
                                        "default": false
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "scheduler",
            "fields": [],
            "options": {
                "java_package": "com.thoughtspot.timely",
                "go_package": "job_manager_interface_pb"
            },
            "messages": [
                {
                    "name": "CronSchedule",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "second",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "minute",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "hour",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "day_of_month",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "month",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "day_of_week",
                            "id": 6
                        }
                    ]
                },
                {
                    "name": "OneTimeSchedule",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "offset",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "PeriodicSchedule",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Type",
                            "name": "type",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "CronSchedule",
                            "name": "cron_schedule",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "start_time",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "end_time",
                            "id": 4
                        }
                    ],
                    "enums": [
                        {
                            "name": "Type",
                            "values": [
                                {
                                    "name": "DEFAULT",
                                    "id": 0
                                },
                                {
                                    "name": "CRON",
                                    "id": 1
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "TimeSchedule",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Periodicity",
                            "name": "periodicity",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "OneTimeSchedule",
                            "name": "one_time_schedule",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "PeriodicSchedule",
                            "name": "periodic_schedule",
                            "id": 3
                        }
                    ],
                    "enums": [
                        {
                            "name": "Periodicity",
                            "values": [
                                {
                                    "name": "DEFAULT",
                                    "id": 0
                                },
                                {
                                    "name": "ONE_TIME",
                                    "id": 1
                                },
                                {
                                    "name": "PERIODIC",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "NodeSchedule",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Type",
                            "name": "schedule",
                            "id": 1
                        }
                    ],
                    "enums": [
                        {
                            "name": "Type",
                            "values": [
                                {
                                    "name": "DEFAULT",
                                    "id": 0
                                },
                                {
                                    "name": "SIZE",
                                    "id": 1
                                },
                                {
                                    "name": "HOST_LIST",
                                    "id": 2
                                },
                                {
                                    "name": "ALL_HOSTS",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ConstantBackoff",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "time",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "ExponentialBackoff",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "offset",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "base",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "max",
                            "id": 3
                        }
                    ]
                },
                {
                    "name": "BackoffPolicy",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Type",
                            "name": "type",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "ConstantBackoff",
                            "name": "constant_backoff",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "ExponentialBackoff",
                            "name": "exponential_backoff",
                            "id": 3
                        }
                    ],
                    "enums": [
                        {
                            "name": "Type",
                            "values": [
                                {
                                    "name": "CONSTANT",
                                    "id": 0
                                },
                                {
                                    "name": "EXPONENTIAL",
                                    "id": 1
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "NumRetriesLimit",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "num_retries",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "TimeDeadlineLimit",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "time_deadline",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "TerminationPolicy",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Type",
                            "name": "type",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "NumRetriesLimit",
                            "name": "num_retries_limit",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "TimeDeadlineLimit",
                            "name": "time_deadline_limit",
                            "id": 3
                        }
                    ],
                    "enums": [
                        {
                            "name": "Type",
                            "values": [
                                {
                                    "name": "NUM_RETRIES",
                                    "id": 0
                                },
                                {
                                    "name": "TIME_DEADLINE",
                                    "id": 1
                                },
                                {
                                    "name": "TILL_SUCCESS",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "RetryPolicy",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "BackoffPolicy",
                            "name": "backoff_policy",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "TerminationPolicy",
                            "name": "termination_policy",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "JobRunStateProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "State",
                            "name": "state",
                            "id": 1
                        }
                    ],
                    "enums": [
                        {
                            "name": "State",
                            "values": [
                                {
                                    "name": "DEFAULT",
                                    "id": 0
                                },
                                {
                                    "name": "RUNNING",
                                    "id": 1
                                },
                                {
                                    "name": "FAILED",
                                    "id": 2
                                },
                                {
                                    "name": "SUCCESS",
                                    "id": 3
                                },
                                {
                                    "name": "DEADLINE",
                                    "id": 4
                                },
                                {
                                    "name": "DOES_NOT_EXIST",
                                    "id": 5
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "JobExitStatusProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "JobRunStateProto",
                            "name": "state",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "common.MessageCode",
                            "name": "message_code",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "detail",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "JobRunProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "run_id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "job_id",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "start_time",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "end_time",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "util.ProgressReportProto",
                            "name": "progress",
                            "id": 5
                        },
                        {
                            "rule": "optional",
                            "type": "JobExitStatusProto",
                            "name": "exit_status",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "JobRunStateProto",
                            "name": "run_state",
                            "id": 7
                        },
                        {
                            "rule": "repeated",
                            "type": "common.KeyValueStr",
                            "name": "key_value_pairs",
                            "id": 8
                        }
                    ]
                },
                {
                    "name": "JobStateProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "State",
                            "name": "state",
                            "id": 1
                        }
                    ],
                    "enums": [
                        {
                            "name": "State",
                            "values": [
                                {
                                    "name": "DEFAULT",
                                    "id": 0
                                },
                                {
                                    "name": "SCHEDULED",
                                    "id": 1
                                },
                                {
                                    "name": "PAUSED",
                                    "id": 2
                                },
                                {
                                    "name": "STOPPED",
                                    "id": 3
                                },
                                {
                                    "name": "CLEANUP",
                                    "id": 4
                                },
                                {
                                    "name": "EXPIRED",
                                    "id": 5
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ScheduledRpcJobProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "easy_address",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "common.KeyValueStr",
                            "name": "key_value_pairs",
                            "id": 3
                        }
                    ]
                },
                {
                    "name": "ScheduledHttpJobProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "http_url",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "easy_address",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "path",
                            "id": 4
                        },
                        {
                            "rule": "repeated",
                            "type": "common.KeyValueStr",
                            "name": "key_value_pairs",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "ScheduledBashJobProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "command",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "JobHandler",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "Handler",
                            "name": "handler",
                            "id": 1
                        }
                    ],
                    "enums": [
                        {
                            "name": "Handler",
                            "values": [
                                {
                                    "name": "NONE",
                                    "id": 0
                                },
                                {
                                    "name": "TEST1",
                                    "id": 3
                                },
                                {
                                    "name": "TEST2",
                                    "id": 4
                                },
                                {
                                    "name": "DEFAULT",
                                    "id": 5
                                },
                                {
                                    "name": "SCHEDULED_REPORT",
                                    "id": 1
                                },
                                {
                                    "name": "DATACONNECT",
                                    "id": 2
                                },
                                {
                                    "name": "A3_GC",
                                    "id": 6
                                },
                                {
                                    "name": "A3_Analysis",
                                    "id": 7
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ScheduledJobProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "TimeSchedule",
                            "name": "schedule",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "NodeSchedule",
                            "name": "node_schedule",
                            "id": 20
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "id",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "description",
                            "id": 5
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "tags",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "creation_time",
                            "id": 7
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "last_modification_time",
                            "id": 8
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "creation_author",
                            "id": 9
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "last_modification_author",
                            "id": 10
                        },
                        {
                            "rule": "optional",
                            "type": "JobStateProto",
                            "name": "current_state",
                            "id": 11
                        },
                        {
                            "rule": "optional",
                            "type": "RetryPolicy",
                            "name": "executor_retry_policy",
                            "id": 12
                        },
                        {
                            "rule": "optional",
                            "type": "RetryPolicy",
                            "name": "scheduler_retry_policy",
                            "id": 13
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "job_run_deadline",
                            "id": 18
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "job_run_status_poll_interval",
                            "id": 19
                        },
                        {
                            "rule": "optional",
                            "type": "Type",
                            "name": "type",
                            "id": 14
                        },
                        {
                            "rule": "optional",
                            "type": "ScheduledBashJobProto",
                            "name": "bash_job",
                            "id": 15
                        },
                        {
                            "rule": "optional",
                            "type": "ScheduledHttpJobProto",
                            "name": "http_job",
                            "id": 16
                        },
                        {
                            "rule": "optional",
                            "type": "ScheduledRpcJobProto",
                            "name": "rpc_job",
                            "id": 17
                        },
                        {
                            "rule": "optional",
                            "type": "JobHandler",
                            "name": "job_handler",
                            "id": 21
                        }
                    ],
                    "enums": [
                        {
                            "name": "Type",
                            "values": [
                                {
                                    "name": "DEFAULT",
                                    "id": 0
                                },
                                {
                                    "name": "BASH",
                                    "id": 1
                                },
                                {
                                    "name": "HTTP",
                                    "id": 2
                                },
                                {
                                    "name": "RPC",
                                    "id": 3
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "AddJobRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "ScheduledJobProto",
                            "name": "job",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "scheduler.AddJobRequest",
                                    "name": "rpc_id",
                                    "id": 1167
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "AddJobResponse",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "job_id",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "DeleteJobRequest",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "job_ids",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "scheduler.DeleteJobRequest",
                                    "name": "rpc_id",
                                    "id": 1168
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "DeleteJobResponse",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "success_ids",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "common.KeyValueStr",
                            "name": "failed_ids",
                            "id": 2
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "not_found_ids",
                            "id": 3
                        }
                    ]
                },
                {
                    "name": "UpdateJobRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "job_id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "ScheduledJobProto",
                            "name": "job",
                            "id": 2
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "scheduler.UpdateJobRequest",
                                    "name": "rpc_id",
                                    "id": 1169
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "UpdateJobResponse",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "ScheduledJobProto",
                            "name": "updated_job",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "PauseJobRequest",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "job_ids",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "scheduler.PauseJobRequest",
                                    "name": "rpc_id",
                                    "id": 1170
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "PauseJobResponse",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "success_ids",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "common.KeyValueStr",
                            "name": "failed_ids",
                            "id": 2
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "not_found_ids",
                            "id": 3
                        }
                    ]
                },
                {
                    "name": "ResumeJobRequest",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "job_ids",
                            "id": 1
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "scheduler.ResumeJobRequest",
                                    "name": "rpc_id",
                                    "id": 1171
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ResumeJobResponse",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "success_ids",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "common.KeyValueStr",
                            "name": "failed_ids",
                            "id": 2
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "not_found_ids",
                            "id": 3
                        }
                    ]
                },
                {
                    "name": "GetJobRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "job_id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "TimeRange",
                            "name": "create_time_range",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "creation_author",
                            "id": 5
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "tags",
                            "id": 6
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "limit",
                            "id": 7
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "sort_ascending",
                            "id": 8
                        },
                        {
                            "rule": "optional",
                            "type": "JobHandler",
                            "name": "job_handler",
                            "id": 9
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "sort_column",
                            "id": 10
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "offset",
                            "id": 11
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "job_name_filter",
                            "id": 12
                        }
                    ],
                    "messages": [
                        {
                            "name": "TimeRange",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "begin",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "end",
                                    "id": 2
                                }
                            ]
                        },
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "scheduler.GetJobRequest",
                                    "name": "rpc_id",
                                    "id": 1172
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "GetJobResponse",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "ScheduledJobProto",
                            "name": "job",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "GetJobsWithRunsRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "GetJobRequest",
                            "name": "get_job_request",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "max_job_runs",
                            "id": 2,
                            "options": {
                                "default": 1
                            }
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "job_runs_offset",
                            "id": 3,
                            "options": {
                                "default": 0
                            }
                        }
                    ],
                    "messages": [
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "scheduler.GetJobRequest",
                                    "name": "rpc_id",
                                    "id": 1215
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "GetJobsWithRunsResponse",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "JobWithRuns",
                            "name": "jobs_with_runs",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "bool",
                            "name": "last_page",
                            "id": 2,
                            "options": {
                                "default": true
                            }
                        }
                    ],
                    "messages": [
                        {
                            "name": "JobWithRuns",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "ScheduledJobProto",
                                    "name": "job",
                                    "id": 1
                                },
                                {
                                    "rule": "repeated",
                                    "type": "JobRunProto",
                                    "name": "job_run",
                                    "id": 2
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "GetJobRunRequest",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "job_id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "run_id",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "TimeRange",
                            "name": "start_time_range",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "limit",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "offset",
                            "id": 5
                        }
                    ],
                    "messages": [
                        {
                            "name": "TimeRange",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "begin",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "end",
                                    "id": 2
                                }
                            ]
                        },
                        {
                            "ref": "common.RpcBlog",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "scheduler.GetJobRequest",
                                    "name": "rpc_id",
                                    "id": 1166
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "GetJobRunResponse",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "JobRunProto",
                            "name": "job_run",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "AbortJobRunRequest",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "job_ids",
                            "id": 1
                        }
                    ]
                },
                {
                    "name": "AbortJobRunResponse",
                    "fields": [
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "success_ids",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "common.KeyValueStr",
                            "name": "failed_ids",
                            "id": 2
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "not_found_ids",
                            "id": 3
                        }
                    ]
                }
            ],
            "services": [
                {
                    "name": "JobManagerService",
                    "options": {
                        "(net.rpc.RpcOptions.service).thrift.framed_transport": false
                    },
                    "rpc": {
                        "AddJob": {
                            "request": "AddJobRequest",
                            "response": "AddJobResponse",
                            "options": {}
                        },
                        "DeleteJob": {
                            "request": "DeleteJobRequest",
                            "response": "DeleteJobResponse",
                            "options": {}
                        },
                        "UpdateJob": {
                            "request": "UpdateJobRequest",
                            "response": "UpdateJobResponse",
                            "options": {}
                        },
                        "PauseJob": {
                            "request": "PauseJobRequest",
                            "response": "PauseJobResponse",
                            "options": {}
                        },
                        "ResumeJob": {
                            "request": "ResumeJobRequest",
                            "response": "ResumeJobResponse",
                            "options": {}
                        },
                        "GetJob": {
                            "request": "GetJobRequest",
                            "response": "GetJobResponse",
                            "options": {}
                        },
                        "GetJobsWithRuns": {
                            "request": "GetJobsWithRunsRequest",
                            "response": "GetJobsWithRunsResponse",
                            "options": {}
                        },
                        "GetJobRun": {
                            "request": "GetJobRunRequest",
                            "response": "GetJobRunResponse",
                            "options": {}
                        },
                        "AbortJobRun": {
                            "request": "AbortJobRunRequest",
                            "response": "AbortJobRunResponse",
                            "options": {}
                        }
                    }
                }
            ]
        },
        {
            "name": "util",
            "fields": [],
            "options": {
                "go_package": "progress_report_pb",
                "java_package": "com.thoughtspot.util"
            },
            "messages": [
                {
                    "name": "ProgressReportProto",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "name",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "Step",
                            "name": "step",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int32",
                            "name": "current_step",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "description",
                            "id": 4
                        }
                    ],
                    "messages": [
                        {
                            "name": "Step",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "int32",
                                    "name": "step_num",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "name",
                                    "id": 2
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "start_time",
                                    "id": 3
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "current_progress",
                                    "id": 4
                                },
                                {
                                    "rule": "optional",
                                    "type": "int64",
                                    "name": "total_work",
                                    "id": 5
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "unit",
                                    "id": 6
                                },
                                {
                                    "rule": "optional",
                                    "type": "string",
                                    "name": "description",
                                    "id": 7
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "blink",
            "fields": [],
            "messages": [
                {
                    "name": "workflow",
                    "fields": [],
                    "messages": [
                        {
                            "name": "UserWorkflowActionType",
                            "fields": [],
                            "enums": [
                                {
                                    "name": "E",
                                    "values": [
                                        {
                                            "name": "PINBOARD_LOAD",
                                            "id": 0
                                        },
                                        {
                                            "name": "NONE",
                                            "id": 10000
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "WorkflowDebugInfo",
                            "fields": [
                                {
                                    "rule": "optional",
                                    "type": "UserWorkflowActionType.E",
                                    "name": "action",
                                    "id": 1
                                },
                                {
                                    "rule": "optional",
                                    "type": "bool",
                                    "name": "user_terminated",
                                    "id": 2
                                }
                            ],
                            "messages": [
                                {
                                    "ref": "net.TraceEvent",
                                    "fields": [
                                        {
                                            "rule": "optional",
                                            "type": "blink.workflow.WorkflowDebugInfo",
                                            "name": "workflow_debug_info",
                                            "id": 1010
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}).build();