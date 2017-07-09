/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 */
#include <unicode/locid.h>
#include <unicode/unistr.h>
#include <unicode/uenum.h>
#include <unicode/timezone.h>
#include <unicode/ucal.h>
#include <unicode/gregocal.h>
#include <unicode/smpdtfmt.h>
#include <unicode/numfmt.h>
#include <unicode/decimfmt.h>

#ifndef BUILD_PACKAGE_SCRIPT
#include <emscripten/bind.h>
#endif

#include <array>
#include <math.h>
#include <string>
#include <vector>
#include <algorithm>
#include <iostream> // NOLINT
#include <sstream>

#include "date_format.h" // NOLINT
#include "util.h" // NOLINT

using std::string;
using std::wstring;
using std::wstringstream;
using std::cout;
using std::wcout;
using std::endl;
using std::unique_ptr;
using std::array;
using std::vector;
using std::max;
using std::to_string;

using icu::Locale;
using icu::UnicodeString;
using icu::GregorianCalendar;
using FormattableType = icu::Formattable::Type;

using icu4js::Error;
using icu4js::Util;

static const int MIN_YEAR_START_MONTH = 0;
static const int MAX_YEAR_START_MONTH = 11;
static const char* const FISCAL_CALENDAR_TYPE = "FISCAL";
// The literal representing fiscal year is not localized
static const char* const FISCAL_YEAR_PREFIX = "FY ";

static const UCalendarDateFields ORDERED_DATE_FIELDS[] = {
    UCalendarDateFields::UCAL_YEAR,
    UCalendarDateFields::UCAL_MONTH,
    UCalendarDateFields::UCAL_DAY_OF_WEEK,
    UCalendarDateFields::UCAL_DATE,
    UCalendarDateFields::UCAL_AM_PM,
    UCalendarDateFields::UCAL_HOUR,
    UCalendarDateFields::UCAL_MINUTE,
    UCalendarDateFields::UCAL_SECOND,
    UCalendarDateFields::UCAL_MILLISECOND,
};

static size_t getNumOrderedDateFields() {
    return std::extent<decltype(ORDERED_DATE_FIELDS)>::value;
}

static int getOrderedDateFieldIndex(UCalendarDateFields field) {
    size_t num_fields = getNumOrderedDateFields();
    int field_index = -1;
    for (int i = 0; i < num_fields; ++i) {
        if (field == ORDERED_DATE_FIELDS[i]) {
            field_index = i;
            break;
        }
    }
    return field_index;
}

static void roundToField(UCalendarDateFields field,
                         Calendar& cal,
                         bool round_down,
                         Error& error) {
    int field_index = getOrderedDateFieldIndex(field);
    if (field_index < 0) {
        error.Set(Error::kUnsupportedArguments,
                  "rounding not supported for field "
                      + to_string(field));
        return;
    }

    UErrorCode err_code = U_ZERO_ERROR;

    size_t num_fields = getNumOrderedDateFields();
    for (int i = field_index + 1; i < num_fields; ++i) {
        UCalendarDateFields lower_field = ORDERED_DATE_FIELDS[i];

        // TODO(sunny): handle day of week and week of year

        int32_t target = round_down
            ? cal.getActualMinimum(lower_field, err_code)
                : cal.getActualMaximum(lower_field, err_code);
        if (U_FAILURE(err_code)) {
            error.Set(err_code, "Error in getting min/max of field");
            return;
        }
        cal.set(lower_field, target);
    }
}

static TimeZone* getTimeZoneFromName(wstring tz_name) {
    UnicodeString tz_name_unicode
        = Util::WStringToUnicodeString(tz_name);
    TimeZone *zone = TimeZone::createTimeZone(tz_name_unicode);
    return zone;
}

