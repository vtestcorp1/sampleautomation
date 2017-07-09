#! /bin/bash

GIT_ROOT=$(git rev-parse --show-toplevel)

pushd $GIT_ROOT

echo 'Loading output data'
./build-out/etl/data_importer_main -date_converted_to_epoch \
                                 --has_header_row \
                                 --target_database "stress_perf_tests" \
                                 --target_table "sparta" \
                                 --alsologtostderr \
                                 --source_file blink/benchmark/benchmark.csv

echo 'Loading debug data'
./build-out/etl/data_importer_main -date_converted_to_epoch \
                                 --has_header_row \
                                 --target_database "stress_perf_tests" \
                                 --target_table "sparta_debug" \
                                 --null_value="" \
                                 --alsologtostderr \
                                 --source_file blink/benchmark/benchmark.dbg.csv


popd
