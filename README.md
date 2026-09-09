# Mwest Clock

A customizable clock, date, location, and weather overlay for OBS Studio. It runs through GitHub Pages—no local server, `.bat` file, Streamer.bot connection, or weather API key required.

## Open the clock

### [Open the Mwest Clock Settings Page](https://mwest34.github.io/mwest_clock/)

Choose your settings, click **Save Settings**, click **Copy OBS URL**, and paste the generated URL into an OBS Browser Source.

## Features

- Local 12-hour or 24-hour time with optional seconds
- Free-form date formats
- Broad date/time locale support, including Arabic, Chinese, French, German, Hindi, Japanese, Korean, Spanish, and many more
- English, Spanish, and French settings-interface translations
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
- Export, import, reset, and recovery

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

The Language dropdown includes Automatic plus 31 selectable languages comparable to the reference clock. All listed languages localize supported browser date and time output.

The full settings interface is currently translated into:

- English
- Spanish
- French

When another output language is selected, settings controls remain in English. Weather descriptions are localized in English, Spanish, and French; other languages currently retain English weather descriptions.

## Fonts

For reliable OBS behavior, fonts must be installed on the same computer running OBS. The clock no longer places entire font files inside the URL because extremely long URLs may be truncated by OBS.

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

## Saving and sharing

- **Save Settings** locks in the current configuration for the next copied URL.
- **Copy OBS URL** copies only the last saved configuration.
- **Export** downloads a JSON backup.
- **Import** loads a JSON backup.
- **Reset** restores and saves the defaults.

## Troubleshooting

### A newly installed font is missing

Install it for all users, completely restart Chrome or Edge and OBS, click **Refresh Installed Fonts**, and search for the font’s internal family name.

### The preview and OBS look different

Click **Save Settings**, copy the new OBS URL, replace the existing URL in OBS, and select **Refresh cache of current page**.

### The clock or preview is stuck

Use Reset or open the recovery link:

[Reset and restore Mwest Clock](https://mwest34.github.io/mwest_clock/?reset=1)

### Weather is unavailable

Confirm the ZIP code, click **Test ZIP & Weather**, and verify that the streaming computer has internet access. The clock continues running during temporary weather failures.

## Hosting

- Settings: https://mwest34.github.io/mwest_clock/
- Repository: https://github.com/Mwest34/mwest_clock

The settings page does not need to remain open while OBS is using the clock.