static URelativeDateTimeUnit getDateTimeUnitForTimeDelta(double delta_millis,
                                                         double& units) {
    // Note (sunny): It is acceptable to ignore small locale
    // dependent calendar adjustment for this calculation. For example
    // even if the 6 days ago was in the last year it still makes sense
    // to call it `6 days ago` and not `last year`. In other words,
    // this unit is largely independent of when in absolute time the
    // time delta occurred.
    double interval;
    double abs_millis = fabs(delta_millis);

    if (abs_millis >= (interval = 366.0 * 86400 * 1000)) {
        units = delta_millis/interval;
        return URelativeDateTimeUnit::UDAT_REL_UNIT_YEAR;
    }
    // Quarter is not supported by icu4c yet
    if (FALSE && abs_millis >= (interval = 92.0 * 86400 * 1000)) {
        units = delta_millis/interval;
        return URelativeDateTimeUnit::UDAT_REL_UNIT_QUARTER;
    }
    if (abs_millis >= (interval = 31.0 * 86400 * 1000)) {
        units = delta_millis/interval;
        return URelativeDateTimeUnit::UDAT_REL_UNIT_MONTH;
    }
    if (abs_millis >= (interval = 7.0 * 86400 * 1000)) {
        units = delta_millis/interval;
        return URelativeDateTimeUnit::UDAT_REL_UNIT_WEEK;
    }
    if (abs_millis >= (interval = 86400.0 * 1000)) {
        units = delta_millis/interval;
        return URelativeDateTimeUnit::UDAT_REL_UNIT_DAY;
    }
    if (abs_millis >= (interval = 3600.0 * 1000)) {
        units = delta_millis/interval;
        return URelativeDateTimeUnit::UDAT_REL_UNIT_HOUR;
    }
    if (abs_millis >= (interval = 60.0 * 1000)) {
        units = delta_millis/interval;
        return URelativeDateTimeUnit::UDAT_REL_UNIT_MINUTE;
    }
    // minimum interval is 1 seconds, for most users
    // milliseconds will be too `mathy`
    units = delta_millis/1000;
    if (fabs(units) < 1) {
        units = units >= 0 ? 1 : -1;
    }
    return URelativeDateTimeUnit::UDAT_REL_UNIT_SECOND;
}

icu4js::DateFormat::FiscalCalendar::FiscalCalendar(UErrorCode& status) // NOLINT
: GregorianCalendar(status),
  year_start_month(0),
  computing_for_quarter(FALSE) {
}

icu4js::DateFormat::FiscalCalendar::FiscalCalendar(const FiscalCalendar& source) // NOLINT
: GregorianCalendar(source),
  year_start_month(source.year_start_month),
  computing_for_quarter(source.computing_for_quarter) {
}

icu4js::DateFormat::FiscalCalendar::~FiscalCalendar() {}

Calendar*
icu4js::DateFormat::FiscalCalendar::clone() const {
    return new FiscalCalendar(*this);
}

const char*
icu4js::DateFormat::FiscalCalendar::getType() const {
    return FISCAL_CALENDAR_TYPE;
}

void
icu4js::DateFormat::FiscalCalendar::SetYearStartMonth(int year_start_month,
                                                      Error& error) { // NOLINT
    error.Reset();

    if (year_start_month < MIN_YEAR_START_MONTH
        || year_start_month > MAX_YEAR_START_MONTH) {
        wstring error_message =
            L"year_start_month must be in the range ["
                + std::to_wstring(MIN_YEAR_START_MONTH)
                + L", "
                + std::to_wstring(MAX_YEAR_START_MONTH)
                + L"]";
        error.Set(Error::kInvalidArgument, error_message);
        return;
    }
    this->year_start_month = year_start_month;
}

