/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

#include "data_packager.h" // NOLINT

// POSIX only?
#include <dirent.h>
#include <sys/types.h>
#include <limits.h>
#include <sys/stat.h>

#include <unicode/uclean.h>
#include <unicode/ucnv.h>
#include <unicode/locid.h>
#include <unicode/uenum.h>

#ifdef BUILD_PACKAGE_SCRIPT
#include <OptionParser.h>
#else
#include <emscripten/bind.h>
#endif

#include <set>
#include <iostream> // NOLINT
#include <fstream> // NOLINT
#include <sstream>
#include <utility>

#include "util.h" // NOLINT

using std::string;
using std::vector;
using std::cout;
using std::cerr;
using std::set;
using std::ofstream;
using std::ifstream;
using std::ios;
using std::ostringstream;
using std::stringstream;
using std::pair;
using std::endl;

using icu4js::Util;

typedef icu4js::DataPackager DP;

static const int kFilePathSizeBytes = 2;
static const int kFileSizeBytes = 4;

static const char * const kCurrentDirectoryName = ".";
static const char * const kParentDirectoryName = "..";

static const char * const kResourceFileExtension = "res";
static const char * const kConverterFileExtension = "cnv";
static const char * const kDictionaryFileExtension = "dict";
static const char * const kStringPrepFileExtension = "spp";
static const char * const kBoundaryFileExtension = "brk";

static const char * const kSentenceBoundaryFilePrefix = "sent";
static const char * const kWordBoundaryFilePrefix = "word";
static const char * const kLineBoundaryFilePrefix = "line";
static const char * const kTitleBoundaryFilePrefix = "title";
static const char * const kCharBoundaryFilePrefix = "char";

static const char * const kTraditionalResourceFileSuffix = "TRADITIONAL";

static const char kLazyLoadManifestFieldSeparator = ',';
static const char kLazyLoadManifestLineSeparator = '\n';

struct LazyLoadedResource {
    string path;
    DP::ICUOptionalService service;
    string language_code;
    string script_code;
    string country_code;
    string locale_variant;
};

template<typename T>
static bool setHasValue(const set<T>& value_set, const T key) {
    return value_set.find(key) != value_set.end();
}

static vector<string> splitString(string str, char delimiter) {
    vector<string> parts;
    stringstream ss(str);
    string token;

    while (getline(ss, token, delimiter)) {
        parts.push_back(token);
    }

    return parts;
}

static size_t getFilesize(const string& file_path, icu4js::Error& error) {
    error.Reset();

    struct stat st;

    if (stat(file_path.c_str(), &st) != 0) {
        string error_message =
            "Error in getting size of file: "
            + file_path;
        error.Set(icu4js::Error::kErrorFileAccess, error_message);

        return -1;
    }
    return st.st_size;
}


static vector<string> listAllFilesInDirectory(string dir_path,
                                              icu4js::Error& error) {
    vector<string> file_paths;
    error.Reset();

    DIR * dir = opendir(dir_path.c_str());
    if (!dir) {
        string error_message =
            "Failed to open directory: "
            + dir_path;
        error.Set(icu4js::Error::kErrorFileAccess, error_message);

        return file_paths;
    }

    while (TRUE) {
        struct dirent * entry = readdir(dir); // NOLINT
        if (!entry) {
            break;
        }

        const char * entry_name = entry->d_name;

        char path[PATH_MAX];
        int path_length = snprintf(path,
                                   PATH_MAX,
                                   "%s/%s",
                                   dir_path.c_str(),
                                   entry_name);

        if (path_length >= PATH_MAX) {
            string error_message =
                "Path name too long: "
                + std::to_string(path_length) + " "
                + dir_path + " "
                + entry_name;

            error.Set(icu4js::Error::kInvalidICUData, error_message);

            return file_paths;
        }

        if ((entry->d_type & DT_LNK) || (entry->d_type & DT_REG)) {
            file_paths.push_back(path);
            continue;
        }

        if (entry->d_type & DT_DIR) {
            bool is_parent_dir = !strcmp(entry_name, kParentDirectoryName);
            if (is_parent_dir) {
                continue;
            }

            bool is_current_dir = !strcmp(entry_name,
                                          kCurrentDirectoryName);
            if (is_current_dir) {
                continue;
            }

            vector<string> subtree_file_paths
                = listAllFilesInDirectory(path, error);
            if (!error.IsSuccess()) {
                // the error will already be logged
                return file_paths;
            }

            file_paths.insert(file_paths.end(),
                              subtree_file_paths.begin(),
                              subtree_file_paths.end());
        }
    }

    return file_paths;
}

