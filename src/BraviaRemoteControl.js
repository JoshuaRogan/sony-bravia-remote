import http from 'http';
import actionMap from './ActionMap';

/** @type {Boolean} httpDebug Debug flag */
const httpDebug = false;

/** @type {Number} DEFAULT_TIME_BETWEEN_COMMANDS Standard time between requests */
const DEFAULT_TIME_BETWEEN_COMMANDS = 350;

/** @type {Number} PAUSED_TIME_BETWEEN_COMMANDS Time to wait between long commands like home to make sure they finish */
const PAUSED_TIME_BETWEEN_COMMANDS = 3000;

/** @type {String} braviaIRCCEndPoint Endpoint to send signals to */
const braviaIRCCEndPoint = '/sony/IRCC';

/** @type {Object} actionLookUpTable Alternate action names lookup table */
const actionLookUpTable = {
	'Enter': 'Confirm',
};

export default class BraviaRemoteControl {

	/**
	 * Create a bravia remote control instance
	 * @param  {String} domain
	 * @param  {Number} port
	 * @param  {String} authKey
	 * @return {BraviaRemoteControl}
	 */
	constructor(domain, port, authKey = '0000') {
		this.debug = false;
		this.domain = domain;
		this.port = port;
		this.authKey = authKey;
		this.activeRequest = false;
		this.activeSequence = false;
		this.delay = DEFAULT_TIME_BETWEEN_COMMANDS;
		this.openedApp = null;
	}

	/**
	 * Send a sequence of commands
	 * @param  {String} actionKeySeq sequence of commands e.g 'down up left right'
	 * @return {Promise}
	 */
	sendActionSequence(actionKeySeq) {
		let commands = actionKeySeq.split(' ');

		// Fire off the commands synchronously
		return new Promise((resolve, reject) => {
			this.activeSequence = true;
			let index = 0;

			let next = () => {
				if (index < commands.length) {
					this.sendAction(commands[index++]).then(next, reject);
				} else {
					console.log(`Sequence '${actionKeySeq}' finished.`);
					this.activeSequence = false;
					resolve();
				}
			}

			next();
		});
	}

	/**
	 * Send a sequence of commands that navigates to an open that
	 * will open. Command starts with home, long pause, sequence, then confirm.
	 * @param  {string} actionKeySeq
	 * @param  {string} appName
	 * @return {Promise}
	 */
	openAppSeq(actionKeySeq, appName) {
		this.delay = PAUSED_TIME_BETWEEN_COMMANDS; // Set longer delay

		return this.sendActionSequence('exit home')
			.then(()=> {
				this.delay = DEFAULT_TIME_BETWEEN_COMMANDS;
				return this.sendActionSequence(actionKeySeq);
			})
			.then(()=> {
				this.openedApp = appName;
				return this.sendActionSequence('confirm')
					.then(() => console.log(`${appName} was opened`));
			});
	}

	/**
	 * Send an IRCC signal to the TV by looking up
	 * @param  {String} actionKey
	 * @return {Promise}
	 */
	sendAction(actionKey) {
		let action = this.getAction(actionKey);
		return this.sendIRCCSignal(BraviaRemoteControl.getIRCCCode(action));
	}

	/**
	 * Send an IRCC signal to the TV
	 * @param  {String} actionKey
	 * @return {Promise}
	 */
	sendIRCCSignal(IRCCCode) {
		let body = this.getIRCCCodeXMLBody(IRCCCode);
		let options = this.getRequestOptions();
		return this.sendHTTPRequest(options, body);
	}

	/**
	 * Send an HTTP Request to a Bravia TV with timeout
	 * @param  {Object} options
	 * @param  {String} body
	 * @return {Promise}
	 */
	sendHTTPRequest(options, body) {
		return new Promise((resolve, reject) => {
			let req = http.request(options, (res) => {
				this.activeRequest = true;

				if(httpDebug) console.log(`STATUS: ${res.statusCode}`);
				if(httpDebug) console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
				res.setEncoding('utf8');

				res.on('data', (chunk) => {
					if(httpDebug) console.log(`BODY: ${chunk}`);
				});

				res.on('end', () => {
					this.activeRequest = false;
					setTimeout(() => { resolve(); }, this.delay);
				});
			});

			req.on('error', (e) => {
				reject(`problem with request: ${e.message}`);
			});

			req.write(body);
			req.end();
		});
	}

	/**
	 * Build the HTTP request options
	 * @return {Object}
	 */
	getRequestOptions() {
		return {
			hostname: this.domain,
			port: this.port,
			path: braviaIRCCEndPoint,
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml',
				'soapaction': '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"',
				'x-auth-psk': this.authKey
			}
		}
	}

	/**
	 * Get the xml body for the http response sent to the bravia television
	 * @param  {String} IRCCCode
	 * @return {String}
	 */
	getIRCCCodeXMLBody(IRCCCode) {
		return `<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1"><IRCCCode>${IRCCCode}</IRCCCode></u:X_SendIRCC></s:Body></s:Envelope>`;
	}

	/**
	 * Get the remote IRCCCode control values
	 * @param  {String} actionName
	 * @return {String|Boolean} IRCCCode
	 */
	static getIRCCCode(actionName) {
		return actionMap[actionName] ? actionMap[actionName] : false;
	}

	/**
	 * Determines if an action is valid
	 * @param  {String}  action
	 * @return {Boolean}
	 */
	isValidAction(action) {
		return actionMap[this.getAction(action)] !== undefined;
	}

	/**
	 * Check the lookup table for an alternate action name
	 * @param  {string} action
	 * @return {string}
	 */
	getAction(action) {
		return actionLookUpTable[action] ? actionLookUpTable[action] : action;
	}

}

module.exports = BraviaRemoteControl;