void
icu4js::DateFormat::FiscalCalendar::computeFields(UErrorCode& status) { // NOLINT
    GregorianCalendar::computeFields(status);
    if (U_FAILURE(status)) {
        return;
    }

    // if not customized base impl is all we need
    if (this->year_start_month == 0) {
        return;
    }

    unique_ptr<Calendar> computation_cal(new GregorianCalendar(*this));
    UDate orig_time = computation_cal->getTime(status);
    if (U_FAILURE(status)) {
        return;
    }

    int32_t month_number
        = computation_cal->get(UCalendarDateFields::UCAL_MONTH, status);
    if (U_FAILURE(status)) {
        return;
    }

    int32_t month_delta = month_number - this->year_start_month;
    int32_t effective_month_num;

    if (month_delta >= 0) {
        effective_month_num = month_delta;
    } else {
        effective_month_num
            = UCalendarMonths::UCAL_DECEMBER + month_delta + 1;
    }

    computation_cal->add(UCalendarDateFields::UCAL_MONTH,
                         -1 * effective_month_num,
                         status);
    if (U_FAILURE(status)) {
        return;
    }

    const array<UCalendarDateFields, 4> affected_fields = {
        UCalendarDateFields::UCAL_YEAR,
        UCalendarDateFields::UCAL_YEAR_WOY,
        UCalendarDateFields::UCAL_WEEK_OF_YEAR,
        UCalendarDateFields::UCAL_EXTENDED_YEAR
    };

    for (const auto& affected_field : affected_fields) {
        int32_t value = computation_cal->get(affected_field, status);
        if (U_FAILURE(status)) {
            return;
        }
        // FY is the calendar year in which the fiscal year ends
        if (affected_field == UCalendarDateFields::UCAL_YEAR
            || affected_field == UCalendarDateFields::UCAL_YEAR_WOY
            || affected_field == UCalendarDateFields::UCAL_EXTENDED_YEAR) {
            ++value;
        }
        internalSet(affected_field, value);
    }

    computation_cal->setTime(orig_time, status);
    if (U_FAILURE(status)) {
        return;
    }

    if (this->computing_for_quarter) {
        internalSet(UCalendarDateFields::UCAL_MONTH, effective_month_num);
    }
}

void
icu4js::DateFormat::FiscalCalendar::SetIsComputingForQuarter(
                                                     bool computing_for_quarter,
                                                     UErrorCode& status) { // NOLINT
    this->computing_for_quarter = computing_for_quarter;
    UDate time = this->getTime(status);
    if (U_FAILURE(status)) {
        return;
    }
    this->setTime(time, status);
}

icu4js::DateFormat::FiscalDateFormat::FiscalDateFormat(UErrorCode& status) // NOLINT
:SimpleDateFormat(status) {
    FiscalCalendar *fiscal_calendar = new FiscalCalendar(status);
    if (U_FAILURE(status)) {
        return;
    }
    this->adoptCalendar(fiscal_calendar);
}

icu4js::DateFormat::FiscalDateFormat::~FiscalDateFormat() {}

void
icu4js::DateFormat::FiscalDateFormat::SetYearStartMonth(int year_start_month,
                                                        Error& error) { // NOLINT
    FiscalCalendar *fiscal_calendar
        = static_cast<FiscalCalendar*>(this->fCalendar);
    fiscal_calendar->SetYearStartMonth(year_start_month, error);
}

vector<unique_ptr<UnicodeString>>
icu4js::DateFormat::FiscalDateFormat::GetFiscalQuarterSegments(Calendar& cal, // NOLINT
                                                       UErrorCode& status) const { // NOLINT
    vector<unique_ptr<UnicodeString>> rv;

    FiscalCalendar *fiscal_calendar
        = static_cast<FiscalCalendar*>(&cal);
    fiscal_calendar->SetIsComputingForQuarter(TRUE, status);
    if (U_FAILURE(status)) {
        return rv;
    }

    UnicodeString formatted;
    FieldPositionIterator pos_iter;

    SimpleDateFormat::format(cal, formatted, &pos_iter, status);
    if (U_FAILURE(status)) {
        UErrorCode format_status = status;
        fiscal_calendar->SetIsComputingForQuarter(FALSE, status);
        status = format_status;
        return rv;
    }

    FieldPosition fp;
    while (pos_iter.next(fp)) {
        int32_t field = fp.getField();
        if (field == UDateFormatField::UDAT_QUARTER_FIELD
            || field == UDateFormatField::UDAT_STANDALONE_QUARTER_FIELD) {
            int32_t begin_index = fp.getBeginIndex();
            int32_t end_index = fp.getEndIndex();
            int32_t length = end_index - begin_index + 1;

            UnicodeString* quarter_segment
                = new UnicodeString(formatted, begin_index, length);
            rv.push_back(unique_ptr<UnicodeString>(quarter_segment));
        }
    }

    fiscal_calendar->SetIsComputingForQuarter(FALSE, status);
    return rv;
}

