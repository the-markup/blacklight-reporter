import {
  BlacklightReport,
  BlacklightTestEvent,
  BlacklightTestThirdPartyTrackers,
  BlacklightTestCookies,
  BlacklightTestJs,
  BlacklightTestCanvasFp,
  BlacklightTestKeyLogging,
  BlacklightTestSessionRecording,
  BlacklightTestFbPixelEvent,
} from "./types";
import { filterByReport } from "./utils";

export const parseTestEvents = (
  reportType: BlacklightReport,
  events: BlacklightTestEvent[]
) => {
  const reportEvents = filterByReport(reportType, events);
  let testEvents = [];
  let summaryEvents = {} as any;
  if (events.length > 0) {
    summaryEvents.origin_domain = events[0].origin_domain;
  }
  switch (reportType) {
    case "behaviour_event_listeners":
      testEvents = reportEvents.map(reportBehaviourEvents);
      break;
    case "fb_pixel_events":
      summaryEvents.has_fb_pixel_events = reportEvents.length > 0;
      testEvents = reportEvents.map(reportFbPixelEvents);
      break;
    case "third_party_trackers":
      summaryEvents.has_tracking_requests = reportEvents.length > 0;
      testEvents = reportEvents.map(reportThirdPartyTrackers);
      break;
    case "cookies":
      testEvents = reportEvents.map(parseCookies);
      summaryEvents.has_third_party_cookies = cookieIsThirdParty(reportEvents);
      break;
    case "canvas_fingerprinters":
      summaryEvents.has_first_party_canvas_fingerprinters = hasFirstParty(
        reportEvents
      );
      summaryEvents.has_third_party_canvas_fingerprinters = hasThirdParty(
        reportEvents
      );
      testEvents = reportEvents
        .filter((e) => e.report_name === "canvas_fingerprinters")
        .map(reportCanvasFpEvents);
      break;
    case "key_logging":
      summaryEvents.has_key_loggers = reportEvents.length > 0;
      testEvents = reportEvents.map(parseKeyLogging);
      break;
    case "session_recorders":
      summaryEvents.has_session_recorders = reportEvents.length > 0;
      testEvents = reportEvents.map(parseSessionRecorders);
      break;
    default:
      break;
  }
  return { testEvents, summaryEvents };
};

const cookieIsThirdParty = (events) =>
  events.filter((e) => e.test_data.cookie_is_third_party).length > 0;
const hasThirdParty = (events) =>
  events.filter((e) => e.script_is_third_party).length > 0;
const hasFirstParty = (events) =>
  events.filter((e) => !e.script_is_third_party).length > 0;

const baseEvent = (event: BlacklightTestEvent) => ({
  origin_domain: event.origin_domain,
  script_domain: event.script_domain,
  script_url: event.script_url,
  script_url_path: event.script_url_path,
  script_domain_owner: event.script_domain_owner,
  script_domain_tracker_categories: event.script_domain_tracker_categories,
  start_time: event.start_time,
  end_time: event.end_time,
  blacklight_version: event.blacklight_version,
  script_is_third_party: event.script_is_third_party,
});
const reportFbPixelEvents = (event: BlacklightTestFbPixelEvent) => ({
  ...baseEvent(event),
  eventName: event.test_data.eventName,
  eventDescription: event.test_data.eventDescription,
  pageUrl: event.test_data.pageUrl,
  isStandardEvent: event.test_data.isStandardEvent,
  dataParams: JSON.stringify(event.test_data.dataParams),
  advancedMatchingParams: JSON.stringify(
    event.test_data.advancedMatchingParams
  ),
});

const reportCanvasFpEvents = (event: BlacklightTestCanvasFp) => ({
  ...baseEvent(event),
  texts: event.test_data.texts,
  styles: event.test_data.styles,
  data_url: event.test_data.data_urls,
  text_measure: [],
  canvas_font: [],
});

const reportBehaviourEvents = (event: BlacklightTestJs) => ({
  ...baseEvent(event),
  behavior_category: event.test_data.behavior_category,
  behavior_events: event.test_data.behavior_events,
});
const reportThirdPartyTrackers = (event: BlacklightTestThirdPartyTrackers) => ({
  ...baseEvent(event),
  easy_list_filter: event.test_data.easy_list_filter,
  easy_list_params: JSON.stringify(event.test_data.easy_list_url_params),
});

const parseCookies = (event: BlacklightTestCookies) => ({
  ...baseEvent(event),
  ...event.test_data,
});

const parseKeyLogging = (event: BlacklightTestKeyLogging) => {
  const e = {
    ...baseEvent(event),
    input_field_types: Array.from(event.test_data.logged_fields),
    input_text: event.test_data.filter,
    match_type: event.test_data.match_type,
  };
  return e;
};
const parseSessionRecorders = (event: BlacklightTestSessionRecording) => {
  return {
    ...baseEvent(event),
    key_event_monitoring: event.test_data.key_event_monitoring,
    key_logging_detected: event.test_data.key_logging_detected,
    mouse_event_monitoring: event.test_data.mouse_event_monitoring,
    touch_event_monitoring: event.test_data.touch_event_monitoring,
  };
};

const writeChunk = async (reportType, events, writer) => {
  const { testEvents, summaryEvents } = parseTestEvents(reportType, events);
  if (testEvents.length > 0) {
    testEvents.map((r) => writer.write(r));
  }
  return summaryEvents;
};
export const writeTestEvents = async (
  pathToInspection,
  events: BlacklightTestEvent[],
  writers,
  reportTypes: BlacklightReport[] = [
    "third_party_trackers",
    "key_logging",
    "session_recorders",
    "cookies",
    "fb_pixel_events",
    "canvas_fingerprinters",
  ]
) => {
  if (events.length < 1) {
    writers["summary"].write({
      inspection_path: pathToInspection,
      no_data: true,
    });
  } else {
    let sEvents = {};
    const writeChunks = reportTypes.map(async (reportType) => {
      const summaryEvents = await writeChunk(
        reportType,
        events,
        writers[reportType]
      );
      sEvents = { ...sEvents, ...summaryEvents };
    });
    await Promise.all(writeChunks);
    writers["summary"].write({
      inspection_path: pathToInspection,
      no_data: false,
      ...sEvents,
    });
  }
};
