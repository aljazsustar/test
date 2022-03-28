const http = require('http');
const fs = require('fs');

const filePath = 'assets/holidays.txt';

// this global variable serves as cache, so that file doesn't have to be read on
// every request separately
// structure: {<date>: <T/F>}, example: {"2022/5/1": true}
holidays = {}


// read file with the holiday info from file system
// file structure: <date>,[year] -> if year is present, then holiday is not recurring -> only valid
// in the year specified. Otherwise, holiday is recurring
let file = fs.readFileSync(filePath);
for (let holiday of file.toString().split("\n")) {
    let rowItems = holiday.split(',');
    holidays[rowItems[0]] = rowItems[1] || "";
}

// create server to serve holiday data
const server = http.createServer((req, res) => {

    // set headers, because CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Max-Age': 2592000, // 30 days
    };
    res.writeHead(200, headers);
    res.end(JSON.stringify(holidays));
}).listen(3000);