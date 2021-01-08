'use strict';

const benchmark = require('./benchmark');
const {INPUT_FILE_PATHS} = require('./config');

function response(statusCode, body) {
    return {
        statusCode,
        body: JSON.stringify(
            body,
            null,
            4
        )
    }
}

module.exports.benchmark = async function handler(event) {
    const {filesystem, operation} = event.pathParameters || {};
    const validPath = ['efs', 'local'].includes(filesystem) && ['scan', 'random'].includes(operation);
    if (!validPath) {
        return response(400, {
            message: 'URL must be of the form "/benchmark/[efs|local]/[scan|random]"',
        });
    }

    const path = INPUT_FILE_PATHS[filesystem];

    const responsePayload = await benchmark(path, operation)

    return response(200, responsePayload);
};
