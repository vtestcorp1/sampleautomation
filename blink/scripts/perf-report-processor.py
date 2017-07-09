#!/usr/bin/python

import argparse
import csv
import os
from slackclient import SlackClient

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', '--file', dest='in_file', required=True)
    parser.add_argument('-gc', '--change', dest='change_id', required=True)
    parser.add_argument('-gp', '--patch', dest='patch', required=True)
    parser.add_argument('-sc', '--channel', dest='channel', required=True)
    return parser.parse_args()

def parse_as_int(input_str):
    try:
        return int(input_str)
    except ValueError:
        return None

def process_csv_report(in_file, args):
    perf_report_reader = csv.DictReader(in_file, delimiter=',')

    error_rows = []
    for row in perf_report_reader:
        avgRunTime = parse_as_int(row['avgRunTime'])
        lowerBound = parse_as_int(row['lowerBound'])
        upperBound = parse_as_int(row['upperBound'])
        if (lowerBound is not None) and (avgRunTime < lowerBound) or \
            (upperBound is not None) and (avgRunTime > upperBound):
            error_rows.append(row)
    if len(error_rows) > 0:
        out_file = open('/tmp/perf-report-out.csv', 'w')
        field_names = ['suiteName', 'testName', 'bounds', 'actual']
        perf_report_writer = csv.DictWriter(out_file, fieldnames=field_names)
        for row in error_rows:
            suite_name = row['suiteName']
            test_name = row['testName']
            bounds = '[{} - {}]'.format(row['lowerBound'], row['upperBound'])
            actual = row['avgRunTime']
            perf_report_writer.writerow({
                'suiteName': suite_name,
                'testName': test_name,
                'bounds': bounds,
                'actual': actual
            })
        out_file.close()

        out_file = open('/tmp/perf-report-out.csv')
        channel = args.channel
        report_to_slack(out_file, channel)
        out_file.close()

        out_file = open('/tmp/perf-report-out.csv')
        change_id = args.change_id
        patch = args.patch
        content = out_file.read()
        report_to_gerrit(content, change_id, patch)
        out_file.close()

def report_to_gerrit(message, change_id, patch):
    template = 'ssh -p 29418 mothership gerrit review --message \'"{}"\' {},{}'
    command = template.format(message, change_id, patch)
    print command
    os.system(command)

def report_to_slack(post_file, channel):
    slack_bot_token = 'xoxb-168123455943-SsarZZrpfjHijmYPShyNvFYK'
    slack = SlackClient(slack_bot_token)

    slack.api_call('files.upload',
                   channels=channel,
                   filename='300-report',
                   file=post_file)

def main():
    args = parse_args()
    in_file = open(args.in_file, 'rb')
    process_csv_report(in_file, args)
    in_file.close()

if __name__ == "__main__":
    main()