static void initialize(string data_file_path, icu4js::Error& error) { // NOLINT
    error.Reset();
    UErrorCode status = U_ZERO_ERROR;

    u_setDataDirectory(data_file_path.c_str());
    u_init(&status);

    if (!U_SUCCESS(status)) {
        wstring error_message =
            L"ICU initialization failed with code: "
              + Util::StringToWString(u_errorName(status));
        error.Set(icu4js::Error::kInvalidICUData, error_message);
    }
}

static set<string> getAllAvailableLocaleNames(icu4js::Error& error) { // NOLINT
    set<string> all_locale_names;
    error.Reset();

    int32_t num_locales = -1;
    const icu::Locale* available_locales
        = icu::Locale::getAvailableLocales(num_locales);
    if (!num_locales) {
        error.Set(icu4js::Error::kInvalidICUData,
                  "No locales available");
        return all_locale_names;
    }

    for (int i = 0; i < num_locales; ++i) {
        icu::Locale locale = available_locales[i];

        const char* locale_name = locale.getName();
        all_locale_names.insert(locale_name);
    }
    return all_locale_names;
}

static set<string> getAllAvailableCodePageNames(icu4js::Error& error) { // NOLINT
    set<string> all_codepage_names;
    error.Reset();

    UErrorCode status = U_ZERO_ERROR;
    UEnumeration* available_codepages = ucnv_openAllNames(&status);
    if (!U_SUCCESS(status)) {
        string error_message =
            "Failure in getting codepage names, error code: "
            + std::to_string(status);
        error.Set(icu4js::Error::kInvalidICUData, error_message);

        return all_codepage_names;
    }

    status = U_ZERO_ERROR;
    const char *available_codepage;
    while (true) {
        available_codepage = uenum_next(available_codepages,
                                        NULL,
                                        &status);
        if (!available_codepage) {
            break;
        }

        if (!U_SUCCESS(status)) {
            string error_message =
                "Failure in iterating through available"
                "codepages, error code: "
                + std::to_string(status);
            error.Set(icu4js::Error::kInvalidICUData, error_message);

            return all_codepage_names;
        }
        all_codepage_names.insert(available_codepage);
    }

    return all_codepage_names;
}

static set<string> convertCharArrayToStringSet(const char* const* char_array) {
    set<string> string_set;

    do {
        string_set.insert(*char_array);
    } while (*++char_array);

    return string_set;
}


static set<string> getAllAvailableLanguageCodes() {
    const char* const* langs = icu::Locale::getISOLanguages();
    return convertCharArrayToStringSet(langs);
}

static set<string> getAllAvailableCountryCodes() {
    const char* const* country_codes = icu::Locale::getISOCountries();
    return convertCharArrayToStringSet(country_codes);
}

static pair<string, string>
getFileNameAndExtensionFromPath(const string& file_path) {
    size_t last_slash_pos = file_path.rfind("/");

    string file_name;
    if (last_slash_pos != string::npos) {
        file_name = file_path.substr(last_slash_pos + 1);
    } else {
        file_name = file_path;
    }

    size_t last_dot_pos = file_name.rfind(".");
    string extension("");
    if (last_dot_pos != string::npos) {
        extension = file_name.substr(last_dot_pos + 1);
        file_name = file_name.substr(0, last_dot_pos);
    }

    return pair<string, string>(file_name, extension);
}

