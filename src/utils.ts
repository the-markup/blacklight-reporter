import path from "path";
import fs from "fs";
import util from "util";
import crypto from "crypto";
import { getBlTestEvents } from "./inspection-parser";
import { BlacklightReport, BlacklightTestEvent } from ".";
const asyncReadFile = util.promisify(fs.readFile);
const safelyLoadJson = (n) => {
  try {
    return JSON.parse(n);
  } catch (err) {
    return false;
  }
};

export const loadBlInspectionFile = async (filepath) => {
  return safelyLoadJson(await asyncReadFile(filepath, "utf-8"));
};

const deleteFolderRecursive = (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

export const clearDir = (outDir, mkNewDir = true) => {
  if (fs.existsSync(outDir)) {
    deleteFolderRecursive(outDir);
  }
  if (mkNewDir) {
    fs.mkdirSync(outDir);
  }
};

// tslint:disable:object-literal-sort-keys
export const DEFAULT_INPUT_VALUES = {
  date: "01/01/2026",
  email: "blacklight-headless@themarkup.org",
  password: "SUPERS3CR3T_PASSWORD",
  search: "TheMarkup",
  text: "IdaaaaTarbell",
  url: "https://themarkup.org",
  organization: "The Markup",
  "organization-title": "Non-profit newsroom",
  "current-password": "S3CR3T_CURRENT_PASSWORD",
  "new-password": "S3CR3T_NEW_PASSWORD",
  username: "idaaaa_tarbell",
  "family-name": "Tarbell",
  "given-name": "Idaaaa",
  name: "IdaaaaTarbell",
  "street-address": "PO Box #1103",
  "address-line1": "PO Box #1103",
  "postal-code": "10159",
  "cc-name": "IDAAAATARBELL",
  "cc-given-name": "IDAAAA",
  "cc-family-name": "TARBELL",
  "cc-number": "4479846060020724",
  "cc-exp": "01/2026",
  "cc-type": "Visa",
  "transaction-amount": "13371337",
  bday: "01-01-1970",
  sex: "Female",
  tel: "+1971112233",
  "tel-national": "917-111-2233",
  impp: "xmpp:blacklight-headless@themarkup.org",
};
export const getStringHash = (algorithm, str) => {
  return crypto.createHash(algorithm).update(str).digest("hex");
};
export const getHashedValues = (algorithm, object) => {
  return Object.entries(object).reduce((acc, cur: any) => {
    acc[cur[0]] =
      algorithm === "base64"
        ? Buffer.from(cur[1]).toString("base64")
        : getStringHash(algorithm, cur[1]);
    return acc;
  }, {});
};

const ts = [
  ...Object.values(DEFAULT_INPUT_VALUES),
  ...Object.values(getHashedValues("base64", DEFAULT_INPUT_VALUES)),
  ...Object.values(getHashedValues("md5", DEFAULT_INPUT_VALUES)),
  ...Object.values(getHashedValues("sha256", DEFAULT_INPUT_VALUES)),
  ...Object.values(getHashedValues("sha512", DEFAULT_INPUT_VALUES)),
];

export const loadBlTestEvents = async (filepath, trData) => {
  return getBlTestEvents(
    await loadBlInspectionFile(filepath),
    filepath,
    trData
  );
};
export const getLoggedFields = (obj) => {
  const reversed = {};
  for (const [field, value] of Object.entries(obj)) {
    reversed[value as string] = field;
  }
  return reversed;
};
export const LOGGED_FIELDS = {
  ...getLoggedFields(DEFAULT_INPUT_VALUES),
  ...getLoggedFields(getHashedValues("base64", DEFAULT_INPUT_VALUES)),
  ...getLoggedFields(getHashedValues("md5", DEFAULT_INPUT_VALUES)),
  ...getLoggedFields(getHashedValues("sha256", DEFAULT_INPUT_VALUES)),
  ...getLoggedFields(getHashedValues("sha512", DEFAULT_INPUT_VALUES)),
};

export const filterByReport = (
  report: BlacklightReport,
  events: BlacklightTestEvent[]
): BlacklightTestEvent[] => {
  if (report === "canvas_fingerprinters") {
    return events.filter(
      (e) => e.report_name === "canvas_fingerprinters"
      // || e.report_name === "canvas_font_fingerprinters"
    );
  } else {
    return events.filter((e) => e.report_name === report);
  }
};

let domainMapCache = null;

export const loadTrackerRadar = async (dataDir) => {
  if (domainMapCache) {
    return domainMapCache;
  }
  domainMapCache = await loadTrackerRadarLocal(dataDir);
  return domainMapCache;
};

const loadTrackerRadarLocal = async (dataDir, region = "US") => {
  const domainMap = {};
  const domainDir = path.join(dataDir, "domains", region);
  const dir = fs.readdirSync(domainDir);
  dir.map((domainFilename) => {
    const domainFp = path.join(domainDir, domainFilename);
    const data = safelyLoadJson(fs.readFileSync(domainFp, "utf-8"));
    const domain = domainFilename.replace(".json", "");
    domainMap[domain] = {
      script_domain_owner: data.owner.displayName || "",
      script_domain_tracker_categories: data.categories,
    };
  });

  return domainMap;
};
