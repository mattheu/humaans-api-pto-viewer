#!/usr/bin/env node

require( 'dotenv' ).config();

const prettyjson = require( 'prettyjson' );
const yargs = require( 'yargs' );

const api = require( './build/api.js' );

// eslint-disable-next-line no-unused-expressions
yargs.scriptName( 'humaans-cli' )
	.command( 'time-away-policies', 'Get time away policies.', getTimeAwayPolicies )
	.command( 'time-away-periods', 'Get time away periods.', getTimeAwayPeriods )
	.command( 'me', 'Get person for currently authenticated user.', getMe )
	.command(
		'person [id]',
		'Getting a single person.',
		yargs => {
			yargs.positional( 'id', {
				type: 'string',
				describe: 'The person ID',
			} );
		},
		getPerson
	)
	.command(
		'pto [id]',
		'Getting paid time off for a single person for the current period.',
		yargs => {
			yargs.positional( 'id', {
				type: 'string',
				describe: 'The person ID',
			} );
		},
		async argv => {
			await getPtoForCurrentPeriod( argv );
		}
	)
	.help()
	.argv;

/**
 * Output formatted data to console.
 *
 * @param {*} data Data
 */
function log( data ) {
	console.log( prettyjson.render( data ) ); // eslint-disable-line no-console
}

/**
 * Get time away periods.
 */
async function getTimeAwayPeriods() {
	log( await api.getResourceJSON( 'time-away-periods' ) );
}

/**
 * Get time away policies
 */
async function getTimeAwayPolicies() {
	log( await api.getResourceJSON( 'time-away-policies' ) );
}

/**
 * Get person data for the currently authenticated user.
 */
async function getMe() {
	log( await api.fetchMe() );
}

/**
 * Get a person by ID.
 *
 * @param {object} argv Args.
 */
async function getPerson( argv ) {
	log( await api.fetchPerson( argv.id ) );
}

/**
 * Get time away of type pto for a single person, for their current policy period.
 *
 * @param {object} argv Args.
 */
async function getPtoForCurrentPeriod( argv ) {
	const data = await api.fetchCurrentTimeAwayPeriodForPerson( argv.id );
	data.timeOff = await api.fetchTimeOff( argv.id, 'pto', data.period );
	log( data );
}
