import { clearDir, loadBlTestEvents } from "./utils";
import * as fs from "fs";
import path from "path";
import * as AWS from "aws-sdk";
import { writeTestEvents } from "./report-writer";
import { getBlTestEvents } from "./inspection-parser";
import { BlacklightReport, loadTrackerRadar } from ".";
const async = require("async");
const humanizeDuration = require("humanize-duration");
const fg = require("fast-glob");
const csvWriter = require("csv-write-stream");
const s3 = new AWS.S3();

// Columns for summary.csv
const SUMMARY_EVENTS = [
  "inspection_path",
  "origin_domain",
  "no_data",
  "has_tracking_requests",
  "has_third_party_cookies",
  "has_first_party_canvas_fingerprinters",
  "has_third_party_canvas_fingerprinters",
  "has_session_recorders",
  "has_key_loggers",
  "has_fb_pixel_events",
];

export const initStreamWriters = (outDir) => {
  const reportTypes: BlacklightReport[] = [
    // "behaviour_event_listeners",
    "third_party_trackers",
    "fb_pixel_events",
    "cookies",
    "canvas_fingerprinters",
    "key_logging",
    "session_recorders",
  ];
  let writers = {};
  clearDir(outDir);
  reportTypes.forEach((reportName) => {
    const writer = csvWriter();
    writer.pipe(fs.createWriteStream(`${outDir}/${reportName}.csv`));
    writers[reportName] = writer;
  });

  const w = csvWriter({ headers: SUMMARY_EVENTS });
  w.pipe(fs.createWriteStream(`${outDir}/summary.csv`));
  writers["summary"] = w;
  return writers;
};

const loadInspectionsLocal = async function* (globPath) {
  const fpStream = fg.stream([globPath], {
    dot: true,
  });
  for await (const entry of fpStream) {
    yield entry;
  }
};

const loadInspectionsRemote = async function* (Bucket, Prefix) {
  let opts: AWS.S3.ListObjectsV2Request = {
    Bucket,
    Prefix,
  };
  do {
    const data: AWS.S3.ListObjectsV2Output = await s3
      .listObjectsV2(opts)
      .promise();
    opts.ContinuationToken = data.NextContinuationToken;
    yield data.Contents.filter((d) => d.Key.includes("inspection.json")).map(
      (d) => d.Key
    );
  } while (opts.ContinuationToken);
};

export const generateReports = async (inDir, outDir, trDataDir) => {
  const startTime = new Date();
  console.log(`Loading inspections from ${inDir}`);
  console.log(`start time: ${startTime.toUTCString()}`);
  let totalUrls = 0;
  outDir = path.resolve(outDir);
  console.log(trDataDir);
  if (inDir.includes("s3://")) {
    const sections = inDir.split("/");
    const surveyName = sections[3];
    outDir = path.join(outDir, surveyName);
    const captureSession = sections[4] || "";
    const surveyWriters = initStreamWriters(outDir);
    const Bucket = sections[2];
    const Prefix = `${surveyName}/${captureSession}`;
    const trData = await loadTrackerRadar(trDataDir);
    for await (let inspectionPaths of loadInspectionsRemote(Bucket, Prefix)) {
      await async.mapLimit(inspectionPaths, 500, async function (path, cb) {
        totalUrls++;
        const obj = await s3
          .getObject({
            Bucket,
            Key: path,
          })
          .promise();
        const events = await getBlTestEvents(
          JSON.parse(obj.Body.toString()),
          path,
          trData
        );
        writeTestEvents(`s3://${Bucket}/${path}`, await events, surveyWriters);
      });
    }
  } else {
    outDir = path.join(outDir, "local-inspections");
    const surveyWriters = initStreamWriters(outDir);
    for await (let inspectionPath of loadInspectionsLocal(inDir)) {
      const events = await loadBlTestEvents(inspectionPath, trDataDir);
      writeTestEvents(inspectionPath, events, surveyWriters);
      totalUrls++;
    }
  }
  console.log(
    `total test duration: ${humanizeDuration(Date.now() - startTime.valueOf(), {
      maxDecimalPoints: 1,
    })}`
  );
  console.log(`Total urls ${totalUrls}`);
};