static void segmentCommonAndLazyLoadFiles(vector<string> all_file_paths,
                                  vector<string>& common_file_paths,
                                  vector<LazyLoadedResource>& lazy_resources,
                                  icu4js::Error& error) {
    common_file_paths.clear();
    lazy_resources.clear();

    set<string> all_available_locale_names = getAllAvailableLocaleNames(error);
    if (!error.IsSuccess()) {
        return;
    }

    set<string> all_available_codepage_names
        = getAllAvailableCodePageNames(error);
    if (!error.IsSuccess()) {
        return;
    }

    set<string> all_language_codes = getAllAvailableLanguageCodes();
    set<string> all_country_codes = getAllAvailableCountryCodes();

    vector<string>::iterator it;
    for (it = all_file_paths.begin(); it != all_file_paths.end(); ++it) {
        string file_path = *it;
        pair<string, string> file_name_and_extension
            = getFileNameAndExtensionFromPath(file_path);

        string file_name = file_name_and_extension.first;
        string file_extension = file_name_and_extension.second;

        if (file_extension == kResourceFileExtension) {
            // resource file with the same name as the locale will be loaded
            // at run time.
            // Note (sunny): there are some locale specific resource files
            // that skip this detection (e.g. sr_Latn_YU, th_TH_TRADITIONAL)
            // but their size seems to be too small to worry about. It's safer
            // to include them in the common package than risk ending up mapping
            // incorrect files to locales.
            icu::Locale locale
                = icu::Locale::createCanonical(file_name.c_str());
            string locale_language_code = locale.getLanguage();
            string locale_country_code = locale.getCountry();

            bool skip = FALSE;
            // numeric country codes represent aggregated/parent
            // countries in CLDR notation (e.g. en_001 is
            // `international english`).
            // Since we don't expect user locales to be these special country
            // codes we need to make sure these resources are part of the common
            // bundle. Locales like en_GB fail to work if en_0001 resources
            // are missing.
            if (!Util::IsStringNumeric(locale_country_code)) {
                skip = setHasValue(all_available_locale_names, file_name)
                    || setHasValue(all_language_codes, file_name)
                    || (setHasValue(all_language_codes, locale_language_code)
                        && setHasValue(all_country_codes, locale_country_code));
            }

            if (skip) {
                lazy_resources.push_back((LazyLoadedResource) {
                    file_path,
                    DP::kServiceNone,
                    locale_language_code,
                    locale.getScript(),
                    locale_country_code,
                    locale.getVariant()
                });
                continue;
            }

        } else if (file_extension == kBoundaryFileExtension) {
            vector<string> file_name_parts = splitString(file_name, '_');

            // locale specific boundary info files are of the type
            // `line_ja.brk`
            if (file_name_parts.size() == 2) {
                string lang_code = file_name_parts[1];
                if (setHasValue(all_language_codes, lang_code)) {
                    lazy_resources.push_back((LazyLoadedResource) {
                        file_path,
                        DP::kServiceBoundaryDetection,
                        lang_code,
                        "",
                        "",
                        ""
                    });
                    continue;
                }
            }

            lazy_resources.push_back((LazyLoadedResource) {
                file_path,
                DP::kServiceBoundaryDetection,
                "",
                "",
                "",
                ""
            });
            continue;

        } else if (file_extension == kConverterFileExtension
                   || file_extension == kDictionaryFileExtension) {
            // Note (sunny): conversion service is not yet supported.
            continue;
        }

        common_file_paths.push_back(file_path);
    }
}