UnicodeString&
icu4js::DateFormat::FiscalDateFormat::format(Calendar& cal, // NOLINT
                                             UnicodeString& appendTo,
                                             FieldPositionIterator* pos_iter,
                                             UErrorCode& status) const { // NOLINT
    vector<unique_ptr<UnicodeString>> fiscal_quarter_segments;
    fiscal_quarter_segments = GetFiscalQuarterSegments(cal, status);
    if (U_FAILURE(status)) {
        return appendTo;
    }

    FieldPositionIterator pos_iter_internal;
    SimpleDateFormat::format(cal, appendTo, &pos_iter_internal, status);
    if (U_FAILURE(status)) {
        return appendTo;
    }


    FieldPosition fp;
    int char_delta = 0;
    int quarter_segment_index = -1;

    while (pos_iter_internal.next(fp)) {
        int32_t field = fp.getField();
        int32_t begin_index = fp.getBeginIndex();
        int32_t end_index = fp.getEndIndex();
        int32_t length = end_index - begin_index + 1;

        fp.setBeginIndex(begin_index + char_delta);

        switch (field) {
            case UDateFormatField::UDAT_YEAR_FIELD:
            case UCalendarDateFields::UCAL_YEAR_WOY:
            case UCalendarDateFields::UCAL_EXTENDED_YEAR: {
                UnicodeString fy_prefix(FISCAL_YEAR_PREFIX);
                int32_t fy_prefix_size = fy_prefix.length();

                UnicodeString curr_year_prefix
                = appendTo.tempSubString(begin_index - fy_prefix_size,
                                         fy_prefix_size);

                if (curr_year_prefix != fy_prefix) {
                    appendTo.insert(char_delta + begin_index, fy_prefix);
                    char_delta += fy_prefix_size;
                }
                break;
            }
            case UDateFormatField::UDAT_QUARTER_FIELD:
            case UDateFormatField::UDAT_STANDALONE_QUARTER_FIELD: {
                ++quarter_segment_index;
                if (quarter_segment_index >= fiscal_quarter_segments.size()) {
                    status = U_INVALID_FORMAT_ERROR;
                    return appendTo;
                }
                UnicodeString quarter_segment
                    = *(fiscal_quarter_segments[quarter_segment_index]).get();
                appendTo.replace(begin_index + char_delta,
                                 length,
                                 quarter_segment);
                char_delta += quarter_segment.length() - length;
                break;
            }
            default:
                break;
        }

        fp.setEndIndex(end_index + char_delta);
    }
    return appendTo;
}

