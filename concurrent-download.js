const { getProperty, download } = require('./src/download');
const { Progress } = require('./src/progress');
const parseArgs = require('./src/args');
const joinFiles = require('./src/files-joiner');
const directory = require('./src/directory');

function buildFileNames(progress) {
    const fileNames = [];

    for (let i = 0; i < progress.getPartitionCount(); i++)
        fileNames.push(`${i}.bin`);

    return fileNames;
}

(async () => {
    const args = parseArgs();
    const property = await getProperty(args.url);
    if (!property.isMultiRequest) {
        console.error('Not downloadable file or multi partitions refuses by server');
        return;
    }

    const progress = new Progress(args.partition);
    const downloads = [];
    await directory.create(args.temporaryDirectory);

    for (let i = 0; i < args.partition; i++)
        downloads.push(download(args.url, property.size, i, args.partition, progress, args.temporaryDirectory));

    console.log('');
    progress.print();

    await Promise.all(downloads);

    progress.onDone(async () => {
        const fileNames = buildFileNames(progress);
        await joinFiles(args.temporaryDirectory, fileNames, args.target, property.name);
        console.log('');
        console.log('Removing temporary files ...');
        await directory.remove(args.temporaryDirectory);
        console.log('All things is done!');
    });
})();