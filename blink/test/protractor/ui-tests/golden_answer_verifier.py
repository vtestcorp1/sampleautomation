#! /usr/bin/env python

import json
from os import listdir
from os.path import isfile, join
import sys
import subprocess
import datetime

ROUNDING_CONSTANT = 0.0000001

def return_output(command):
    """ this function is used to return the output the command line """
    proc = subprocess.Popen([command], shell=True, \
            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out = proc.communicate()[0]
    return out

def load_json(filename):
    """loads the file into json format """
    try:
        query = json.loads(open(filename, 'r').read())
        return query
    except UnicodeDecodeError:
        return "can't compare strings"

def compare_results(filename, path1, path2):
    """compares the old and new file and returns
    the result and output of the comparison. A
    result value of 1 is a failure """
    full_golden = join(path1, filename)
    full_new = join(path2, filename)
    golden_file = load_json(full_golden)
    new_file = load_json(full_new)
    if golden_file != "can't compare strings" \
                and new_file != "can't compare strings":
        command = \
          "diff -u --ignore-all-space '" + full_golden + "' '" + full_new + "'"
        diffoutput = return_output(command)
        fail_case = [0, 0, 0, 0]
        if golden_file['headlines'] != new_file['headlines']:
            case1 = golden_file['headlines']
            case2 = new_file['headlines']
            if validate_failure(case1, case2, "header", filename):
                fail_case[0] = 1
        if golden_file['answerTitle'] != new_file['answerTitle']:
            fail_case[1] = 1
        if golden_file['tables'][0]['rows'] != new_file['tables'][0]['rows']:
            case1 = golden_file['tables'][0]['rows']
            case2 = new_file['tables'][0]['rows']
            if validate_failure(case1, case2, "rows", filename):
                fail_case[2] = 1
        result, output = format_output(fail_case, filename)
        print output
    else:
        result, output = format_output([0, 0, 0, 1], filename)
        print output
        diffoutput = ""
    outputpath = '../../../../testing/utilities/diff_output.txt'
    now = datetime.datetime.now().strftime("%m/%d/%y-%H:%M:%S")
    diffstring = "\n\n================================================\n" \
                + "\noutput for " + filename + " at " + now + "\n\n" \
                 + "================================================\n\n"
    if result > 0:
        with open(outputpath, 'a') as outfile:
            outfile.write("\n")
            outfile.write(diffstring)
            outfile.write(diffoutput)
    return result, output

def validate_failure(before, after, case, filename):
    """ this function should be implemented to provide a small decimal for
    which slight rounding errors are forgiven, and the two answers are not
    marked as different. Will return True if real failure, false if rounding """
    if case == "header":
        num_heads1 = len(before)
        num_heads2 = len(after)
        curr_bool = True
        if num_heads1 != num_heads2:
            print "differing number of headlines in " + filename
            return True
        for index in range(0, num_heads1):
            name1 = before[index]['name']
            name2 = after[index]['name']
            val_dict1 = before[index]['values'][0]
            val_dict2 = after[index]['values'][0]
            if name1 != name2:
                return True
            elif val_dict1.keys() != val_dict2.keys():
                return True
            curr_bool = compare_headline(val_dict1, val_dict2)
            if curr_bool:
                return curr_bool

        return curr_bool
    elif case == "rows":
        row_bool = True
        num_rows1 = len(before)
        num_rows2 = len(after)
        if num_rows1 != num_rows2:
            return True
        for index in range(0, num_rows1):
            bef, aft = before[index], after[index]
            if bef != aft:
                row_bool = compare_single_row(bef, aft, filename)
                if row_bool:
                    return row_bool
        return row_bool
    return True

def compare_headline(before, after):
    """ helper function for comparison """
    curr_bool = True
    count = 0
    for key in before.keys():
        count += 1
        val1 = before[key]
        val2 = after[key]
        if val1 != val2:
            if is_float(val1) and is_float(val2):
                if abs(float(val1) - float(val2)) < ROUNDING_CONSTANT:
                    curr_bool = False
                else:
                    return True
            else:
                return True
        else:

            curr_bool = False
    return curr_bool



def is_float(string):
    """ checks if string can be converted to float """
    try:
        float(string)
        return True
    except ValueError:
        return False


def compare_single_row(before, after, filename):
    """ helper function for validate_failure to compare at row level """
    num_cols1 = len(before)
    num_cols2 = len(after)
    if num_cols1 != num_cols2:
        print "differing number of columns in " + filename
        return True
    for index in range(0, num_cols1):
        bef = before[index]
        aft = after[index]
        if bef != aft and is_float(bef) and is_float(aft):
            if abs(float(bef) - float(aft)) < ROUNDING_CONSTANT:
                return False
    return True




def format_output(fail_case, filename):
    """helper method to help string together answer names """
    result = 1
    output = "Failure, " + repr(filename.replace(".json", "")) + " failed: "
    fail1 = "incorrect headlines"
    fail2 = "incorrect answer title"
    fail3 = "table results incorrect"
    fail4 = "json object has non-latin characters, cannot be read now"
    fail = [fail1, fail2, fail3, fail4]
    if sum(fail_case) == 0:
        result = 0
        output = repr(filename.replace(".json", "")) + " passed!"
        return result, output
    if sum(fail_case) == 1:
        output = output + fail[fail_case.index(1)]
    elif sum(fail_case) > 1:
        indices = [i for i, x in enumerate(fail_case) if x == 1]
        for index in range(0, len(indices) - 1):
            output = output + fail[indices[index]] + ", "
        output = output + fail[indices[-1]] + "."
    return result, output



def main(argv):
    """grabs the files from the golden area, determines if there
    are any similar files in the new area, then compares them """
    print "\n\n"
    print "********************************************************"
    print "**********     GOLDEN ANSWER TEST RESULTS     **********"
    print "********************************************************"
    print "\n"
    golden_path = '/tsnfs/qa_datasets/golden_check/'
    new_path = '/tmp/'
    new_files = [f for f in listdir(new_path) if isfile(join(new_path, f))]
    total_errors = 0
    output = ''
    missing_files = []
    check_count, total_count = 0, 0
    error_file_list = []
    for files in new_files:
        if files.find(".json") > 1:
            total_count += 1
            if isfile(join(golden_path, files)):
                check_count += 1
                result, output = compare_results(files, golden_path, new_path)
                if result == 1:
                    error_file_list.append(files.replace(".json", ""))
                    total_errors += 1
            else:
                missing_files.append(files.replace(".json", ""))
    if total_errors > 0:
        error_files = ", ".join(repr(e) for e in error_file_list)
        print "\nTotal failed errors = " + str(total_errors)
        print "\nThe following answers had errors: " + error_files
    print "\nTotal number of answers downloaded: " + str(total_count)
    print "\nTotal number of answers checked: " + str(check_count)
    if len(missing_files) > 0:
        print "\nThe following answers were marked with golden_check tag " \
            + "but are missing from the nfs filesystem or are incorrectly" \
            +  " named:\n" + ",\n".join(repr(m) for m in missing_files)
    else:
        print "\nAll answers checked were in the nfs folder"
    return total_errors, output

if __name__ == '__main__':
    main(sys.argv)
