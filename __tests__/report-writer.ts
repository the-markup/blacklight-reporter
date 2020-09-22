import { getBlTestEvents } from "../src/inspection-parser";
import { parseTestEvents } from "../src/report-writer";

const fs = require("fs");
const path = require("path");
const JETBLUE = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "./test-data/2.0.0/jetblue.inspection.json"),
    "utf-8"
  )
);
const ACCENTURE = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "./test-data/2.0.0/accenture.inspection.json"),
    "utf-8"
  )
);
let JB_TEST_EVENTS = [];
let ACCENTURE_TEST_EVENTS = [];
const TR_DATA_PATH = path.join(
  __dirname,
  "../../data/tracker-radar-05-12-2020"
);
beforeAll(async () => {
  JB_TEST_EVENTS = await getBlTestEvents(
    JETBLUE,
    path.join(__dirname, "./test-data/2.1.1/jetblue.inspection.json"),
    TR_DATA_PATH
  );
  ACCENTURE_TEST_EVENTS = await getBlTestEvents(
    ACCENTURE,
    path.join(__dirname, "./test-data/2.1.1/accenture.inspection.json"),
    TR_DATA_PATH
  );
});
it("can read blacklight web beacons survey events", () => {
  const { testEvents, summaryEvents } = parseTestEvents(
    "third_party_trackers",
    JB_TEST_EVENTS
  );
  expect(testEvents.length).toBeGreaterThan(1);
  testEvents.map((t) => expect(t).toBeTruthy());
  expect(Object.keys(summaryEvents).includes("has_tracking_requests")).toBe(
    true
  );
});
it("can read blacklight cookies survey events", () => {
  const { testEvents, summaryEvents } = parseTestEvents(
    "cookies",
    JB_TEST_EVENTS
  );
  expect(testEvents.length).toBeGreaterThan(1);
  testEvents.map((t) => expect(t).toBeTruthy());
  expect(Object.keys(summaryEvents).includes("has_third_party_cookies")).toBe(
    true
  );
});

it("can read blacklight canvas fingerprinting survey events", () => {
  const { testEvents, summaryEvents } = parseTestEvents(
    "canvas_fingerprinters",
    JB_TEST_EVENTS
  );
  expect(testEvents.length).toBe(1);
  testEvents.map((t) => expect(t).toBeTruthy());
  expect(
    Object.keys(summaryEvents).includes("has_third_party_canvas_fingerprinters")
  ).toBe(true);
  expect(
    Object.keys(summaryEvents).includes("has_first_party_canvas_fingerprinters")
  ).toBe(true);
});

it("can read blacklight key_logging survey events", () => {
  const { testEvents, summaryEvents } = parseTestEvents(
    "key_logging",
    JB_TEST_EVENTS
  );
  expect(testEvents.length).toBeGreaterThanOrEqual(1);
  testEvents.map((t) => expect(t).toBeTruthy());
  expect(Object.keys(summaryEvents).includes("has_key_loggers")).toBe(true);
});

it("can read blacklight session_recording survey events", () => {
  const { testEvents, summaryEvents } = parseTestEvents(
    "session_recorders",
    ACCENTURE_TEST_EVENTS
  );
  expect(testEvents.length).toBeGreaterThanOrEqual(1);
  testEvents.map((t) => expect(t).toBeTruthy());
  expect(Object.keys(summaryEvents).includes("has_session_recorders")).toBe(
    true
  );
});
