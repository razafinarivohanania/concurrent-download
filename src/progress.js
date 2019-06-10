const logUpdate = require('log-update');
const { addSpaceByThousand } = require('./number');

class Progress {

    constructor(partitionCount) {
        this.partitionCount = partitionCount;
        this.partitions = [];
        this.delay = 0;
        this.delayAlreadyLoaded = false;

        for (let i = 0; i < partitionCount; i++)
            this.partitions.push({ value: 0, total: 0 });
    }

    setTotal(partition, total) {
        this.partitions[partition].total = total;
    }

    setValue(partition, value) {
        this.partitions[partition].value = value;
    }

    computePercentage(partition) {
        const percentage = partition.value * 100 / partition.total;
        return percentage.toFixed(2);
    }

    computeTotal() {
        const total = { value: 0, total: 0 };

        this.partitions.forEach(partition => {
            total.value += partition.value;
            total.total += partition.total;
        });

        return total;
    }

    computeSpeed(total) {
        return this.delay == 0 ?
            0 :
            Math.trunc(total.value / this.delay);
    }

    computeRemainingTime(total, speed) {
        const remainingTime = speed = 0 ?
            '-' :
            Math.trunc((total.total - total.value) / speed);

        return `${addSpaceByThousand(remainingTime)} s`;
    }

    buildMessage() {
        let message = '';
        for (const number in this.partitions) {
            const partition = this.partitions[number];
            message += `Partition ${number} : ${this.computePercentage(partition)} % [${addSpaceByThousand(partition.value)} / ${addSpaceByThousand(partition.total)} byte]\n`;
        }

        message += '\n';
        const total = this.computeTotal();
        const speed = this.computeSpeed(total);
        message += `Elapsed time : ${this.delay} s\n`;
        message += `Remaining time : ${this.computeRemainingTime(total, speed)}\n`;
        message += `Download speed : ${addSpaceByThousand(speed)} byte/s\n`;
        return message + `Partition total : ${this.computePercentage(total)} % [${addSpaceByThousand(total.value)} / ${addSpaceByThousand(total.total)} byte]`;
    }

    print() {
        this.loadDelay();
        setTimeout(() => {
            logUpdate(this.buildMessage());
            if (this.isToContinue())
                this.print();
            else {
                clearInterval(this.delayInterval);
                if (this.onDoneCallback)
                    this.onDoneCallback();
            }

        }, 1000);
    }

    loadDelay() {
        if (this.delayAlreadyLoaded)
            return;

        this.delayAlreadyLoaded = true;
        this.delayInterval = setInterval(() => this.delay++, 1000);
    }

    isToContinue() {
        let done = 0;

        for (const partition of this.partitions) {
            if (partition.value >= partition.total)
                done++;
        }

        return done < this.partitions.length;
    }

    getValue(partition) {
        return this.partitions[partition].value;
    }

    onDone(callback) {
        this.onDoneCallback = callback;
    }

    getPartitionCount(){
        return this.partitionCount;
    }
}

module.exports.Progress = Progress;