static void createDataPackage(string package_file_path,
                              vector<string>& file_paths_to_package,
                              string& data_files_dir_path,
                              icu4js::Error& error) {
    error.Reset();

    ofstream output_file(package_file_path,
                         ios::out | ios::trunc | ios::binary);

    vector<string>::iterator it;
    for (it = file_paths_to_package.begin();
             it != file_paths_to_package.end();
             ++it) {
        string file_path_to_package = *it;

        string data_file_relative_path
            = file_path_to_package.substr(data_files_dir_path.size());
        size_t relative_path_length = data_file_relative_path.size();

        // assume the entire world is little endian
        output_file.write(reinterpret_cast<char*>(&relative_path_length),
                          kFilePathSizeBytes);

        output_file.write(data_file_relative_path.c_str(),
                          relative_path_length);

        size_t file_size = getFilesize(file_path_to_package, error);
        if (!error.IsSuccess()) {
            return;
        }
        output_file.write(reinterpret_cast<char*>(&file_size), kFileSizeBytes);

        ifstream file_to_package(file_path_to_package, ios::in | ios::binary);
        if (!file_to_package.is_open()) {
            string error_message =
                "Failed to open file to package: "
                + file_path_to_package;
            error.Set(icu4js::Error::kErrorFileAccess, error_message);
            return;
        }

        output_file << file_to_package.rdbuf();
        file_to_package.close();
    }

    output_file.close();
}

static void createLazyLoadManifest(string manifest_file_path,
                                   vector<LazyLoadedResource>& lazy_resources,
                                   string lazy_resource_root_path,
                                   icu4js::Error& error) {
    error.Reset();
    ofstream manifest_file(manifest_file_path, ios::out | ios::trunc);

    vector<LazyLoadedResource>::iterator it;
    for (it = lazy_resources.begin(); it != lazy_resources.end(); ++it) {
        LazyLoadedResource lazy_resource = *it;

        string relative_path
            = lazy_resource.path.substr(lazy_resource_root_path.size());

        manifest_file
        << relative_path << kLazyLoadManifestFieldSeparator
        << lazy_resource.service << kLazyLoadManifestFieldSeparator
        << lazy_resource.language_code << kLazyLoadManifestFieldSeparator
        << lazy_resource.script_code << kLazyLoadManifestFieldSeparator
        << lazy_resource.country_code << kLazyLoadManifestFieldSeparator
        << lazy_resource.locale_variant << kLazyLoadManifestFieldSeparator
        << kLazyLoadManifestLineSeparator;
    }

    manifest_file.close();
}

static vector<LazyLoadedResource> parseManifest(string lazy_load_manifest_path,
                                                icu4js::Error& error) {
    error.Reset();
    vector<LazyLoadedResource> lazy_resources;

    ifstream manifest_file(lazy_load_manifest_path, ios::in);
    if (!manifest_file.is_open()) {
        string error_message =
            "Error in opening package file at: "
            + lazy_load_manifest_path;
        error.Set(icu4js::Error::kErrorFileAccess, error_message);

        return lazy_resources;
    }

    size_t file_size = getFilesize(lazy_load_manifest_path, error);
    if (!error.IsSuccess()) {
        string error_message =
            "Error in getting package file size at: "
            + lazy_load_manifest_path;
        error.Set(icu4js::Error::kErrorFileAccess, error_message);

        return lazy_resources;
    }

    if (file_size == 0) {
        string error_message =
            "LazyLoad manifest file empty at: "
            + lazy_load_manifest_path;
        error.Set(icu4js::Error::kErrorFileAccess, error_message);

        return lazy_resources;
    }

    string line;
    while (getline(manifest_file, line)) {
        vector<string> fields = splitString(line,
                                            kLazyLoadManifestFieldSeparator);
        if (fields.size() != 6) {
            string error_message =
                "Error while reading manifest file. "
                "expected 6 fields, found: "
                + std::to_string(fields.size());
            error.Set(icu4js::Error::kInvalidICU4JSData, error_message);
            return lazy_resources;
        }

        string file_relative_path = fields[0];
        DP::ICUOptionalService file_service
            = (DP::ICUOptionalService)stoi(fields[1]);
        string file_language_code = fields[2];
        string file_script_code = fields[3];
        string file_country_code = fields[4];
        string file_locale_variant = fields[5];

        lazy_resources.push_back((LazyLoadedResource) {
            file_relative_path,
            file_service,
            file_language_code,
            file_script_code,
            file_country_code,
            file_locale_variant
        });
    }

    return lazy_resources;
}