icu4js::DateFormat::DateFormat(Error& error) { // NOLINT
    UErrorCode err_code = U_ZERO_ERROR;

    auto pattern_generator = DateTimePatternGenerator::createInstance(err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, "Failed to initialize DateTimePatternGenerator");
        return;
    }
    this->pattern_generator
        = unique_ptr<DateTimePatternGenerator>(pattern_generator);

    auto default_format = new SimpleDateFormat(err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, "Failed to initialize SimpleDateFormat");
        return;
    }
    this->default_format = unique_ptr<SimpleDateFormat>(default_format);


    auto parser_format = new SimpleDateFormat(err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, "Failed to initialize parser SimpleDateFormat");
        return;
    }
    this->parser_format = unique_ptr<SimpleDateFormat>(parser_format);

    Locale current_locale = Locale::getDefault();
    Locale default_locale = Locale::getUS();
    Locale::setDefault(default_locale, err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code,
                  "Failed to set default locale for non"
                  " localized date format creation");
        return;
    }

    auto non_localized_format = new SimpleDateFormat(err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, "Failed to initialize"
                  "non localized SimpleDateFormat");
        return;
    }
    this->non_localized_format
        = unique_ptr<SimpleDateFormat>(non_localized_format);

    auto non_localized_fiscal_format
        = new FiscalDateFormat(err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, "Failed to initialize "
                  "non-localized FiscalDateFormat");
        return;
    }
    this->non_localized_fiscal_date_format
        = unique_ptr<FiscalDateFormat>(non_localized_fiscal_format);

    Locale::setDefault(current_locale, err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code,
                  "Failed to restore locale after"
                  " localized date format creation");
        return;
    }


    auto fiscal_date_format = new FiscalDateFormat(err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, "Failed to initialize FiscalDateFormat");
        return;
    }
    this->fiscal_date_format
        = unique_ptr<FiscalDateFormat>(fiscal_date_format);

    auto default_calendar = Calendar::createInstance(err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, "Failed to initialize default calendar");
        return;
    }
    this->default_calendar = unique_ptr<Calendar>(default_calendar);

    auto parser_calendar = Calendar::createInstance(err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, "Failed to initialize parser calendar");
        return;
    }
    this->parser_calendar = unique_ptr<Calendar>(parser_calendar);

    // Note (sunny): We would like to use UNUM_DURATION here but
    // it is currently not supported.
    DecimalFormat* rel_format_nf =
        reinterpret_cast<DecimalFormat*>(NumberFormat::createInstance(
                                                     Locale::getDefault(),
                                                     UNUM_DECIMAL,
                                                     err_code));
    if (U_FAILURE(err_code)) {
        error.Set(err_code,
                  "Failed to create NumberFormat forrelative formatter");
        return;
    }

    rel_format_nf->setRoundingMode(
                           DecimalFormat::ERoundingMode::kRoundHalfEven);
    // we don't want fractional parts in relative formatting (e.g. 1.5 years)
    rel_format_nf->setMaximumFractionDigits(0);

    auto relative_formatter =
        new RelativeDateTimeFormatter(Locale::getDefault(),
                                      rel_format_nf,
                                      err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, "Failed to initialize relative formatter");
        return;
    }
    this->relative_formatter
        = unique_ptr<RelativeDateTimeFormatter>(relative_formatter);
}

icu4js::DateFormat::~DateFormat() {
}

int32_t
icu4js::DateFormat::GetTimeZoneOffset(double epoch_millis,
                                      wstring timezone_name,
                                      bool is_local_timestamp,
                                      Error& error) { // NOLINT
    UErrorCode err_code = U_ZERO_ERROR;

    unique_ptr<TimeZone> zone(getTimeZoneFromName(timezone_name));

    int32_t raw_offset;
    int32_t dst_offset;
    zone->getOffset(epoch_millis,
                    is_local_timestamp,
                    raw_offset,
                    dst_offset,
                    err_code);

    if (U_FAILURE(err_code)) {
        wstring error_message =
            L"Error getting timezone offset: "
                + Util::StringToWString(u_errorName(err_code));
        error.Set(Error::kBadFormat, error_message);
        return 0;
    }
    return raw_offset + dst_offset;
}

void icu4js::DateFormat::SetTimeZone(wstring timezone_name,
                                     Error& error) { // NOLINT
    unique_ptr<TimeZone> zone(getTimeZoneFromName(timezone_name));
    this->default_format->setTimeZone(*zone);
    this->non_localized_format->setTimeZone(*zone);
    this->parser_format->setTimeZone(*zone);
    this->fiscal_date_format->setTimeZone(*zone);
    this->non_localized_fiscal_date_format->setTimeZone(*zone);
    this->default_calendar->setTimeZone(*zone);
    this->parser_calendar->setTimeZone(*zone);
}

