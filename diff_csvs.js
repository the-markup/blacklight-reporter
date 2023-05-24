const fs = require('fs');
const csv = require('csv-parser');
const yargs = require('yargs');

const argv = yargs
    .option('file1', {
        alias: 'a',
        description: 'First CSV file to compare',
        type: 'string',
    })
    .option('file2', {
        alias: 'b',
        description: 'Second CSV file to compare',
        type: 'string',
    })
    .option('redoForFile1', {
        description: 'Get a list of urls to be redone for file1',
        type: 'boolean',
    })
    .option('redoForFile2', {
        description: 'Get a list of urls to be redone for file2',
        type: 'boolean',
    })
    .help()
    .alias('help', 'h')
    .argv;

const readCsv = (path) =>
    new Promise((resolve, reject) => {
        const rows = [];
        fs.createReadStream(path)
            .pipe(csv())
            .on('data', (data) => rows.push(data))
            .on('end', () => resolve(rows))
            .on('error', (error) => reject(error));
    });

const compareCsvFiles = async (file1, file2) => {
    try {
        const csv1 = await readCsv(file1);
        const csv2 = await readCsv(file2);

        const headers1 = Object.keys(csv1[0]);
        const headers2 = Object.keys(csv2[0]);

        if (JSON.stringify(headers1) !== JSON.stringify(headers2)) {
            console.warn('Warning: Column names are different.');
        }

        const csv1Keys = new Set(csv1.map((row) => row[headers1[0]]));
        const csv2Keys = new Set(csv2.map((row) => row[headers2[0]]));

        for (const key of csv1Keys) {
            if (!csv2Keys.has(key)) {
                if (argv.redoForFile2) {
                    console.log(`http://${key}/`);
                }
                else if (!argv.redoForFile1) {
                    console.log(`Key ${key} is present in file1 but not in file2.`);
                }
            }
        }

        for (const key of csv2Keys) {
            if (!csv1Keys.has(key)) {
                if (argv.redoForFile1) {
                    console.log(`http://${key}/`);
                }
                else if (!argv.redoForFile2) {
                    console.log(`Key ${key} is present in file2 but not in file1.`);
                }
            }
        }

        for (const row1 of csv1) {
            const row2 = csv2.find((row) => row[headers2[0]] === row1[headers1[0]]);
            if (row2) {
                for (const header of headers1) {
                    if (row1[header] !== row2[header]) {
                        if (argv.redoForFile1 || argv.redoForFile2) {
                            console.log(`http://${row1[headers1[0]]}/`);
                        }
                        else {
                            console.log(
                                `Difference found in key ${row1[headers1[0]]} for column ${header} \nfile1: ${row1[header]}, \nfile2: ${row2[header]}.`
                            );
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

compareCsvFiles(argv.file1, argv.file2);