static
vector<LazyLoadedResource>
getMatchingLazyLoadedResources(vector<LazyLoadedResource> lazy_resources,
                               vector<DP::ICUOptionalService> services,
                               string locale_id,
                               icu4js::Error& error) {
    error.Reset();
    vector<LazyLoadedResource> matching_resources;

    // make a set for quick presence check
    set<DP::ICUOptionalService> services_set;
    vector<DP::ICUOptionalService>::iterator service_it;
    for (service_it = services.begin();
         service_it != services.end();
         ++service_it) {
        services_set.insert(*service_it);
    }

    // TODO(sunny): validate locale_id
    icu::Locale locale = icu::Locale::createCanonical(locale_id.c_str());

    vector<LazyLoadedResource>::iterator it;
    for (it = lazy_resources.begin(); it != lazy_resources.end(); ++it) {
        LazyLoadedResource lazy_resource = *it;

        if (lazy_resource.service != DP::kServiceNone
            && !setHasValue(services_set, lazy_resource.service)) {
            continue;
        }

        if (lazy_resource.language_code.size()
            && locale.getLanguage() != lazy_resource.language_code) {
            continue;
        }
        if (lazy_resource.script_code.size()
            && locale.getScript() != lazy_resource.country_code) {
            continue;
        }
        if (lazy_resource.country_code.size()
            && locale.getCountry() != lazy_resource.country_code) {
            continue;
        }
        if (lazy_resource.locale_variant.size()
            && locale.getVariant() != lazy_resource.locale_variant) {
            continue;
        }

        matching_resources.push_back(lazy_resource);
    }

    return matching_resources;
}

static void getCommonAndLazyLoadedFiles(string host_data_package_path,
                                string data_files_dir_path,
                                vector<string>& common_file_paths,
                                vector<LazyLoadedResource>& lazy_resources,
                                icu4js::Error& error) {
    error.Reset();

    initialize(host_data_package_path, error);
    if (!error.IsSuccess()) {
        return;
    }

    if (data_files_dir_path.back() == '/') {
        data_files_dir_path.back() = '\0';
    }

    vector<string> all_file_paths
        = listAllFilesInDirectory(data_files_dir_path, error);
    if (!error.IsSuccess()) {
        return;
    }

    segmentCommonAndLazyLoadFiles(all_file_paths,
                                  common_file_paths,
                                  lazy_resources,
                                  error);

    if (!error.IsSuccess()) {
        return;
    }
}


void DP::PackageData(string host_data_package_path,
                     string data_files_dir_path,
                     string package_file_path,
                     string lazy_load_manifest_path,
                     icu4js::Error& error) {
    vector<string> common_file_paths;
    vector<LazyLoadedResource> lazy_resources;

    getCommonAndLazyLoadedFiles(host_data_package_path,
                                data_files_dir_path,
                                common_file_paths,
                                lazy_resources,
                                error);
    if (!error.IsSuccess()) {
        return;
    }

    createDataPackage(package_file_path,
                      common_file_paths,
                      data_files_dir_path, error);
    if (!error.IsSuccess()) {
        return;
    }

    createLazyLoadManifest(lazy_load_manifest_path,
                           lazy_resources,
                           data_files_dir_path, error);
    if (!error.IsSuccess()) {
        return;
    }
}

void DP::PackageLocaleData(string host_data_package_path,
                           string data_files_dir_path,
                           string package_file_path,
                           string locale_id,
                           icu4js::Error& error) {
    vector<string> common_file_paths;
    vector<LazyLoadedResource> lazy_resources;

    getCommonAndLazyLoadedFiles(host_data_package_path,
                                data_files_dir_path,
                                common_file_paths,
                                lazy_resources,
                                error);
    if (!error.IsSuccess()) {
        return;
    }

    vector<LazyLoadedResource> matching_lazy_resources;
    // we'll apply not services filter, if non-default services are
    // on, files will have to be loaded individually.
    vector<DP::ICUOptionalService> services;
    matching_lazy_resources =
        getMatchingLazyLoadedResources(lazy_resources,
                                       services,
                                       locale_id,
                                       error);
    if (!error.IsSuccess()) {
        return;
    }


    vector<string> lazy_file_paths;
    vector<LazyLoadedResource>::iterator it;

    for (it = matching_lazy_resources.begin();
         it != matching_lazy_resources.end();
         ++it) {
        LazyLoadedResource lazy_resource = *it;
        lazy_file_paths.push_back(lazy_resource.path);
    }

    createDataPackage(package_file_path,
                      lazy_file_paths,
                      data_files_dir_path,
                      error);
    if (!error.IsSuccess()) {
        return;
    }
}

