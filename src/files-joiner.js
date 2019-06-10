const fs = require('fs');
const directory = require('./directory');
const string = require('./string');

async function addData(filePathToExtract, filePathToAdd) {
    return new Promise(resolve => {
        const stream = fs.createReadStream(filePathToExtract);
        stream.on('data', data => fs.appendFileSync(filePathToAdd, data));
        stream.on('close', () => resolve());
    });
}

function changeJoinedFilePath(incrementation, joinedFilePath) {
    if (incrementation == 1) {
        if (joinedFilePath.includes('.')) {
            const path = string.substringBefore(joinedFilePath, '.', true);
            const extension = string.substringAfter(joinedFilePath, '.', true);
            return `${path} ${incrementation}.${extension}`;
        }

        return `${joinedFilePath} ${incrementation}`;
    }

    const path = string.substringBefore(joinedFilePath, ' ', true);
    let extension = string.substringAfter(joinedFilePath, ' ', true);
    if (extension.includes('.'))
        extension = string.substringAfter(extension, '.');
    else
        extension = '';

    return extension ?
        `${path} ${incrementation}.${extension}` :
        `${path} ${incrementation}`;
}

async function buildJoinedFilePath(target, joinedFileName) {
    let joinedFilePath = `${target}/${joinedFileName}`;
    for (let i = 1; true; i++) {
        const value = await directory.exists(joinedFilePath);
        if (!value) return joinedFilePath;

        console.warn(`${joinedFilePath} already exists`);
        joinedFilePath = changeJoinedFilePath(i, joinedFilePath);
        console.log(`Attempt to use ${joinedFilePath}`);
    }
}

module.exports = async (directory, fileNames, target, joinedFileName) => {
    const joinedFilePath = await buildJoinedFilePath(target, joinedFileName);
    for (let i = 0; i < fileNames.length; i++) {
        await addData(`${directory}/${fileNames[i]}`, joinedFilePath);
        console.log(`File n° ${i} joined with success`);
    }
}