wstring
icu4js::DateFormat::Format(double epoch_millis,
                           wstring pattern,
                           int year_start_month,
                           bool no_localization,
                           Error& error) { // NOLINT
    error.Reset();
    UErrorCode err_code = U_ZERO_ERROR;
    UnicodeString pattern_unicode
        = Util::WStringToUnicodeString(pattern);

    bool use_fiscal_cal = year_start_month > 0;
    bool localize = !no_localization;

    SimpleDateFormat* format = NULL;
    if (localize) {
        if (use_fiscal_cal) {
            this->fiscal_date_format->
                SetYearStartMonth(year_start_month, error);
            if (!error.IsSuccess()) {
                return L"";
            }
            format = this->fiscal_date_format.get();
        } else {
            format = this->default_format.get();
        }

        pattern_unicode
            = this->pattern_generator->getBestPattern(pattern_unicode,
                                                      err_code);
        if (U_FAILURE(err_code)) {
            error.Set(err_code,
                      "Error in localizing format pattern",
                      Error::kBadFormat);
            return L"";
        }
    } else {
        if (use_fiscal_cal) {
            this->non_localized_fiscal_date_format->
                SetYearStartMonth(year_start_month, error);
            if (!error.IsSuccess()) {
                return L"";
            }
            format = this->non_localized_fiscal_date_format.get();
        } else {
            format = this->non_localized_format.get();
        }
    }

    format->applyPattern(pattern_unicode);

    UnicodeString formatted;
    formatted = format->format(epoch_millis, formatted, NULL, err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, "Error in formatting");
        return L"";
    }

    return Util::UnicodeStringToWString(formatted);
}

UDate
icu4js::DateFormat::Parse(const wstring formatted_date,
                          const bool lenient,
                          const wstring format_pattern,
                          Error& error) {
    error.Reset();
    UErrorCode err_code = U_ZERO_ERROR;

    ParsePosition pos;
    UnicodeString formatted_unicode
        = Util::WStringToUnicodeString(formatted_date);

    this->parser_calendar->clear();

    SimpleDateFormat *format = this->parser_format.get();

    UnicodeString default_format_pattern;
    format->toPattern(default_format_pattern);
    if (!format_pattern.empty()) {
        UnicodeString format_pattern_unicode
            = Util::WStringToUnicodeString(format_pattern);
        format->applyPattern(format_pattern_unicode);
    }

    bool was_lenient = format->isLenient();
    format->setLenient(lenient);

    format->parse(formatted_unicode, *(this->parser_calendar), pos);

    format->setLenient(was_lenient);
    format->applyPattern(default_format_pattern);

    if (!lenient) {
        if (pos.getIndex() != formatted_unicode.length()) {
            string message = "Invalid symbol at "
                + std::to_string(pos.getIndex());
            error.Set(Error::kParsingFailure, message);
            return 0;
        }
    }

    UDate rv = this->parser_calendar->getTime(err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, L"Error in parsing date");
        return 0;
    }

    return rv;
}

wstring
icu4js::DateFormat::GetLocalizedPattern(wstring non_localized_pattern,
                                        Error& error) { // NOLINT
    error.Reset();
    UErrorCode err_code = U_ZERO_ERROR;
    UnicodeString non_localized_pattern_unicode
        = Util::WStringToUnicodeString(non_localized_pattern);

    UnicodeString localized_pattern
        = this->pattern_generator->getBestPattern(
                                          non_localized_pattern_unicode,
                                          err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, L"Error in getting best pattern");
        return L"";
    }

    return Util::UnicodeStringToWString(localized_pattern);
}

void
icu4js::DateFormat::SetDefaultCalendarTime(double epoch_millis,
                                           Error& error) {
    error.Reset();
    UErrorCode err_code = U_ZERO_ERROR;

    this->default_calendar->setTime(epoch_millis, err_code);
    if (U_FAILURE(err_code)) {
        wstring error_message =
            L"Error in setting time on default calendar: "
                + Util::StringToWString(u_errorName(err_code));
        error.Set(Error::kGenericError, error_message);
    }
}

UDate
icu4js::DateFormat::GetDefaultCalendarTime(Error& error) { // NOLINT
    error.Reset();
    UErrorCode err_code = U_ZERO_ERROR;

    UDate rv = this->default_calendar->getTime(err_code);
    if (U_FAILURE(err_code)) {
        wstring error_message =
            L"Error in getting time from default calendar: "
                + Util::StringToWString(u_errorName(err_code));
        error.Set(Error::kGenericError, error_message);
        return 0;
    }
    return rv;
}

int32_t
icu4js::DateFormat::GetField(double epoch_millis,
                             UCalendarDateFields field,
                             Error& error) {
    error.Reset();

    SetDefaultCalendarTime(epoch_millis, error);
    if (!error.IsSuccess()) {
        return 0;
    }

    UErrorCode err_code = U_ZERO_ERROR;
    int32_t rv = this->default_calendar->get(field, err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code, "Error in getting field of date");
        return 0;
    }
    return rv;
}

