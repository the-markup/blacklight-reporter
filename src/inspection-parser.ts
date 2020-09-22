import * as tldts from "tldts";
import * as url from "url";
import { LOGGED_FIELDS } from "./utils";
import {
  BlacklightTestEvent,
  BlacklightTestJs,
  BlacklightTestCanvasFp,
  BlacklightTestThirdPartyTrackers,
  BlacklightTestCookies,
  BlacklightTestSessionRecording,
  BlacklightReport,
} from "./types";

export const getScriptInfo = (script_url, origin_domain, trData) => {
  const script_domain =
    typeof tldts.getDomain(script_url) !== "undefined"
      ? tldts.getDomain(script_url)
      : "";
  const script_url_path = `${url.parse(script_url).host}${
    url.parse(script_url).pathname
  }`;
  const script_is_third_party =
    tldts.getDomain(origin_domain) !== script_domain ? true : false;

  const tr = trData.hasOwnProperty(script_domain)
    ? trData[script_domain]
    : {
        script_domain_owner: "",
        script_domain_tracker_categories: [],
      };
  return {
    script_is_third_party,
    script_url,
    script_domain,
    script_url_path,
    ...tr,
  };
};

const fpWinowApis = (
  { data, baseEvent, trData },
  isBehavior: boolean
): BlacklightTestJs[] => {
  const behaviorEvents = [];
  for (const [apiCategory, scriptData] of Object.entries(data)) {
    const blacklight_test = `test_${apiCategory}`;
    for (const [script, apiData] of Object.entries(scriptData)) {
      const scriptInfo = getScriptInfo(script, baseEvent.origin_domain, trData);
      const test_data = isBehavior
        ? {
            behavior_category: apiCategory,
            behavior_events: apiData,
          }
        : {
            winow_api_category: apiCategory,
            symbols: apiData,
          };
      behaviorEvents.push({
        ...baseEvent,
        blacklight_test,
        test_data,
        ...scriptInfo,
      });
    }
  }
  return behaviorEvents;
};
const canvas = ({ data, baseEvent, trData }): BlacklightTestCanvasFp[] => {
  const textScripts = Object.keys(data.texts);
  const styleScripts = Object.keys(data.styles);
  const urlScripts = Object.keys(data.data_url);
  const blacklight_test = `test_canvas_fingeprinting`;
  const scripts = data.fingerprinters;
  return scripts.map((s) => {
    const scriptInfo = getScriptInfo(s, baseEvent.origin_domain, trData);
    let test_data = {
      texts: [] as any,
      styles: [] as any,
      data_urls: [] as any,
    };
    if (textScripts.includes(s)) {
      test_data.texts = [...test_data.texts, ...data.texts[s]];
    }
    if (styleScripts.includes(s)) {
      test_data.styles = [...test_data.styles, ...data.styles[s]];
    }
    if (urlScripts.includes(s)) {
      test_data.data_urls = [...test_data.data_urls, ...data.data_url[s]];
    }
    return {
      ...baseEvent,
      blacklight_test,
      test_data,
      ...scriptInfo,
    };
  });
};
const canvasFont = ({ data, baseEvent, trData }) => {
  const textScripts = Object.keys(data.text_measure);
  const fontScripts = Object.keys(data.canvas_font);
  const blacklight_test = `test_canvas_font_fingeprinting`;
  const scripts = [...textScripts, ...fontScripts];
  return scripts.map((s) => {
    const scriptInfo = getScriptInfo(s, baseEvent.origin_domain, trData);
    let test_data = { text_measure: [], canvas_font: [] };
    if (textScripts.includes(s)) {
      test_data.text_measure.push(data.text_measure[s]);
    }
    if (fontScripts.includes(s)) {
      test_data.canvas_font.push(data.canvas_font[s]);
    }
    return {
      ...baseEvent,
      blacklight_test,
      test_data,
      ...scriptInfo,
    };
  });
};

const cookies = ({ data, baseEvent, trData }): BlacklightTestCookies[] => {
  return data.map((d) => {
    const cookieInfo = getScriptInfo(
      `${d.domain}`,
      baseEvent.origin_domain,
      trData
    );
    let renamedInfo = {
      cookie_domain_owner: "",
      cookie_domain_tracker_categories: [],
    };
    Object.entries(cookieInfo).map(([key, value]) => {
      if (!key.includes("script_is_third_party")) {
        renamedInfo[key.replace("script_", "cookie_")] = value;
      }
    });
    let scriptInfo = {
      script_url: "",
      script_url_path: "",
      script_domain: "",
      script_domain_owner: "",
      script_domain_tracker_categories: [],
    };
    if (d.type === "js" && d.script) {
      scriptInfo = getScriptInfo(
        `${d.script}`,
        baseEvent.origin_domain,
        trData
      );
    }
    return {
      ...baseEvent,
      ...scriptInfo,
      test_data: {
        cookie_domain_owner: renamedInfo.cookie_domain_owner,
        cookie_domain_tracker_categories:
          renamedInfo.cookie_domain_tracker_categories,
        cookie_is_third_party: d.third_party,
        cookie_type: d.type,
        cookie_domain: d.domain,
        is_session: d.session,
        type: d.type,
        expires: d.expires || -1,
        is_secure: d.secure,
        is_http_only: d.httpOnly,
        name: d.name,
        value: d.value,
      },
    };
  });
};

