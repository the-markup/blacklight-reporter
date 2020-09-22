import { parseInspection, getBlTestEvents } from "../src/inspection-parser";
import {
  BlacklightTestCanvasFp,
  BlacklightTestCookies,
  BlacklightTestThirdPartyTrackers,
  BlacklightTestKeyLogging,
} from "../src/types";
import { loadTrackerRadar } from "../src/utils";
const fs = require("fs");
const path = require("path");
const ACCENTURE = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "./test-data/2.1.1/accenture.inspection.json"),
    "utf-8"
  )
);
const JETBLUE = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "./test-data/2.0.0/jetblue.inspection.json"),
    "utf-8"
  )
);
const BLACKLIGHT_VERSION = "2.1.1";
const TR_DATA_PATH = path.join(__dirname, "../data/tracker-radar");
it("can parse session recording events", async () => {
  const baseEvent = {
    origin_domain: ACCENTURE.host,
    session_name: ACCENTURE.title,
    category: "session_recorders",
  };
  const lookupData = {
    key_loggers: ACCENTURE.key_logging
      ? Object.keys(ACCENTURE.reports.key_logging)
      : "",
    behaviour_event_listeners: ACCENTURE.reports.behaviour_event_listeners,
  };
  const trData = await loadTrackerRadar(TR_DATA_PATH);
  const events = await parseInspection("session_recorders", {
    data: ACCENTURE.reports.session_recorders,
    baseEvent,
    lookupData,
    trData,
  });
  const metadataFields = new Set();

  events.forEach((e) => {
    Object.keys(e.test_data).map((m) => metadataFields.add(m));
  });
  expect(Array.from(metadataFields).sort()).toEqual(
    [
      "key_event_monitoring",
      "key_logging_detected",
      "meets_conditions",
      "mouse_event_monitoring",
      "touch_event_monitoring",
    ].sort()
  );
});
it("can check for third party domains and domain owner data where available", async () => {
  const trData = await loadTrackerRadar(TR_DATA_PATH);
  const events = await getBlTestEvents(
    ACCENTURE,
    path.join(__dirname, "./test-data/2.0.0/jetblue.inspection.json"),
    trData
  );
  const version = new Set();
  const start_time = new Set();
  const end_time = new Set();
  const first_party = new Set();
  const third_party = new Set();
  const clean_script_urls = new Set();
  const script_domains = new Set();
  const domain_owners = new Set();
  const owner_source = new Set();
  const tr_tracker_categories = new Set([]);
  events.forEach((e) => {
    // console.log(e);
    if (e.script_is_third_party) {
      third_party.add(e.script_domain);
    } else {
      first_party.add(e.origin_domain);
      first_party.add(e.script_domain);
    }
    clean_script_urls.add(e.script_url_path);
    version.add(e.blacklight_version);
    script_domains.add(e.script_domain);
    domain_owners.add(e.script_domain_owner);
    owner_source.add(e.script_domain_owner);
    start_time.add(e.start_time);
    end_time.add(e.end_time);
    e.script_domain_tracker_categories.forEach((t) =>
      tr_tracker_categories.add(t)
    );
  });
  console.log(first_party);
  expect(version.size).toBe(1);
  expect(version.has(BLACKLIGHT_VERSION)).toBe(true);
  expect(clean_script_urls.has(undefined)).toBe(false);
  expect(script_domains.has(undefined)).toBe(false);
  expect(owner_source.has(undefined)).toBe(false);
  expect(domain_owners.has(undefined)).toBe(false);
  expect(tr_tracker_categories.has(undefined)).toBe(false);
  expect(start_time.has(undefined)).toBe(false);
  expect(end_time.has(undefined)).toBe(false);
  expect(first_party.size).toBe(3);
  expect(first_party.has(ACCENTURE.host)).toBe(true);
  expect(first_party.has("")).toBe(true);
  expect(Array.from(first_party)[0]).toEqual(ACCENTURE.host);
  expect(third_party.size).toBeGreaterThan(1);
  expect(Array.from(third_party).includes(ACCENTURE.host)).toBe(false);
});
// it("can parse fingerprintable_api_calls", async () => {
//   const trData = await loadTrackerRadar(TR_DATA_PATH);
//   const baseEvent = {
//     origin_domain: ACCENTURE.host,
//     session_name: ACCENTURE.title,
//     category: "fingerprintable_api_calls",
//   };

//   const events = parseInspection("fingerprintable_api_calls", {
//     data: ACCENTURE.reports.fingerprintable_api_calls,
//     baseEvent,
//     trData,
//   });
//   const metadataFields = new Set();
//   const window_api_category = new Set();
//   const symbols = new Set();
//   events.forEach((e: BlacklightTestJs) => {
//     window_api_category.add(e.test_data.winow_api_category);
//     e.test_data.symbols.map((s) => symbols.add(s));
//     Object.keys(e.test_data).map((m) => metadataFields.add(m));
//   });
//   expect(window_api_category.has(undefined)).toBe(false);
//   expect(symbols.has(undefined)).toBe(false);
//   expect(Array.from(metadataFields)).toEqual(["winow_api_category", "symbols"]);
// });

it("can parse canvas_fingerprinters", async () => {
  const trData = await loadTrackerRadar(TR_DATA_PATH);
  const baseEvent = {
    origin_domain: JETBLUE.host,
    session_name: JETBLUE.title,
    category: "canvas_fingerprinters",
  };

  const events = parseInspection("canvas_fingerprinters", {
    data: JETBLUE.reports.canvas_fingerprinters,
    baseEvent,
    trData,
  });
  const metadataFields = new Set();
  const texts = new Set();
  const styles = new Set();
  events.forEach((e: BlacklightTestCanvasFp) => {
    e.test_data.texts.map((t) => texts.add(t));
    e.test_data.styles.map((t) => styles.add(t));
    Object.keys(e.test_data).map((m) => metadataFields.add(m));
  });
  expect(texts.has(undefined)).toBe(false);
  expect(styles.has(undefined)).toBe(false);
  expect(Array.from(metadataFields)).toEqual(["texts", "styles", "data_urls"]);
});

