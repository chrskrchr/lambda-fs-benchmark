const Path = require('path');
const benchmark = require('../src/benchmark');

describe('benchmark', () => {
    it('scan', async () => {
        const inputPath = Path.resolve(__dirname, '..', 'resources', 'input.txt');

        await benchmark(inputPath, 'scan');
    });

    it('random', async () => {
        const inputPath = Path.resolve(__dirname, '..', 'resources', 'input.txt');

        await benchmark(inputPath, 'random');
    });
});
