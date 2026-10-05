# Mwest Clock

A customizable clock, date, location, and weather overlay for OBS Studio. It runs through GitHub Pages—no local server, `.bat` file, Streamer.bot connection, or weather API key required.

## Open the clock

### [Open the Mwest Clock Settings Page](https://mwest34.github.io/mwest_clock/)

Choose your settings, click **Save Settings**, click **Copy OBS URL**, and paste the generated URL into an OBS Browser Source.

## Features

- Local 12-hour or 24-hour time with optional seconds
- Free-form date formats
- Broad date/time locale support, including Arabic, Chinese, French, German, Hindi, Japanese, Korean, Spanish, and many more
- ZIP-code weather with Fahrenheit or Celsius
- Weather icons and optional condition text
- City and state displayed together or separately
- Reorder time, date, city, state, and weather
- One, two, three, or four-line layouts
- Independent styling for every line
- Optional individual colors for time, date, city, state, and weather
- Installed Windows font detection
- Custom drop shadow
- Explicit Save Settings and Copy OBS URL workflow
- Export, import, and Restore Defaults

## Recommended setup order

1. Choose a language.
2. Install or select a font.
3. Arrange the content and layout.
4. Set optional individual item colors.
5. Configure time and date.
6. Configure location and weather.
7. Style each line.
8. Configure shadow and appearance.
9. Click **Save Settings**.
10. Click **Copy OBS URL**.

## Add it to OBS

