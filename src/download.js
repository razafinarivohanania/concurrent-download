const axios = require('axios');
const fs = require('fs');
const string = require('./string');

module.exports.getProperty = async fileLink => {
    const response = await axios.head(fileLink);
    let fileName = getFileName(response.headers, fileLink);
    if (!fileName)
        fileName = 'unknown-file';

    return {
        isMultiRequest: response.headers['accept-ranges'] == 'bytes',
        size: +response.headers['content-length'],
        name: fileName
    }
}

function getFileName(headers, fileLink) {
    const names = Object.keys(headers)
    for (const name of names) {
        if (!name.includes('content-disposition'))
            continue;

        let fileName = string.substringAfter(headers[name], 'filename="');
        return string.substringBefore(fileName, '"', true);
    }

    fileLink = decodeURI(fileLink);

    if (/\/+$/.test(fileLink))
        fileLink = string.substringBefore(fileLink, '/', true);
    
    return string.substringAfter(fileLink, '/', true); 
}

function getRangeHeader(size, currentPartition, totalPartition) {
    const sizePartition = Math.floor(size / totalPartition);
    const begin = currentPartition * sizePartition;
    const end = currentPartition == totalPartition - 1 ?
        size - 1 :
        begin + sizePartition - 1;

    return `bytes=${begin}-${end}`;
}

module.exports.download = async (url, size, currentPartition, totalPartition, progress, temporaryDirectory) => {
    const range = getRangeHeader(size, currentPartition, totalPartition);
    const axiosInstance = axios.create();
    const response = await axiosInstance.request({
        method: 'get',
        url: url,
        headers: {
            Range: range
        },
        responseType: 'stream'
    });

    progress.setTotal(currentPartition, +response.headers['content-length']);

    let currentSize = 0;
    const stream = response.data;
    stream.on('data', chunck => {
        currentSize += chunck.length;
        progress.setValue(currentPartition, currentSize);
        fs.appendFileSync(`${temporaryDirectory}/${currentPartition}.bin`, chunck);
    });
}   