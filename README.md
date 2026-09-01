# Mwest Clock

A customizable clock, date, location, and weather overlay for OBS Studio. It runs as a browser source through GitHub Pages—no local server, `.bat` file, Streamer.bot connection, or weather API key required.

## Open the clock

### [Open the Mwest Clock Settings Page](https://mwest34.github.io/mwest_clock/)

Build your clock on the settings page, click **Copy OBS URL**, and paste the generated URL into an OBS Browser Source.

## Features

- Local 12-hour or 24-hour time
- Optional seconds
- Free-form date formats
- ZIP-code weather with Fahrenheit or Celsius
- Weather icons and optional condition text
- City and state displayed together or separately
- Reorder time, date, city, state, and weather
- One, two, three, or four-line layouts
- Independent size, weight, color, opacity, alignment, transform, and letter spacing for every line
- Custom separators and line spacing
- Custom drop-shadow color, opacity, position, and blur
- Included fonts, installed-system font detection, Google Fonts, and uploaded font files
- English, Spanish, and French settings and clock output
- Automatic browser-language detection
- Export and import settings
- One-click reset and recovery

## Add it to OBS

1. Open the [settings page](https://mwest34.github.io/mwest_clock/).
2. Customize the clock while watching the live preview.
3. Click **Copy OBS URL**.
4. In OBS, add a new **Browser Source**.
5. Paste the copied URL.
6. Set the Browser Source to **1920 × 1080**, then position or crop the clock as needed.

When you change settings later, copy the newly generated OBS URL and replace the previous URL in OBS.

## Languages

Use the **Language** dropdown at the top of the settings page:

- **Automatic** follows the browser’s preferred language when supported.
- **English**
- **Español**
- **Français**

The selection immediately updates the settings page, date and time localization, and weather description in the preview. The copied OBS URL carries the selected language into OBS.

## Date formats

The Date Format box accepts free-form combinations of these tokens:

| Token | Meaning | Example |
|---|---|---|
| `M` | Month number | 8 |
| `MM` | Two-digit month | 08 |
| `MMM` | Short month name | Aug |
| `MMMM` | Full month name | August |
| `D` | Day number | 28 |
| `DD` | Two-digit day | 28 |
| `ddd` | Short weekday | Fri |
| `dddd` | Full weekday | Friday |
| `YY` | Two-digit year | 26 |
| `YYYY` | Four-digit year | 2026 |

Examples:

- `MM/DD/YY` → 08/28/26
- `MM/DD/YYYY` → 08/28/2026
- `DD/MM/YYYY` → 28/08/2026
- `YYYY-MM-DD` → 2026-08-28
- `dddd, MMMM D, YYYY` → Friday, August 28, 2026

Month and weekday names follow the selected language.

## Fonts

### Installed fonts

1. Install the font in Windows. **Install for all users** is recommended.
2. Completely restart Chrome or Edge.
3. Click **Check Installed Fonts**.
4. Allow font access when prompted.
5. Search using the font’s internal family name. For example, a downloaded Pokémon font may appear as **Pokemon Solid** or **Pokemon Hollow**.

Installed-font scanning requires a compatible desktop browser such as Chrome or Edge. OBS may not have direct access to every Windows font, so uploading the font file is more reliable.

### Upload a font

1. Download and unzip the font.
2. Select the actual `.ttf`, `.otf`, `.woff`, or `.woff2` file.
3. Upload it on the settings page.
4. Copy the updated OBS URL.

Only upload fonts you have permission to use. Uploaded font data is stored inside the generated URL fragment so GitHub does not receive or store the font file.

### Google Fonts

Choose **Use my custom font**, enter the exact font-family name, and paste its Google Fonts stylesheet link.

## Weather

Weather is based on the selected U.S. ZIP code. The clock resolves the ZIP code through Zippopotam.us and loads current conditions through Open-Meteo.

- No API key is required.
- Choose Fahrenheit or Celsius.
- Refresh every 10, 15, 30, or 60 minutes.
- Weather requests are lightweight and should have no noticeable effect on streaming performance.

## Saving and sharing settings

Clock settings are encoded in the copied OBS URL. This makes each URL portable and avoids requiring an account or background program.

- **Export** downloads a JSON backup.
- **Import** restores a JSON backup.
- **Reset** clears saved clock settings, restores defaults, and reloads the preview.

Do not publicly share an OBS URL that contains an uploaded commercial font unless its license permits redistribution.

## Troubleshooting

### The preview says “URI Too Long”

Current clock links store configuration after `#`, preventing GitHub from receiving the long settings data. Refresh the settings page with **Ctrl + F5** and create a new OBS URL.

### The clock or preview is stuck

Use the Reset button or open the recovery link:

[Reset and restore Mwest Clock](https://mwest34.github.io/mwest_clock/?reset=1)

This clears the saved browser settings and restores the default clock.

### A newly installed font is missing

Restart Chrome or Edge, click **Check Installed Fonts**, approve font access, and search for the font’s internal family name.

### OBS still shows old settings

Copy the newest OBS URL, replace the old URL in the Browser Source, and click **Refresh cache of current page** in OBS.

### Weather is unavailable

Confirm the ZIP code, click **Test ZIP & Weather**, and verify that the streaming computer has internet access. The clock continues running if a weather request temporarily fails.

## Hosting

The project is hosted free through GitHub Pages:

- Settings: https://mwest34.github.io/mwest_clock/
- Repository: https://github.com/Mwest34/mwest_clock

The hosted clock does not require an open settings window or any additional program running in the background.
