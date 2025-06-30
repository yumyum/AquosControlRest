const net = require('net');
const { exec } = require('child_process');
const request = require('request');
const express = require('express');
const router = express.Router();

// --- Configuration ---
const CONFIG = {
    AQUOS_IP: '192.168.1.32',
    AQUOS_PORT: 10002,
    REMO_IP: '192.168.1.200',
};

// --- Helper Functions ---

/**
 * Sends a command to the AQUOS TV.
 * @param {string} command The command to send.
 * @returns {Promise<string>} A promise that resolves with the response from the TV.
 */
function sendAquosCommand(command) {
    return new Promise((resolve, reject) => {
        const socket = net.createConnection({
            port: CONFIG.AQUOS_PORT,
            host: CONFIG.AQUOS_IP
        }, () => {
            socket.write(command + '\r');
        });

        let response = '';
        socket.on('data', (data) => {
            response += data.toString();
            socket.end();
        });

        socket.on('end', () => {
            resolve(response);
        });

        socket.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Controls the PS4 using ps4-waker.
 * @param {string} command The command to execute ('up' or 'torne').
 * @returns {Promise<string>} A promise that resolves with the stdout of the command.
 */
function ps4Waker(command) {
    return new Promise((resolve, reject) => {
        let param = '';
        if (command === 'up') {
            param = '';
        } else if (command === 'torne') {
            param = ' start CUSA00442';
        } else {
            return reject(new Error('Invalid PS4 command'));
        }

        exec(`ps4-waker ${param}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`ps4-waker stderr: ${stderr}`);
                return reject(err);
            }
            resolve(stdout);
        });
    });
}

/**
 * Sends a command via Nature Remo.
 * @param {object} postData The IR signal data to send.
 * @returns {Promise<any>} A promise that resolves with the body of the response.
 */
function sendRemoCmd(postData) {
    return new Promise((resolve, reject) => {
        const options = {
            url: `http://${CONFIG.REMO_IP}/messages`,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'a'
            },
            json: postData
        };

        request.post(options, (error, response, body) => {
            if (error) {
                return reject(error);
            }
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`Request failed with status code ${response.statusCode}`));
            }
            resolve(body);
        });
    });
}

// --- Route Handlers ---

const handleAquosCommand = async (res, command) => {
    try {
        await sendAquosCommand(command);
        res.sendStatus(200);
    } catch (error) {
        console.error('AQUOS command failed:', error);
        res.status(500).send('Error sending command to AQUOS');
    }
};

router.get('/input1', (req, res) => handleAquosCommand(res, 'IAVD0001'));
router.get('/input2', (req, res) => handleAquosCommand(res, 'IAVD0002'));
router.get('/tv', (req, res) => handleAquosCommand(res, 'ITVD0   '));

router.get('/cmd', (req, res) => {
    const { value1: cmd } = req.query;
    if (!cmd) {
        return res.status(400).send('Missing "value1" query parameter.');
    }
    handleAquosCommand(res, cmd);
});

router.get('/channel', (req, res) => {
    const { value1: channel } = req.query;
    const channelMap = {
        '1': 'IRCO024E', '2': 'IRCO024F', '3': 'IRCO0250', '4': 'IRCO0251',
        '5': 'IRCO0252', '6': 'IRCO0253', '7': 'IRCO0254', '8': 'IRCO0255',
        '9': 'IRCO0256', '10': 'IRCO0257', '11': 'IRCO0258', '12': 'IRCO0259'
    };
    const cmd = channelMap[channel];

    if (!cmd) {
        return res.status(400).send('Invalid channel.');
    }
    handleAquosCommand(res, cmd);
});

router.get('/ps4', async (req, res) => {
    const { value1: cmd } = req.query;
    try {
        await ps4Waker(cmd);
        res.sendStatus(200);
    } catch (error) {
        console.error('PS4 command failed:', error.message);
        if (error.message === 'Invalid PS4 command') {
            return res.status(404).send(error.message);
        }
        res.status(500).send('Error controlling PS4');
    }
});

router.get('/remo', async (req, res) => {
    const { value1: cmd } = req.query;
    const remoCommands = {
        up: { "format": "us", "freq": 38, "data": [8967, 4561, 529, 603, 529, 604, 530, 606, 531, 1707, 535, 1709, 529, 1717, 527, 1709, 531, 603, 532, 1711, 530, 1711, 530, 1710, 533, 604, 532, 600, 530, 609, 525, 604, 531, 1714, 529, 597, 534, 1713, 532, 1710, 530, 1709, 534, 1711, 530, 597, 535, 604, 532, 600, 530, 1713, 535, 593, 538, 598, 535, 597, 535, 606, 531, 1708, 532, 1711, 533, 1705, 535, 40159, 8970, 2287, 534] },
        down: { "format": "us", "freq": 38, "data": [9013, 4520, 539, 599, 537, 602, 530, 600, 560, 1684, 556, 1684, 537, 1710, 533, 1709, 557, 574, 570, 1671, 540, 1706, 569, 1671, 561, 574, 539, 593, 541, 595, 539, 598, 536, 1707, 537, 1708, 555, 1688, 529, 1710, 534, 1709, 533, 1704, 561, 574, 560, 574, 539, 594, 539, 600, 560, 577, 553, 580, 557, 578, 536, 597, 537, 1705, 559, 1687, 557, 1683, 535, 40177, 9009, 2251, 562] }
    };

    const postData = remoCommands[cmd];

    if (!postData) {
        return res.status(400).send('Invalid remo command.');
    }

    try {
        await sendRemoCmd(postData);
        res.sendStatus(200);
    } catch (error) {
        console.error('Remo command failed:', error);
        res.status(500).send('Error sending command to Remo');
    }
});

module.exports = router;