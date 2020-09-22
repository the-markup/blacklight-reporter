## Blacklight Reporter

- [Blacklight Reporter](#blacklight-reporter)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Reports](#reports)
    - [summary.csv](#summarycsv)
    - [canvas_fingerprinters.csv](#canvas_fingerprinterscsv)
    - [cookies.csv](#cookiescsv)
    - [fb_pixel_events.csv](#fb_pixel_eventscsv)
    - [key_logging.csv](#key_loggingcsv)
    - [third_party_trackers.csv](#third_party_trackerscsv)
    - [session_recorders.csv](#session_recorderscsv)
  - [Licensing](#licensing)

This repository contains the code for generating reports from a collection of `blacklight-collector` inspections.

For more information about the data generated in an inspection please visit the [`blacklight-collector` repository](https://github.com/the-markup/blacklight-collector).

### Installation

This project utilizes the node `aws-sdk` to read files from public S3 buckets.

1. Download the TrackerRadar Dataset and save it at `data/tracker-radar`. (Latest release as of this writing [2020.08](https://github.com/duckduckgo/tracker-radar/releases/tag/2020.08))
2. `npm install`
3. `npm run build`

### Usage

To generate the reports for a sample ofthe most popular 100,000 websites used in our story [The High Privacy Cost of a ‘Free’ Website](https://themarkup.org/blacklight/2020/09/22/blacklight-tracking-advertisers-digital-privacy-sensitive-websites).

(This will take around 10 minutes to download and generate)

```
node cli.js -i s3://markup-public-data/blacklight/100k-survey-scans/ -o ./data
```

The generated reports will be stored in the `data` folder.

If you want to generate reports for your own inspections replace the s3 urls with a glob path to local inspections. Reports for local inspections will be stored in `data/local-inspections`. To test this out you can run it on the inspections in the `__tests__` folder.

```
node cli.js -i "./__tests__/test-data/**" -o ./data
```

### Reports

`blacklight-reporter` generates the following reports:

#### summary.csv

A summary of all the tests for each scanned website.

| Column                                  | Description                                                               |
| :-------------------------------------- | :------------------------------------------------------------------------ |
| `inspection_path`                       | contains the data we used as input for the story and the web application. |
| `origin_domain`                         | Website being inspected.                                                  |
| `no_data`                               | Was the capture successful?                                               |
| `has_tracking_requests`                 | Does this website have tracking requests.                                 |
| `has_third_party_cookies`               | Does this website have third-party cookies.                               |
| `has_first_party_canvas_fingerprinters` | Does this website have first-party canvas fingerprinters.                 |
| `has_third_party_canvas_fingerprinters` | Does this website have third-party canvas fingerprinters.                 |
| `has_session_recorders`                 | Does this website use session recorders.                                  |
| `has_key_loggers`                       | Was key logging detected on this website.                                 |

#### canvas_fingerprinters.csv

[Read our Methodology](https://themarkup.org/blacklight/2020/09/22/how-we-built-a-real-time-privacy-inspector#canvas-fingerprinting)

| Column                             | Description                                                                                           |
| :--------------------------------- | :---------------------------------------------------------------------------------------------------- |
| `origin_domain`                    | The URL of the website being scanned by `blacklight-collector`.                                       |
| `script_domain`                    | The domain that loaded the script detected doing canvas fingerprinting.                               |
| `script_url`                       | The full URL for the script including URL query parameters.                                           |
| `script_url_path`                  | The full URL for the script exluding URL query parameters.                                            |
| `script_domain_owner`              | The corporate entity associated with the `script_domain` in Tracker Radar.                            |
| `script_domain_tracker_categories` | The categories indicating the purpose of the `script_domain` in Tracker Radar                         |
| `start_time`                       | The date and time when the scan of the website began.                                                 |
| `end_time`                         | The date and time when the scan of the website ended.                                                 |
| `blacklight_version`               | The `blacklight-collector` version used for the scan.                                                 |
| `script_is_third_party`            | Does the `script_domain` point to a domain different from the `origin_domain`.                        |
| `texts`                            | Arguments for calls to `CanvasRenderingContext2D.fillText` and `CanvasRenderingContext2D.strokeText`. |
| `styles`                           | Arguments for set operation on `CanvasRenderingContext2D.fillStyle`.                                  |
| `data_url`                         | Return value for calls to `HTMLCanvasElement.toDataURL` (The fingerprint).                            |
| `text_measure`                     | Arguments for calls to `CanvasRenderingContext2D.measureText`.                                        |
| `canvas_font`                      | Arguements for calls to `CanvasRenderingContext2D.font`.                                              |

#### cookies.csv

[Read our Methodology](https://themarkup.org/blacklight/2020/09/22/how-we-built-a-real-time-privacy-inspector#third-party-cookies)

| Column                             | Description                                                                                                                              |
| :--------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `origin_domain`                    | The URL of the website being scanned by `blacklight-collector`.                                                                          |
| `script_domain`                    | The domain that loaded the script detected doing canvas fingerprinting.                                                                  |
| `script_url`                       | The full URL for the script including URL query parameters.                                                                              |
| `script_url_path`                  | The full URL for the script exluding URL query parameters.                                                                               |
| `script_domain_owner`              | The corporate entity associated with the `script_domain` in Tracker Radar.                                                               |
| `script_domain_tracker_categories` | The categories indicating the purpose of the `script_domain` in Tracker Radar                                                            |
| `start_time`                       | The date and time when the scan of the website began.                                                                                    |
| `end_time`                         | The date and time when the scan of the website ended.                                                                                    |
| `blacklight_version`               | The `blacklight-collector` version used for the scan.                                                                                    |
| `script_is_third_party`            | Does the `script_domain` point to a domain different from the `origin_domain`.                                                           |
| `cookie_domain`                    | The domain where the cookie is being sent.                                                                                               |
| `cookie_domain_owner`              | The corporate entity associated with the `cookie_domain` in Tracker Radar.                                                               |
| `cookie_domain_tracker_categories` | The categories indicating the purpose of the `cookie_domain` in Tracker Radar.                                                           |
| `cookie_is_third_party`            | Does the `cookie _domain` point to a domain different from the `origin_domain`                                                           |
| `cookie_type`                      | Whether the cookie was set using HTTP or Javascript.                                                                                     |
| `is_session`                       | Is the cookie erased from the user's device after the browser window is closed?                                                          |
| `type`                             | Whether the cookie was set using HTTP or Javascript.                                                                                     |
| `expires`                          | The date and time the cookie is automatically erased from the user’s device.                                                             |
| `is_secure`                        | Can the cookie only be transmitted over an encrypted HTTPS connections.                                                                  |
| `is_http_only`                     | Can the cookie only be set using HTTP, not Javascript?                                                                                   |
| `name`                             | The name identifying the cookie that is sent to the `cookie_domain`.                                                                     |
| `value`                            | A string of data stored in the cookie that is sent to the Cookie Domain, often a unique identifier matched to a specific user or device. |

#### fb_pixel_events.csv

[Read our Methodology](https://themarkup.org/blacklight/2020/09/22/how-we-built-a-real-time-privacy-inspector#facebook-pixel)

| Column                             | Description                                                                                                                                                                       |
| :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `origin_domain`                    | The URL of the website being scanned by `blacklight-collector`.                                                                                                                   |
| `script_domain`                    | The domain that loaded the script detected doing canvas fingerprinting.                                                                                                           |
| `script_url`                       | The full URL for the script including URL query parameters.                                                                                                                       |
| `script_url_path`                  | The full URL for the script exluding URL query parameters.                                                                                                                        |
| `script_domain_owner`              | The corporate entity associated with the `script_domain` in Tracker Radar.                                                                                                        |
| `script_domain_tracker_categories` | The categories indicating the purpose of the `script_domain` in Tracker Radar                                                                                                     |
| `start_time`                       | The date and time when the scan of the website began.                                                                                                                             |
| `end_time`                         | The date and time when the scan of the website ended.                                                                                                                             |
| `blacklight_version`               | The `blacklight-collector` version used for the scan.                                                                                                                             |
| `script_is_third_party`            | Does the `script_domain` point to a domain different from the `origin_domain`.                                                                                                    |
| `eventName`                        | Name of the event being sent to Facebook from the pixel.                                                                                                                          |
| `eventDescription`                 | The description for standard events as document [here](https://web.archive.org/web/20200519201636/https://developers.facebook.com/docs/facebook-pixel/reference).                 |
| `pageUrl`                          | pageUrl as listed in the `dl` key of the pixel event.                                                                                                                             |
| `isStandardEvent`                  | Is this is a standard pixel event?                                                                                                                                                |
| `dataParams`                       | Additional data parameters being sent to Facebook.                                                                                                                                |
| `advancedMatchingParams`           | [Advanced matching parameters](https://web.archive.org/web/20200413102542/https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching) being sent to Facebook. |

#### key_logging.csv

[Read our Methodology](https://themarkup.org/blacklight/2020/09/22/how-we-built-a-real-time-privacy-inspector#key-logging)

| Column                             | Description                                                                           |
| :--------------------------------- | :------------------------------------------------------------------------------------ |
| `origin_domain`                    | The URL of the website being scanned by `blacklight-collector`.                       |
| `script_domain`                    | The domain that loaded the script detected doing canvas fingerprinting.               |
| `script_url`                       | The full URL for the script including URL query parameters.                           |
| `script_url_path`                  | The full URL for the script exluding URL query parameters.                            |
| `script_domain_owner`              | The corporate entity associated with the `script_domain` in Tracker Radar.            |
| `script_domain_tracker_categories` | The categories indicating the purpose of the `script_domain` in Tracker Radar         |
| `start_time`                       | The date and time when the scan of the website began.                                 |
| `end_time`                         | The date and time when the scan of the website ended.                                 |
| `blacklight_version`               | The `blacklight-collector` version used for the scan.                                 |
| `script_is_third_party`            | Does the `script_domain` point to a domain different from the `origin_domain`.        |
| `input_field_types`                | The labels associated with the input fields where keylogging was detected.            |
| `input_text`                       | The text `blacklight-collector` entered into the input fields that was then recorded. |
| `match_type`                       | If the text sent in the network request was hashed or sent in plain text.             |

#### third_party_trackers.csv

[Read our Methodology](https://themarkup.org/blacklight/2020/09/22/how-we-built-a-real-time-privacy-inspector#ad-trackers)

| Column                             | Description                                                                    |
| :--------------------------------- | :----------------------------------------------------------------------------- |
| `origin_domain`                    | The URL of the website being scanned by `blacklight-collector`.                |
| `script_domain`                    | The domain that loaded the script detected doing canvas fingerprinting.        |
| `script_url`                       | The full URL for the script including URL query parameters.                    |
| `script_url_path`                  | The full URL for the script exluding URL query parameters.                     |
| `script_domain_owner`              | The corporate entity associated with the `script_domain` in Tracker Radar.     |
| `script_domain_tracker_categories` | The categories indicating the purpose of the `script_domain` in Tracker Radar  |
| `start_time`                       | The date and time when the scan of the website began.                          |
| `end_time`                         | The date and time when the scan of the website ended.                          |
| `blacklight_version`               | The `blacklight-collector` version used for the scan.                          |
| `script_is_third_party`            | Does the `script_domain` point to a domain different from the `origin_domain`. |
| `easy_list_filter`                 | The filter from the EasyList that was matched.                                 |
| `easy_list_params`                 | URL parameters for the network request that matched the EasyList filter.       |

#### session_recorders.csv

[Read our Methodology](https://themarkup.org/blacklight/2020/09/22/how-we-built-a-real-time-privacy-inspector#session-recorders)

| Column                             | Description                                                                                             |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `origin_domain`                    | The URL of the website being scanned by `blacklight-collector`.                                         |
| `script_domain`                    | The domain that loaded the script detected doing canvas fingerprinting.                                 |
| `script_url`                       | The full URL for the script including URL query parameters.                                             |
| `script_url_path`                  | The full URL for the script exluding URL query parameters.                                              |
| `script_domain_owner`              | The corporate entity associated with the `script_domain` in Tracker Radar.                              |
| `script_domain_tracker_categories` | The categories indicating the purpose of the `script_domain` in Tracker Radar                           |
| `start_time`                       | The date and time when the scan of the website began.                                                   |
| `end_time`                         | The date and time when the scan of the website ended.                                                   |
| `blacklight_version`               | The `blacklight-collector` version used for the scan.                                                   |
| `script_is_third_party`            | Does the `script_domain` point to a domain different from the `origin_domain`.                          |
| `key_event_monitoring`             | Did `blacklight-collector` observe any key event listeners being set by the session recording script.   |
| `key_logging_detected`             | Did `blacklight-collector` observe any key logging taking places during the inspection.                 |
| `mouse_event_monitoring`           | Did `blacklight-collector` observe any mouse event listeners being set by the session recording script. |
| `touch_event_monitoring`           | Did `blacklight-collector` observe any touch event listeners being set by the session recording script. |

### Licensing

Copyright 2020, The Markup News Inc.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

    Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
