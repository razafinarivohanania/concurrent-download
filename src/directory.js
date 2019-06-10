const fs = require('fs-extra');

module.exports.exists = path => {
    return new Promise((resolve, reject) => {
        fs.stat(path, error => {
            if (error) {
                if (error.code == 'ENOENT')
                    resolve(false);
                else
                    reject(error);
            } else
                resolve(true);
        });
    });
}

module.exports.create = directory => {
    return new Promise((resolve, reject) => {
        fs.mkdir(directory, error => {
            if (error)
                reject();
            else
                resolve();
        });
    });
}

module.exports.remove = directory => {
    return new Promise((resolve, reject) => {
        fs.remove(directory, (error) => {
            if (error)
                reject(error);
            else
                resolve();
        });
    });
}