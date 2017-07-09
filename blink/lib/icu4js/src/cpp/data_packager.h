/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview This class handles our custom data packaging mechanism.
 *
 * The amount of localization data icu4c needs to function is small enough
 * for desktop applications to be bundled with the application itself. On
 * the web, however, the entire data set (~10MB compressed) would be too
 * much for a web app to download.
 *
 * To cut down the amount of data a web page using icu4js has to download we
 * split all the icu4c data files into two buckets: core data that most basic
 * use cases in all locales will need, and optional data that is needed only
 * when dealing with a certain locale or icu service.
 *
 * To reduce the number of round trips needed to fetch all the different files
 * we bundle all the core data files into a single file with a custom file
 * structure (default name `icu4js.dat`). To handle the optional files we create
 * a manifest file (default name `icu4js-lazy-load.mf`) that carries enough
 * information to decided at runtime which optional files are needed in the
 * custom setup in the browser (locale + services combination). To reduce the
 * number of round trips to the server even in case of optional files this file
 * provides a method to create a .dat package containing all the files need for
 * a particular locale (even though recommended for performance reasons creating
 * such a locale package for every locale is not strictly necessary as explained
 * below).
 *
 * Note that currently we don't support service based optional file load. Some
 * services are disabled (e.g. codepage conversion service) and their files are
 * never loaded. In the future we'll add the ability to optionally enable these
 * services and load their data.
 *
 * FILE STRUCTURE
 *
 * 1. .dat file
 *    Note that the extension of the data archive generate by icu4c is also .dat
 *    but their file structure is unrelated to ours.
 *    For each file in the package the .dat file contains
 *    a) 2 bytes for the length (`Lp`) of the relative path of the file (relative to icu4c
 *       data directory.
 *    b) `Lp` bytes of the relative path of the file
 *    c) 4 bytes for the length (`Lf`) of the content of the file
 *    d) Lf bytes of the content of the file itself
 *    
 *    We assume that all machines involved (the one generating the package and
 *    the browser) have the same endian-ness.
 *
 * 2. .mf file
 *    Note that unlike the .dat file this is text file and can be processed as such.
 *    For each optional icu4c file in icu4js there is exactly one line in the manifest
 *    file. Each line has these fields:
 *        relative_path // the path of the file relative to icu4c data dir
 *        service // the service the file is related to (unused at the moment)
 *        language_code
 *        script_code
 *        country_code
 *        locale_variant
 *    These fields are joined with tabs. The lines for each optional file are joined by a
 *    new line character (\n).
 *    An optional file is loaded iff for each field with a non-empty value the runtime value
 *    of the field is the same as that specified in the line for the file in the manifest.
 *
 * USAGE
 *
 * The browser takes these steps to load the correct files for the specified configuration:
 * 1. It looks for the core .dat file on the server. If this fails it indicates an error and exits.
 * 2. It looks for the .dat package for it's current configuration (e.g. en_US.dat), if this succeeds
 *    the browser has all the data it needs.
 * 3. If (2) fails the browser looks for the lazy-load manifest file (icu4js-lazy-load.mf) on the server.
 *    If this fails it indicates an error and exits.
 * 4. It parses the lazy-load manifest to get the list of individual files it needs to download and
 *    downloads them.
 *
 * Each individual file is downloaded and mapped to the local emscripten filesystem. The .dat packages
 * are parsed and the files within are mapped to files in the files system as well. Once all the files
 * have been loaded in the local emscripten FS icu is pointed to that directory in the FS and initialized.
 */

#ifndef ICU4JS_DATA_PACKAGER_H
#define ICU4JS_DATA_PACKAGER_H

#include <unicode/utypes.h>
#include <string>
#include <vector>

#include "error.h"

namespace icu4js {
    class DataPackager;
};

class icu4js::DataPackager {
 public:
    // Note (sunny): only append to the enum to preserve backward compatibility
    // in lazy-load manifest files
    enum ICUOptionalService {
        kServiceNone = 0,
        kServiceBoundaryDetection = 1
    };

    struct PackagedFile {
        std::string path;
        size_t offset;
        size_t size;
    };

    static void PackageData(std::string host_data_package_path,
                            std::string data_files_dir_path,
                            std::string package_file_path,
                            std::string lazy_load_manifest_path,
                            icu4js::Error& error);

    static void PackageLocaleData(std::string host_data_package_path,
                                  std::string data_files_dir_path,
                                  std::string package_file_path,
                                  std::string locale_id,
                                  icu4js::Error& error);

    static std::vector<DataPackager::PackagedFile>
    GetPackagedFiles(std::string package_file_path,
                     icu4js::Error& error);

    static std::vector<std::string>
    GetLazyLoadFiles(std::string lazy_load_manifest_path,
                     std::vector<ICUOptionalService> services,
                     std::string locale_id,
                     icu4js::Error& error);
};

#endif  // ICU4JS_DATA_PACKAGER_H