UDate
icu4js::DateFormat::SetField(double epoch_millis,
                             UCalendarDateFields field,
                             double field_value,
                             Error& error) {
    error.Reset();

    SetDefaultCalendarTime(epoch_millis, error);
    if (!error.IsSuccess()) {
        return (UDate)epoch_millis;
    }

    UErrorCode err_code = U_ZERO_ERROR;

    // For DOW, Nth day of the week (0-based) is interpreted as
    // offset starting from the first day of the week. For example
    // in en_US, where the week starts on Sunday, the second day of
    // the week (field_value = 1) is Monday whereas in fr_FR where
    // the week starts on Monday the second day of the week is Tuesday
    if (field == UCalendarDateFields::UCAL_DAY_OF_WEEK) {
        UCalendarDaysOfWeek first_day_of_week
            = this->default_calendar->getFirstDayOfWeek(err_code);
        if (U_FAILURE(err_code)) {
            error.Set(err_code, "Error in getting first day of week");
            return (UDate)epoch_millis;
        }
        field_value = (first_day_of_week + (int32_t)field_value)%7;
    }

    this->default_calendar->set(field, (int32_t)field_value);
    return GetDefaultCalendarTime(error);
}

UDate
icu4js::DateFormat::AddToField(double epoch_millis,
                               UCalendarDateFields field,
                               double delta,
                               Error& error) {
    error.Reset();

    SetDefaultCalendarTime(epoch_millis, error);
    if (!error.IsSuccess()) {
        return (UDate)epoch_millis;
    }

    UErrorCode err_code = U_ZERO_ERROR;
    // Note (sunny): Calendar::add takes only supports
    // int32_t amount which does not cover all possible
    // ranges for milliseconds. Since milliseconds/second
    // conversion is locale independent we add seconds
    // instead of milliseconds
    if (field == UCalendarDateFields::UCAL_MILLISECOND) {
        field = UCalendarDateFields::UCAL_SECOND;
        delta = delta/1000;
    }

    this->default_calendar->add(field, (int32_t)delta, err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code,
                  "Error in adding to default calendar field");
        return (UDate)epoch_millis;
    }
    return GetDefaultCalendarTime(error);
}

int32_t
icu4js::DateFormat::GetFieldDifference(double begin_millis,
                                       double end_millis,
                                       UCalendarDateFields field,
                                       Error& error) { // NOLINT
    error.Reset();
    SetDefaultCalendarTime(begin_millis, error);
    if (!error.IsSuccess()) {
        return 0;
    }

    UErrorCode err_code = U_ZERO_ERROR;
    int32_t difference =
        this->default_calendar->fieldDifference(end_millis,
                                                field,
                                                err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code,
                  "Error in adding to default calendar field");
        return 0;
    }
    return difference;
}

UDate
icu4js::DateFormat::RoundToField(double epoch_millis,
                                 UCalendarDateFields field,
                                 bool round_down,
                                 Error& error) { // NOLINT
    error.Reset();
    SetDefaultCalendarTime(epoch_millis, error);
    if (!error.IsSuccess()) {
        return 0;
    }

    roundToField(field,
                 *(this->default_calendar),
                 round_down,
                 error);
    return this->GetDefaultCalendarTime(error);
}

UDate
icu4js::DateFormat::GetStartOfField(double epoch_millis,
                                    UCalendarDateFields field,
                                    Error& error) { // NOLINT
    return this->RoundToField(epoch_millis, field, TRUE, error);
}

UDate
icu4js::DateFormat::GetEndOfField(double epoch_millis,
                                  UCalendarDateFields field,
                                  Error& error) { // NOLINT
    return this->RoundToField(epoch_millis, field, FALSE, error);
}

