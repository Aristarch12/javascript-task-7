'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

function runParallel(sourseJobs, parallelNum, timeout = 1000) {
    return new Promise(resolve => {
        if (parallelNum <= 0 || !sourseJobs.length) {
            resolve([]);
        }
        let jobs = sourseJobs.map(job =>
            () => new Promise((_resolve, _reject) => {
                job().then(_resolve, _reject);
                setTimeout(() => _reject(new Error('Promise timeout')), timeout);
            })
        );
        let startCount = 0;
        let finishCount = 0;
        let result = [];
        let startJob = job => {
            let index = startCount++;
            let resultHendler = jobResult => finishJob(jobResult, index);
            job().then(resultHendler)
                .catch(resultHendler);
        };
        function finishJob(jobResult, index) {
            result[index] = jobResult;
            if (jobs.length === ++finishCount) {
                resolve(result);
            }
            if (startCount < jobs.length) {
                startJob(jobs[startCount]);
            }
        }
        jobs.slice(0, parallelNum).forEach(job => startJob(job));
    });
}

