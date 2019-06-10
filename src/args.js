const string = require('./string');

function checkArgs(args) {
    if (!args.url)
        throw new Error('[url] argument is blank');

    if (!args.url.startsWith('http'))
        throw new Error(`Not supported url [${args.url}]`);

    if (!args.partition)
        throw new Error('[partition] argument is blank');

    if (isNaN(args.partition) || args.partition < 0)
        throw new Error(`Partition [${args.partition}] must be superior than 0`);

    args.partition = +args.partition;

    if (!args.target){
        console.log('[target] argument is blank => use current folder as target');
        args.target = process.cwd();
    }

    return args;
}

module.exports = () => {
    const argv = process.argv.slice(2);
    const args = {};
    argv.forEach(arg => {
        const name = string.substringBefore(arg, '=');
        const value = string.substringAfter(arg, '=');
        args[name] = value;
    });

    args.temporaryDirectory = `temp_${string.generateRandomString(32, true)}`;
    return checkArgs(args);
}