// it("can parse canvas_font_fingerprinters", async () => {
//   const trData = await loadTrackerRadar(TR_DATA_PATH);
//   const baseEvent = {
//     origin_domain: JETBLUE.host,
//     session_name: JETBLUE.title,
//     category: "canvas_font_fingerprinters",
//   };

//   const events = parseInspection("canvas_font_fingerprinters", {
//     data: JETBLUE.reports.canvas_font_fingerprinters,
//     baseEvent,
//     trData,
//   });

//   const metadataFields = new Set();
//   const text_measure = new Set();
//   const canvas_font = new Set();
//   events.forEach((e: BlacklightTestCanvasFontFp) => {
//     e.test_data.text_measure.map((t) => text_measure.add(t));
//     e.test_data.canvas_font.map((t) => canvas_font.add(t));
//     Object.keys(e.test_data).map((m) => metadataFields.add(m));
//   });
//   expect(text_measure.has(undefined)).toBe(false);
//   expect(canvas_font.has(undefined)).toBe(false);
//   events.map((e) => Object.keys(e.test_data).map((m) => metadataFields.add(m)));
//   expect(Array.from(metadataFields)).toEqual(["text_measure", "canvas_font"]);
// });

it("can parse cookies", async () => {
  const baseEvent = {
    origin_domain: JETBLUE.host,
    session_name: JETBLUE.title,
    category: "cookies",
  };
  const trData = await loadTrackerRadar(TR_DATA_PATH);
  const events = parseInspection("cookies", {
    data: JETBLUE.reports.cookies,
    baseEvent,
    trData,
  });

  const metadataFields = new Set();
  const cookie_type = new Set();
  const expires_days = new Set();
  const is_http_only = new Set();
  const is_session = new Set();
  const value = new Set();
  const name = new Set();
  const domain = new Set();

  events.forEach((e: BlacklightTestCookies) => {
    cookie_type.add(e.test_data.cookie_type);
    expires_days.add(e.test_data.expires);
    is_http_only.add(e.test_data.is_http_only);
    is_session.add(e.test_data.is_session);
    value.add(e.test_data.value);
    name.add(e.test_data.name);
    domain.add(e.test_data.cookie_domain);
    Object.keys(e.test_data).map((m) => metadataFields.add(m));
  });
  expect(cookie_type.has(undefined)).toBe(false);
  expect(expires_days.has(undefined)).toBe(false);
  expect(value.has(undefined)).toBe(false);
  expect(name.has(undefined)).toBe(false);
  expect(domain.has(undefined)).toBe(false);
  events.map((e) => Object.keys(e.test_data).map((m) => metadataFields.add(m)));
  expect(Array.from(metadataFields).sort()).toEqual(
    [
      "cookie_is_third_party",
      "cookie_domain_owner",
      "cookie_domain_tracker_categories",
      "cookie_type",
      "expires",
      "type",
      "is_http_only",
      "is_session",
      "is_secure",
      "value",
      "name",
      "cookie_domain",
    ].sort()
  );
});

it("can parse third-party trackers", async () => {
  const trData = await loadTrackerRadar(TR_DATA_PATH);
  const baseEvent = {
    origin_domain: JETBLUE.host,
    session_name: JETBLUE.title,
    category: "third_party_trackers",
  };

  const events = parseInspection("third_party_trackers", {
    //FIXME: This will change soon
    data: JETBLUE.reports.third_party_trackers,
    baseEvent,
    trData,
  });
  const metadataFields = new Set();
  const type = new Set();
  const filter = new Set();
  const url_parameters = new Set();
  events.forEach((e: BlacklightTestThirdPartyTrackers) => {
    type.add(e.test_data.type);
    filter.add(e.test_data.easy_list_filter);
    url_parameters.add(e.test_data.easy_list_url_params);
    Object.keys(e.test_data).map((m) => metadataFields.add(m));
  });
  expect(type.has(undefined)).toBe(false);
  expect(filter.has(undefined)).toBe(false);
  expect(url_parameters.has(undefined)).toBe(false);
  events.map((e) => Object.keys(e.test_data).map((m) => metadataFields.add(m)));
  expect(Array.from(metadataFields)).toEqual([
    "type",
    "easy_list_filter",
    "easy_list_url_params",
  ]);
});

it("can parse key_logging", async () => {
  const trData = await loadTrackerRadar(TR_DATA_PATH);
  const baseEvent = {
    origin_domain: JETBLUE.host,
    session_name: JETBLUE.title,
    report_name: "key_logging",
  };

  const events = parseInspection("key_logging", {
    data: JETBLUE.reports.key_logging,
    baseEvent,
    trData,
  });
  const metadataFields = new Set();
  const logged_fields = new Set();
  const filter = new Set();
  const match_type = new Set();
  events.forEach((e: BlacklightTestKeyLogging) => {
    logged_fields.add(e.test_data.logged_fields);
    filter.add(e.test_data.filter);
    match_type.add(e.test_data.match_type);
    Object.keys(e.test_data).map((m) => metadataFields.add(m));
  });

  expect(logged_fields.has(undefined)).toBe(false);
  expect(filter.has(undefined)).toBe(false);
  expect(match_type.has(undefined)).toBe(false);
  events.map((e) => Object.keys(e.test_data).map((m) => metadataFields.add(m)));
  expect(Array.from(metadataFields)).toEqual([
    "logged_fields",
    "filter",
    "match_type",
  ]);
});
