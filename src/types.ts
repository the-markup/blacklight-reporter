export type BlacklightReport =
  | "behaviour_event_listeners"
  | "canvas_fingerprinters"
  | "cookies"
  | "fb_pixel_events"
  | "key_logging"
  | "session_recorders"
  | "third_party_trackers";

export type BlacklightTest =
  | "test_cookie"
  | "test_MOUSE"
  | "test_TOUCH"
  | "test_SENSOR"
  | "test_KEYBOARD"
  | "test_data_exfiltration"
  | "test_canvas_fingeprinting"
  | "test_canvas_font_fingeprinting"
  | "test_NAVIGATOR"
  | "test_SCREEN"
  | "test_CANVAS"
  | "test_session_recording"
  | "test_third_party_trackers";

export type BlacklightTestEvent =
  | BlacklightTestJs
  | BlacklightTestThirdPartyTrackers
  | BlacklightTestCanvasFp
  | BlacklightTestCookies
  | BlacklightTestFbPixelEvent
  | BlacklightTestSessionRecording
  | BlacklightTestKeyLogging;

export type BlacklightTestJs = {
  blacklight_version: string;
  report_name: BlacklightReport;
  end_time: Date;
  origin_domain: string;
  script_url: string;
  script_url_path: string;
  script_domain: string;
  script_domain_owner: string;
  script_domain_tracker_categories: string[];
  script_is_third_party: boolean;
  start_time: Date;
  test_data: {
    winow_api_category?: string;
    symbols?: string[];
    behavior_category?: string;
    behavior_events?: string[];
  };
};

export type BlacklightTestThirdPartyTrackers = {
  blacklight_version: string;
  report_name: BlacklightReport;
  end_time: Date;
  origin_domain: string;
  script_url: string;
  script_url_path: string;
  script_domain: string;
  script_domain_owner: string;
  script_domain_tracker_categories: string[];
  script_is_third_party: boolean;
  start_time: Date;
  test_data: {
    type: string;
    easy_list_filter: string;
    easy_list_url_params: any;
  };
};

export type BlacklightTestCanvasFp = {
  blacklight_version: string;
  report_name: BlacklightReport;
  end_time: Date;
  origin_domain: string;
  script_url: string;
  script_url_path: string;
  script_domain: string;
  script_domain_owner: string;
  script_domain_tracker_categories: string[];
  script_is_third_party: boolean;
  start_time: Date;
  test_data: {
    texts: string[];
    styles: string[];
    data_urls: string[];
  };
};

export type BlacklightTestCookies = {
  blacklight_version: string;
  report_name: BlacklightReport;
  end_time: Date;
  origin_domain: string;
  script_url: string;
  script_url_path: string;
  script_domain: string;
  script_domain_owner: string;
  script_domain_tracker_categories: string[];
  script_is_third_party: boolean;
  start_time: Date;
  test_data: {
    cookie_is_third_party: boolean;
    cookie_domain: string;
    cookie_domain_owner: string;
    cookie_domain_owner_display: string;
    cookie_domain_tracker_categories: string[];
    cookie_type: string;
    expires: number;
    is_http_only?: boolean;
    is_session?: boolean;
    is_secure?: boolean;
    value: string;
    name: string;
  };
};
export type BlacklightTestSessionRecording = {
  blacklight_version: string;
  report_name: BlacklightReport;
  end_time: Date;
  origin_domain: string;
  script_url: string;
  script_url_path: string;
  script_domain: string;
  script_domain_owner: string;
  script_domain_tracker_categories: string[];
  script_is_third_party: boolean;
  start_time: Date;
  test_data: {
    key_event_monitoring: boolean;
    key_logging_detected: boolean;
    mouse_event_monitoring: boolean;
    touch_event_monitoring: boolean;
  };
};

export type BlacklightTestKeyLogging = {
  blacklight_version: string;
  report_name: BlacklightReport;
  end_time: Date;
  origin_domain: string;
  script_url: string;
  script_url_path: string;
  script_domain: string;
  script_domain_owner: string;
  script_domain_tracker_categories: string[];
  script_is_third_party: boolean;
  start_time: Date;
  test_data: {
    logged_fields: string[];
    filter: string;
    match_type: string;
  };
};

export type BlacklightTestFbPixelEvent = {
  blacklight_version: string;
  report_name: BlacklightReport;
  end_time: Date;
  origin_domain: string;
  script_url: string;
  script_url_path: string;
  script_domain: string;
  script_domain_owner: string;
  script_domain_tracker_categories: string[];
  script_is_third_party: boolean;
  start_time: Date;
  test_data: {
    eventName: string;
    eventDescription: string;
    pageUrl: string;
    isStandardEvent: boolean;
    dataParams: { key: string; value: string; cleanKey: string }[];
    advancedMatchingParams: {
      key: string;
      value: string;
      description: string;
    }[];
    raw: string;
  };
};
