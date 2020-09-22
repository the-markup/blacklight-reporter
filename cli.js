#!/usr/bin/env node
const { generateReports } = require("./build/generate-reports");
const path = require("path");
const argv = require("yargs")
  .option("inDir", {
    alias: "i",
    type: "string",
    description: "Paths to inspections",
  })
  .option("outDir", {
    alias: "o",
    type: "string",
    description: "Directory to store reports in",
  })
  .option("trackerRadarDir", {
    alias: "t",
    type: "string",
    default: path.join(__dirname, "./data/tracker-radar"),
    description: "Paths to tracker radar data set",
  })
  .help().argv;

try {
  generateReports(argv.inDir, argv.outDir, argv.trackerRadarDir);
} catch (error) {
  console.log(error);
}