vector<DP::PackagedFile> DP::GetPackagedFiles(string package_file_path,
                                              icu4js::Error& error) {
    error.Reset();

    vector<DP::PackagedFile> packaged_files;
    size_t offset = 0;

    ifstream package_file(package_file_path, ios::in | ios::binary);
    if (!package_file.is_open()) {
        string error_message =
            "Error in opening package file at: "
            + package_file_path;
        error.Set(icu4js::Error::kErrorFileAccess, error_message);
        return packaged_files;
    }

    while (!package_file.eof()) {
        int file_relative_path_length = 0;
        package_file.read(reinterpret_cast<char*>(&file_relative_path_length),
                          kFilePathSizeBytes);
        if (!package_file.good()) {
            break;
        }

        char file_relative_path_buffer[file_relative_path_length + 1]; // NOLINT
        file_relative_path_buffer[file_relative_path_length] = '\0';
        package_file.read(file_relative_path_buffer, file_relative_path_length);

        size_t file_size = 0;
        package_file.read(reinterpret_cast<char*>(&file_size),
                          kFileSizeBytes);

        offset += kFilePathSizeBytes
                  + file_relative_path_length
                  + kFileSizeBytes;

        packaged_files.push_back((DP::PackagedFile) {
            file_relative_path_buffer,
            offset,
            file_size
        });

        offset += file_size;
        package_file.ignore(file_size);
    }

    return packaged_files;
}

vector<string>
DP::GetLazyLoadFiles(string lazy_load_manifest_path,
                     vector<DP::ICUOptionalService> services,
                     string locale_id,
                     icu4js::Error& error) {
    error.Reset();
    vector<string> lazy_load_files;

    vector<LazyLoadedResource> lazy_resources
        = parseManifest(lazy_load_manifest_path, error);
    if (!error.IsSuccess()) {
        return lazy_load_files;
    }

    vector<LazyLoadedResource> matching_resources;
    matching_resources = getMatchingLazyLoadedResources(lazy_resources,
                                                        services,
                                                        locale_id,
                                                        error);
    if (!error.IsSuccess()) {
        return lazy_load_files;
    }

    vector<LazyLoadedResource>::iterator it;
    for (it = matching_resources.begin();
         it != matching_resources.end();
         ++it) {
        LazyLoadedResource lazy_load_resource = *it;
        lazy_load_files.push_back(lazy_load_resource.path);
    }
    return lazy_load_files;
}


#ifdef BUILD_PACKAGE_SCRIPT