1. Open the [settings page](https://mwest34.github.io/mwest_clock/).
2. Customize the clock while watching the live preview.
3. Click **Save Settings**.
4. Click **Copy OBS URL**.
5. Add a new **Browser Source** in OBS.
6. Paste the copied URL.
7. Set the source to **1920 × 1080**, then position or crop it as needed.

After making changes later, save again and replace the URL in OBS.

## Languages

All 31 languages plus Automatic translate the settings interface, date/time output, and weather descriptions. Automatic uses the browser’s preferred supported language and falls back to English. Arabic and Hebrew use RTL presentation; existing OBS URLs remain compatible. See Complete language support below for the catalog and maintenance details.

## Fonts

For reliable OBS behavior, fonts must be installed on the same computer running OBS. Selecting an installed font does not embed its file in the URL. Legacy URLs and imports containing embedded fonts remain supported; those URLs can still be extremely long and may be truncated by OBS.

1. Click **Open Windows Fonts** to review installed fonts.
2. Use **Download More Fonts** if needed. Third-party font licenses vary.
3. Download and extract the font.
4. Right-click the actual `.ttf` or `.otf` file and choose **Install for all users**.
5. Completely restart Chrome or Edge and OBS.
6. Click **Refresh Installed Fonts**.
7. Search for and select the font.
8. Save settings before copying the OBS URL.

Anyone using a shared URL must also have that font installed. If the font is unavailable, the clock uses a fallback font.

## Item colors

Line colors remain the default. Open **Item Colors** to optionally give Time, Date, City, State, or Weather its own color—even when everything is displayed on one long line. Turn an item’s custom color off to make it follow the line color again. Separators continue using the line color.

## Date formats

The Date Format box supports:

| Token | Meaning | Example |
|---|---|---|
| `M` | Month number | 9 |
| `MM` | Two-digit month | 09 |
| `MMM` | Short month name | Sep |
| `MMMM` | Full month name | September |
| `D` | Day number | 9 |
| `DD` | Two-digit day | 09 |
| `ddd` | Short weekday | Wed |
| `dddd` | Full weekday | Wednesday |
| `YY` | Two-digit year | 26 |
| `YYYY` | Four-digit year | 2026 |

Examples include `MM/DD/YY`, `MM/DD/YYYY`, `DD/MM/YYYY`, `YYYY-MM-DD`, and `dddd, MMMM D, YYYY`.

## Weather

Weather is based on a U.S. ZIP code through Zippopotam.us and Open-Meteo.

- No API key is required.
- Fahrenheit and Celsius are supported.
- Refresh every 10, 15, 30, or 60 minutes.
- Weather requests are lightweight.
- The clock waits for verified weather data instead of briefly showing a fake location or condition.
- ZIP or temperature-unit changes cancel older requests, so a late response cannot replace newer weather.
- Appearance-only changes reuse the current weather instead of contacting the weather services again.
- Weather requests time out safely after 12 seconds. The clock and date continue running if either service is unavailable or returns invalid data.

## Saving and sharing

- **Save Settings** locks in the current configuration for the next copied URL.
- **Copy OBS URL** copies only the last saved configuration.
- **Export** downloads a JSON backup.
- **Import** loads a JSON backup.
- **Restore Defaults** loads the original factory configuration into an unsaved draft and immediately refreshes the controls and preview. Your previous saved settings stay protected until you click **Save Settings**. Copy OBS URL is blocked while this draft is unsaved. Closing or refreshing the page before saving reloads your previous saved configuration.

## Troubleshooting

### A newly installed font is missing

Install it for all users, completely restart Chrome or Edge and OBS, click **Refresh Installed Fonts**, and search for the font’s internal family name.

### The preview and OBS look different

Click **Save Settings**, copy the new OBS URL, replace the existing URL in OBS, and select **Refresh cache of current page**.

### The clock or preview is stuck

Use **Restore Defaults** to load a clean factory draft, or use the `?reset=1` recovery link below. Neither action overwrites saved settings automatically. The link removes its reset flag after loading, so refreshing before Save Settings reloads your previous saved configuration. Click **Save Settings** only when you want to keep the defaults:

[Load a clean factory draft](https://mwest34.github.io/mwest_clock/?reset=1)

### Weather is unavailable

Confirm the ZIP code, click **Test ZIP & Weather**, and verify that the streaming computer has internet access. The clock continues running during temporary weather failures.

## Hosting

- Settings: https://mwest34.github.io/mwest_clock/
- Repository: https://github.com/Mwest34/mwest_clock

The settings page does not need to remain open while OBS is using the clock.

## Safety regression tests

With Node.js installed, run `node --test tests/*.test.cjs` for the assertion-based safety, compatibility, and weather-concurrency tests. Run `node tests/audit-observations.cjs` to repeat the original diagnostic audit scenarios. The latter reports observations rather than pass/fail assertions. Neither command changes application settings or contacts weather services.



## Complete language support

All 31 selectable languages translate the settings interface, dynamic controls, help, accessible labels, action messages, and weather descriptions: English, Arabic, Bulgarian, Simplified Chinese, Traditional Chinese, Czech, Danish, Dutch, Finnish, French, German, Greek, Hebrew, Hindi, Hungarian, Indonesian, Italian, Japanese, Korean, Norwegian Bokmål, Polish, Portuguese, Romanian, Russian, Slovak, Spanish, Swedish, Thai, Turkish, Ukrainian, and Vietnamese. Dates and times use the browser’s `Intl` locale data; numeric date-pattern tokens keep their existing behavior.

Automatic chooses the first supported language in your browser’s preferences. Regional preferences such as es-MX, fr-CA, and pt-BR retain their date/time locale. Chinese script/region preferences choose Simplified or Traditional Chinese; unsupported preferences fall back to English. Arabic and Hebrew use a right-to-left settings interface. Clock item order and saved left/center/right alignment remain unchanged. Font glyph coverage and locale data available in the browser or OBS still affect rendering.

`translations.js` contains complete, independently editable dictionaries with stable keys. `i18n.js` resolves locales, substitutes named parameters, and falls back to English for a missing locale or key. Language names use `Intl.DisplayNames`, with translated dictionary names when it is unavailable. Translations and user text are rendered as plain text or escaped before entering generated controls; only the application’s own weather icon markup is HTML. No runtime translation service is used.

Existing language codes, saved configurations, legacy dates/fonts, `#c=` OBS URLs, and legacy `?c=` URLs remain supported. Switching languages immediately updates controls and preview without modifying saved settings until Save Settings. Factory weather defaults remain ZIP 90061, Fahrenheit, and a 30-minute refresh.

Run `node --test tests/*.test.cjs` for the complete language, safety, restore-defaults, compatibility, and weather regression suite. Run `node tests/audit-observations.cjs` for diagnostic scenarios. Syntax-check each JavaScript and test file with `node --check`. Tests use mocked weather and do not change browser settings.

Preview document URLs and asset links carry a release version so the settings page cannot reuse a previous release’s cached clock HTML. Copy OBS URL retains the established URL format and configuration encoding. Existing browser or OBS tabs may need a refresh to load a new release.