const fbPixelEvents = ({ data, baseEvent, trData }) => {
  return data.map((d) => ({
    ...baseEvent,
    ...getScriptInfo(d.raw, baseEvent.origin_domain, trData),
    test_data: d,
  }));
};
const keyLogging = ({ data, baseEvent, trData }) => {
  let events = [];

  for (const [script, klEvent] of Object.entries(data)) {
    const scriptInfo = getScriptInfo(
      `${script}`,
      baseEvent.origin_domain,
      trData
    );
    const e = (klEvent as any[]).map((ev) => {
      const input_values = ev.filter;
      const logged_fields = new Set();
      input_values.forEach((val) => {
        if (Object.keys(LOGGED_FIELDS).includes(val)) {
          logged_fields.add(LOGGED_FIELDS[val]);
        }
      });
      return {
        ...baseEvent,
        ...scriptInfo,
        test_data: {
          logged_fields,
          filter: ev.filter,
          match_type: ev.match_type,
        },
      };
    });
    events = events.concat(e);
  }
  return events;
};

const thirdPartyTrackers = ({
  data,
  baseEvent,
  trData,
}): BlacklightTestThirdPartyTrackers[] => {
  return data.map((beacon) => {
    const scriptInfo = getScriptInfo(
      beacon.url,
      baseEvent.origin_domain,
      trData
    );
    // console.log(scriptInfo);
    return {
      ...baseEvent,
      ...scriptInfo,
      test_data: {
        type: beacon.type,
        easy_list_filter: beacon.data.filter,
        easy_list_url_params: beacon.data.query,
      },
    };
  });
};

const getDomainsFromUrls = (urls) => {
  let domains = [];
  urls.forEach((url) => {
    if (typeof tldts.getDomain(url) !== "undefined") {
      domains.push(tldts.getDomain(url));
    }
  });
  return domains;
};
const sessionRecorders = ({
  data,
  baseEvent,
  lookupData,
  trData,
}): BlacklightTestSessionRecording[] => {
  let events = [];
  for (const [script, srUrls] of Object.entries(data)) {
    const scriptInfo = getScriptInfo(
      `${script}`,
      baseEvent.origin_domain,
      trData
    );
    const belKeys = Object.keys(lookupData.behaviour_event_listeners);

    let key_logging_detected =
      lookupData.key_loggers.includes(scriptInfo.script_domain) || false;
    const keyEvDomains = belKeys.includes("KEYBOARD")
      ? getDomainsFromUrls(
          Object.keys(lookupData.behaviour_event_listeners.KEYBOARD)
        )
      : [];
    const mouseEvDomains = belKeys.includes("MOUSE")
      ? getDomainsFromUrls(
          Object.keys(lookupData.behaviour_event_listeners.MOUSE)
        )
      : [];
    const touchEvDomains = belKeys.includes("TOUCH")
      ? getDomainsFromUrls(
          Object.keys(lookupData.behaviour_event_listeners.TOUCH)
        )
      : [];
    let key_event_monitoring =
      keyEvDomains.includes(scriptInfo.script_domain) || false;
    let mouse_event_monitoring =
      mouseEvDomains.includes(scriptInfo.script_domain) || false;
    let touch_event_monitoring =
      touchEvDomains.includes(scriptInfo.script_domain) || false;

    let meets_conditions =
      key_event_monitoring || mouse_event_monitoring || touch_event_monitoring;

    events.push({
      ...baseEvent,
      ...scriptInfo,
      test_data: {
        key_event_monitoring,
        key_logging_detected,
        meets_conditions,
        mouse_event_monitoring,
        touch_event_monitoring,
      },
    });
  }
  return events;
};

export const parseInspection = (
  reportName: BlacklightReport,
  { data, baseEvent, lookupData = {}, trData = {} }
) => {
  switch (reportName) {
    case "behaviour_event_listeners":
      return fpWinowApis({ data, baseEvent, trData }, true);
    case "canvas_fingerprinters":
      return canvas({ data, baseEvent, trData });
    // case "canvas_font_fingerprinters":
    //   return canvasFont({ data, baseEvent, trData });
    case "cookies":
      return cookies({ data, baseEvent, trData });
    case "key_logging":
      return keyLogging({ data, baseEvent, trData });
    case "session_recorders":
      return sessionRecorders({ data, baseEvent, lookupData, trData });
    case "fb_pixel_events":
      return fbPixelEvents({ data, baseEvent, trData });
    case "third_party_trackers":
      return thirdPartyTrackers({ data, baseEvent, trData });
    default:
      return [];
  }
};
export const getBlTestEvents = async (
  inspection,
  inspectionFilePath,
  trData = null
): Promise<BlacklightTestEvent[]> => {
  const common = {
    origin_domain: inspection.host,
    inspection_path: inspectionFilePath,
    start_time: inspection.start_time,
    end_time: inspection.end_time,
    blacklight_version: inspection.script.version.npm,
  };
  const lookupData = {
    key_loggers: Object.keys(inspection.reports.key_logging),
    behaviour_event_listeners: inspection.reports.behaviour_event_listeners,
  };

  let testEvents = [];
  for (let [reportName, data] of Object.entries(inspection.reports)) {
    const baseEvent = {
      ...common,
      report_name: reportName,
    };
    const surveyEvents = parseInspection(reportName as BlacklightReport, {
      data,
      baseEvent,
      lookupData,
      trData,
    });
    testEvents = testEvents.concat(surveyEvents);
  }

  return testEvents;
};
