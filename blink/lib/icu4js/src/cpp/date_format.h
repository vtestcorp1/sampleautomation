/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A class to provide i18n date formatting ability to Javascript.
 *
 * @see NumberFormat for design choice explanation.
 *
 */

#ifndef ICU4JS_DATE_FORMAT_H // NOLINT
#define ICU4JS_DATE_FORMAT_H

#include <unicode/datefmt.h>
#include <unicode/smpdtfmt.h>
#include <unicode/dtptngen.h>
#include <unicode/gregocal.h>
#include <unicode/reldatefmt.h>

#include <array>
#include <string>
#include <vector>

#include "error.h" // NOLINT

using std::unique_ptr;
using std::wstring;
using std::vector;

using icu::DateFormat;
using icu::DateTimePatternGenerator;
using icu::UnicodeString;
using icu4js::Error;
using icu::GregorianCalendar;

namespace icu4js {
    class DateFormat;
};

class icu4js::DateFormat {
public: // NOLINT
    explicit DateFormat(Error& error); // NOLINT
    virtual ~DateFormat();

    static int32_t GetTimeZoneOffset(double epoch_millis,
                                     wstring timezone_name,
                                     bool is_local_timestamp,
                                     Error& error); // NOLINT

    void SetTimeZone(wstring timezone_name, Error& error); // NOLINT

    wstring Format(double epoch_millis,
                   wstring pattern,
                   int year_start_month,
                   bool no_localization,
                   Error& error);

    UDate Parse(const wstring formatted_date,
                const bool lenient,
                const wstring format_pattern,
                Error& error); // NOLINT

    wstring GetLocalizedPattern(wstring non_localized_pattern,
                                Error& error); // NOLINT

    int32_t GetField(double epoch_millis,
                     UCalendarDateFields field,
                     Error& error); // NOLINT

    UDate SetField(double epoch_millis,
                   UCalendarDateFields field,
                   double field_value,
                   Error& error); // NOLINT

    UDate AddToField(double epoch_millis,
                     UCalendarDateFields field,
                     double delta,
                     Error& error); // NOLINT

    int32_t GetFieldDifference(double begin_millis,
                               double end_millis,
                               UCalendarDateFields field,
                               Error& error); // NOLINT

    UDate GetStartOfField(double epoch_millis,
                          UCalendarDateFields field,
                          Error& error); // NOLINT

    UDate GetEndOfField(double epoch_millis,
                        UCalendarDateFields field,
                        Error& error); // NOLINT

    wstring FormatRelative(double delta_millis, Error& error); // NOLINT

private: // NOLINT
    class FiscalCalendar: public GregorianCalendar {
    public: // NOLINT
        explicit FiscalCalendar(UErrorCode& status); // NOLINT
        FiscalCalendar(const FiscalCalendar& source); // NOLINT
        virtual ~FiscalCalendar();

        Calendar* clone() const;
        const char* getType() const;
        virtual void computeFields(UErrorCode& status); // NOLINT

        void SetYearStartMonth(int year_start_month,
                               Error& error); // NOLINT
        void SetIsComputingForQuarter(bool computing_for_quarter,
                                      UErrorCode& status); // NOLINT
    private:
        int year_start_month;
        bool computing_for_quarter;
    };

    class FiscalDateFormat: public SimpleDateFormat {
    public:
        explicit FiscalDateFormat(UErrorCode& status); // NOLINT
        virtual ~FiscalDateFormat();

        UnicodeString& format(Calendar& cal, // NOLINT
                              UnicodeString& appendTo,
                              FieldPositionIterator* posIter,
                              UErrorCode& status) const; // NOLINT

        void SetYearStartMonth(int year_start_month,
                               Error& error); // NOLINT
    private:
        vector<unique_ptr<UnicodeString>>
        GetFiscalQuarterSegments(Calendar& cal, // NOLINT
                                 UErrorCode& status) const; // NOLINT
    };

    unique_ptr<DateTimePatternGenerator> pattern_generator;
    unique_ptr<SimpleDateFormat> default_format;
    unique_ptr<SimpleDateFormat> parser_format;
    unique_ptr<SimpleDateFormat> non_localized_format;
    unique_ptr<FiscalDateFormat> fiscal_date_format;
    unique_ptr<FiscalDateFormat> non_localized_fiscal_date_format;
    unique_ptr<Calendar> default_calendar;
    unique_ptr<Calendar> parser_calendar;
    unique_ptr<RelativeDateTimeFormatter> relative_formatter;

    void SetDefaultCalendarTime(double epoch_millis, Error& error); // NOLINT
    UDate GetDefaultCalendarTime(Error& error); // NOLINT
    UDate RoundToField(double epoch_millis,
                       UCalendarDateFields field,
                       bool round_down,
                       Error& error); // NOLINT
};

#endif  // ICU4JS_DATE_FORMAT_H // NOLINT