int main(int argc, char** argv) {
    optparse::OptionParser parser =
        optparse::OptionParser()
           .description("Utility to create partial "
                        "data packages for icu4js");

    parser.add_option("-t", "--task")
        .dest("task")
        .help("Task to execute. One of [pack, pack-locale].\n"
              "`pack` produces a .data file for all the common files and a .mf "
              "file that contains information on how to load individual files "
              "for a specific locale/codepage(s) configuration.\n"
              "`pack-locale` produces a .dat file containing all the files"
              "required for the locale specified by `locale` argument.")
        .metavar("TASK");

    parser.add_option("-h", "--host-data-file")
        .dest("host_data_file")
        .help("Path to ICU .dat file built for this machine with "
              "--with-data-packaging=archive")
        .metavar("PATH")
        .set_default("lib/icu4c-host-built/data/icudt57l.dat");

    parser.add_option("-d", "--data-dir")
        .dest("data_dir")
        .help("Path to directory with individual ICU data files "
              "built for emscripten with --with-data-packaging=files")
        .metavar("PATH")
        .set_default("lib/icu4c-emscripten-built/data/icudt57l/");

    parser.add_option("-o", "--output-file")
        .dest("output_file")
        .help("Path to write the package file to")
        .metavar("PATH")
        .set_default("build/res/icu4js.dat");

    parser.add_option("-m", "--manifest-file")
        .dest("lazy_load_manifest")
        .help("Path to write the manifest for files that to by lazily loaded")
        .metavar("PATH")
        .set_default("build/res/icu4js-lazy-load.mf");

    parser.add_option("-l", "--locale")
        .dest("locale")
        .help("The ID of the locale to generate .dat file for.")
        .metavar("LOCALE");

    optparse::Values options = parser.parse_args(argc, argv);
    vector<string> args = parser.args();

    string task = options["task"];

    if (task == "pack") {
        icu4js::Error error;
        DP::PackageData(options["host_data_file"],
                        options["data_dir"],
                        options["output_file"],
                        options["lazy_load_manifest"],
                        error);

        if (!error.IsSuccess()) {
            cerr << endl << "Task `"
                 << task << "` failed. Error: "
                 << Util::WStringToString(error.GetMessage())
                 << " (" << error.GetCode() << ")" << endl << endl;
            return 1;
        }

        cout << endl << "Task `" << task
             << "` succeeded. Common data file is at: `"
             << options["output_file"] << "`, lazy-load manifest is at `"
             << options["lazy_load_manifest"] << "`" << endl << endl;

        return 0;

    } else if (task == "pack-locale") {
        string locale_id = options["locale"];

        if (locale_id.empty()) {
            cerr << endl << "`locale` must be specified for task `"
                 << task << "`" << endl << endl;
            parser.print_help();
            return 1;
        }

        string output_file = options["output_file"];
        if (!options.is_set_by_user("output_file")) {
            output_file = "build/res/" + locale_id + ".dat";
        }


        icu4js::Error error;
        DP::PackageLocaleData(options["host_data_file"],
                              options["data_dir"],
                              output_file,
                              locale_id,
                              error);

        if (!error.IsSuccess()) {
            cerr << endl << "Task `" << task
                 << "` failed. Error: "
                << Util::WStringToString(error.GetMessage())
                 << " (" << error.GetCode() << ")" << endl << endl;
            return 1;
        }

        cout << endl << "Task `" << task
             << "` succeeded. Locale data file is at: `"
             << output_file << "`" << endl << endl;
        return 0;

    } else {
        parser.print_help();
    }

    return 0;
}

#endif  // BUILD_PACKAGE_SCRIPT

#ifndef BUILD_PACKAGE_SCRIPT

EMSCRIPTEN_BINDINGS(icu4js_data_packager) {
    emscripten::enum_<DP::ICUOptionalService>("ICUOptionalService")
    .value("NONE", DP::kServiceNone)
    .value("BOUNDARY_DETECTION", DP::kServiceBoundaryDetection);

    emscripten::register_vector<DP::ICUOptionalService>(
                                                    "ICUOptionalServiceVector");

    emscripten::value_object<DP::PackagedFile>("PackagedFile")
    .field("path", &DP::PackagedFile::path)
    .field("offset", &DP::PackagedFile::offset)
    .field("size", &DP::PackagedFile::size);

    emscripten::register_vector<DP::PackagedFile>("PackagedFileVector");

    emscripten::class_<icu4js::DataPackager>("DataPackager")
    .class_function("packageData", &DP::PackageData)
    .class_function("packageLocaleData", &DP::PackageLocaleData)
    .class_function("getPackagedFiles", &DP::GetPackagedFiles)
    .class_function("getLazyLoadFiles", &DP::GetLazyLoadFiles);
}

#endif  // BUILD_PACKAGE_SCRIPT

