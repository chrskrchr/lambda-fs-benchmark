const fs = require('fs').promises;
const stats = require('stats-lite');
const {formatBytes, randomInt} = require('./utils');

const SCAN_BENCHMARK_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
const RANDOM_BENCHMARK_CHUNK_COUNT = 100;
const RANDOM_BENCHMARK_CHUNK_BYTES = 128; // 128B
const RANDOM_BENCHMARK_CHUNK_BYTES_MAX_JITTER = 10;

function perc(samples, perc) {
    return stats.percentile(samples, perc).toFixed(2).toString();
}

function computeStats(samples) {
    return [
        `p10=${perc(samples, 0.10)}`,
        `p25=${perc(samples, 0.25)}`,
        `p50=${perc(samples, 0.50)}`,
        `p90=${perc(samples, 0.90)}`,
        `p95=${perc(samples, 0.95)}`,
        `p99=${perc(samples, 0.99)}`
    ].join(' ');
}

/**
 * Scans the entire file at the given path.
 * @param path
 * @returns {Promise<string>}
 */
async function scan(path) {
    console.log(`Scanning path="${path}"`);
    const start = Date.now();
    const fhInput = await fs.open(path, 'r');
    const buffer = Buffer.alloc(SCAN_BENCHMARK_CHUNK_SIZE);

    let position = 0;
    let done = false;
    const chunkReadLatencies = [];
    do {
        const chunkReadStart = Date.now();
        const {bytesRead} = await fhInput.read(buffer, 0, buffer.length, position);
        position += bytesRead;

        const chunkReadLatency = Date.now() - chunkReadStart
        chunkReadLatencies.push(chunkReadLatency);
        console.log(`Scanned ${formatBytes(position)} elapsed=${chunkReadLatency}`);
        done = bytesRead === 0;
    } while (!done);

    const elapsed = Date.now() - start;
    const statsString = `elapsed=${elapsed} chunks=${chunkReadLatencies.length} ${computeStats(chunkReadLatencies)}`;
    console.log(`Finished scanning path="${path}" elapsed=${elapsed}`);
    console.log(`Final stats - ${statsString}`);

    await fhInput.close();

    return statsString
}

/**
 * Reads a number of random file chunks from the given path.
 * @param path
 * @returns {Promise<string>}
 */
async function random(path) {
    console.log(`Scanning count=${RANDOM_BENCHMARK_CHUNK_COUNT} random chunks from path="${path}"`);
    const start = Date.now();
    const fhInput = await fs.open(path, 'r');
    const buffer = Buffer.alloc(RANDOM_BENCHMARK_CHUNK_BYTES + RANDOM_BENCHMARK_CHUNK_BYTES_MAX_JITTER);

    const {size: fileSize} = await fs.stat(path);
    const chunkReadLatencies = [];
    for (let i = 0; i < RANDOM_BENCHMARK_CHUNK_COUNT; i += 1) {
        const chunkSize = RANDOM_BENCHMARK_CHUNK_BYTES + randomInt(RANDOM_BENCHMARK_CHUNK_BYTES_MAX_JITTER);
        const position = randomInt(fileSize);
        const chunkReadStart = Date.now();

        await fhInput.read(buffer, 0, chunkSize, position);

        const chunkReadLatency = Date.now() - chunkReadStart
        chunkReadLatencies.push(chunkReadLatency);
        console.log(`Scanned bytes=${chunkSize} from position=${position} elapsed=${chunkReadLatency}`);
    }

    const elapsed = Date.now() - start;
    const statsString = `elapsed=${elapsed} chunks=${chunkReadLatencies.length} ${computeStats(chunkReadLatencies)}`;
    console.log(`Finished scanning count=${RANDOM_BENCHMARK_CHUNK_COUNT} random chunks from path="${path}" elapsed=${elapsed}`);
    console.log(`Final stats - ${statsString}`);

    await fhInput.close();

    return statsString;
}

module.exports = function benchmark(path, operation) {
    switch (operation) {
        case 'scan':
            return scan(path);

        case 'random':
            return random(path);

        default:
            throw new Error(`Unknown operation="${operation}"`);
    }
}