wstring
icu4js::DateFormat::FormatRelative(double delta_millis, Error& error) { // NOLINT
    UErrorCode err_code = U_ZERO_ERROR;
    UnicodeString formatted;
    double quantum;
    URelativeDateTimeUnit unit
        = getDateTimeUnitForTimeDelta(delta_millis, quantum);
    this->relative_formatter->format(quantum,
                                     unit,
                                     formatted,
                                     err_code);
    if (U_FAILURE(err_code)) {
        error.Set(err_code,
                  "Failure in formatting relative duration "
                  + to_string(delta_millis));
        return L"";
    }
    return Util::UnicodeStringToWString(formatted);
}


#ifndef BUILD_PACKAGE_SCRIPT

EMSCRIPTEN_BINDINGS(icu4js_date_format) {
    emscripten::enum_<UCalendarDateFields>("CalendarDateField")
    .value("ERA",
           UCalendarDateFields::UCAL_ERA)
    .value("YEAR",
           UCalendarDateFields::UCAL_YEAR)
    .value("MONTH",
           UCalendarDateFields::UCAL_MONTH)
    .value("WEEK_OF_YEAR",
           UCalendarDateFields::UCAL_WEEK_OF_YEAR)
    .value("WEEK_OF_MONTH",
           UCalendarDateFields::UCAL_WEEK_OF_MONTH)
    .value("DATE",
           UCalendarDateFields::UCAL_DATE)
    .value("DAY_OF_MONTH",
           UCalendarDateFields::UCAL_DAY_OF_MONTH)
    .value("DAY_OF_YEAR",
           UCalendarDateFields::UCAL_DAY_OF_YEAR)
    .value("DAY_OF_WEEK",
           UCalendarDateFields::UCAL_DAY_OF_WEEK)
    .value("DAY_OF_WEEK_IN_MONTH",
           UCalendarDateFields::UCAL_DAY_OF_WEEK_IN_MONTH)
    .value("AM_PM",
           UCalendarDateFields::UCAL_AM_PM)
    .value("HOUR",
           UCalendarDateFields::UCAL_HOUR)
    .value("HOUR_OF_DAY",
           UCalendarDateFields::UCAL_HOUR_OF_DAY)
    .value("MINUTE",
           UCalendarDateFields::UCAL_MINUTE)
    .value("SECOND",
           UCalendarDateFields::UCAL_SECOND)
    .value("MILLISECOND",
           UCalendarDateFields::UCAL_MILLISECOND)
    .value("ZONE_OFFSET",
           UCalendarDateFields::UCAL_ZONE_OFFSET)
    .value("DST_OFFSET",
           UCalendarDateFields::UCAL_DST_OFFSET)
    .value("YEAR_WOY",
           UCalendarDateFields::UCAL_YEAR_WOY)
    .value("DOW_LOCAL",
           UCalendarDateFields::UCAL_DOW_LOCAL)
    .value("EXTENDED_YEAR",
           UCalendarDateFields::UCAL_EXTENDED_YEAR)
    .value("JULIAN_DAY",
           UCalendarDateFields::UCAL_JULIAN_DAY)
    .value("MILLISECONDS_IN_DAY",
           UCalendarDateFields::UCAL_MILLISECONDS_IN_DAY)
    .value("IS_LEAP_MONTH",
           UCalendarDateFields::UCAL_IS_LEAP_MONTH);

    emscripten::class_<icu4js::DateFormat>("DateFormat")
    .constructor<Error&>()
    .class_function("getTimeZoneOffset", &icu4js::DateFormat::GetTimeZoneOffset)
    .function("format", &icu4js::DateFormat::Format)
    .function("parse", &icu4js::DateFormat::Parse)
    .function("getLocalizedPattern", &icu4js::DateFormat::GetLocalizedPattern)
    .function("setTimeZone", &icu4js::DateFormat::SetTimeZone)
    .function("getField", &icu4js::DateFormat::GetField)
    .function("setField", &icu4js::DateFormat::SetField)
    .function("addToField", &icu4js::DateFormat::AddToField)
    .function("getFieldDifference", &icu4js::DateFormat::GetFieldDifference)
    .function("getStartOfField", &icu4js::DateFormat::GetStartOfField)
    .function("getEndOfField", &icu4js::DateFormat::GetEndOfField)
    .function("formatRelative", &icu4js::DateFormat::FormatRelative);
}
#endif  // BUILD_PACKAGE_SCRIPT

