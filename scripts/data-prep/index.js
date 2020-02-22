const RAW_FILES = [
    './in/DAT_ASCII_EURUSD_T_201901.csv',
    './in/DAT_ASCII_EURUSD_T_201902.csv',
    './in/DAT_ASCII_EURUSD_T_201903.csv',
    './in/DAT_ASCII_EURUSD_T_201904.csv',
    './in/DAT_ASCII_EURUSD_T_201905.csv',
    './in/DAT_ASCII_EURUSD_T_201906.csv',
    './in/DAT_ASCII_EURUSD_T_201907.csv',
    './in/DAT_ASCII_EURUSD_T_201908.csv',
    './in/DAT_ASCII_EURUSD_T_201909.csv',
    './in/DAT_ASCII_EURUSD_T_201910.csv',
    './in/DAT_ASCII_EURUSD_T_201911.csv',
    './in/DAT_ASCII_EURUSD_T_201912.csv',
]

const fs = require('fs')

const checkNumber = require('../utils/check-number')

let collection = []
let extracted = 0

console.log('::: ========= ')

RAW_FILES.forEach((rawFile) => {
    console.log('::: rawFile:', rawFile)

    // extract
    let data = fs.readFileSync(rawFile, 'utf8')
        .split('\n')
        .map((row) => row.split(','))
        .map(([dt, bid, ask]) => [...dt.split(' '), bid, ask])
        // .splice(0, 1500)
        .filter(([, , bid, ask]) => checkNumber(+bid) && checkNumber(+ask))
    console.log('::: [extract]:', data.length)
    extracted += data.length

    // process
    data = data
        .filter(([, time], index) => time.charAt(1) !== `${(data[index + 1] || [])[1]}`.charAt(1))
        .map(([, , bid, ask]) => (Number(bid) + Number(ask)) / 2)
    console.log('::: [process]:', data.length)

    // collect
    collection = [...collection, ...data]
    console.log('::: [collect]:', collection.length)
    console.log('::: --------- ')
})

// normalize
// const min = Math.min(...collection)
// const max = Math.max(...collection)

// collection = collection.map((mid) => (mid - min) / (max - min))
// console.log('::: [normalize]:', min, max, collection.length)
// console.log('::: --------- ')

// save
const result = {
    // min,
    // max,
    data: collection,
}
const content = JSON.stringify(result)
fs.writeFileSync('./out/data.json', content, 'utf8')
console.log('::: [save]:', result.data.length, Object.keys(result))
console.log('::: --------- ')

// end
console.log('::: extracted:', extracted)
console.log('::: collected:', collection.length)
console.log('::: Done!')
console.log('::: ========= ')
