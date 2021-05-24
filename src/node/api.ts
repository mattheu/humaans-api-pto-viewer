require( 'dotenv' ).config();

// const dateFns = require( 'date-fns' );
const nodeFetch = require( 'node-fetch' );

const { addQueryArgs } = require( '@wordpress/url' );

const apiBase = 'https://app.humaans.io/api';
// const dateFormat = 'yyyy-MM-dd';

interface DateInterval {
	// start: Date,
	// end: Date,
	start: string,
	end: string,
}

interface Person {
	name: string;
	id: string;
	directReports?: Array<string>;
}

interface TimeOffBreakdown {
	// date?: Date;
	date?: string;
	isFull: boolean,
	period?: 'full' | 'am' | 'pm';
}

interface TimeOff {
	id: string;
	personId: string;
	days: number;
	type: string;
	period: DateInterval,
	breakdown?: Array<TimeOffBreakdown>;
}

interface TimeAwayPeriod {
	id: string,
	personId: string;
	period: DateInterval,
	allowance: number;
	used: number;
	upcoming: number;
}

/**
 * Convert raw API data to Person object.
 */
function parsePerson( rawData: any ) : Person {
	return {
		name: `${ rawData.firstName || '' } ${ rawData.lastName || '' }`,
		id: rawData.id || '',
		directReports: rawData?.directReports || [],
	};
}

/**
 * Convert raw API data to breakdown object.
 */
function parseBreakdown( rawData: any ) : TimeOffBreakdown {
	return {
		// date: dateFns.parse( rawData.date, dateFormat, new Date() ),
		date: rawData.date,
		period: rawData.period,
		isFull: rawData.period === 'full',
	};
}

/**
 * Convert raw API data to TimeOff object.
 */
function parseTimeOff( rawData: any ) : TimeOff {
	return {
		id: rawData.id || '',
		personId: rawData.personId || '',
		type: rawData.type || '',
		days: rawData.days || '',
		period: {
			// start: dateFns.parse( rawData.startDate, dateFormat, new Date() ),
			// end: dateFns.parse( rawData.endDate, dateFormat, new Date() ),
			start: rawData.startDate,
			end: rawData.endDate,
		},
		breakdown: rawData.breakdown.map( parseBreakdown ),
	};
}

/**
 * Convert raw API data to TimeAwayPeriod object.
 */
function parseTimeAwayPeriod( rawData: any ) : TimeAwayPeriod {
	return {
		id: rawData.id || '',
		personId: rawData.personId || '',
		allowance: parseFloat( rawData.allowance ),
		used: parseFloat( rawData.ptoUsed ),
		upcoming: parseFloat( rawData.ptoUpcoming ),
		period: {
			// start: dateFns.parse( rawData.startDate, dateFormat, new Date() ),
			// end: dateFns.parse( rawData.endDate, dateFormat, new Date() ),
			start: rawData.startDate,
			end: rawData.endDate,
		},
	};
}

/**
 * Fetch currently authenticated person, the owner of API key.
 */
async function fetchMe( key: string ) : Promise<Person> {
	return parsePerson( await getResourceJSON( 'me', key ) );
}

/**
 * Fetch a single person by ID.
 */
async function fetchPerson( id: string, key: string ) : Promise<Person> {
	return parsePerson( await getResourceJSON( `people/${ id }`, key ) );
}

/**
 * Fetch time off for a user for given period.
 */
async function fetchTimeOff( personId: string, type: String, interval: DateInterval, key: string ) : Promise<TimeOff[]> {
	const args : any = {
		personId: personId,
		type: type,
		'startDate[$gte]': interval.start,
		'endDate[$lte]': interval.end,
	};

	const json = await getResourceJSON( addQueryArgs( 'time-away', args ), key );
	return json.data.map( parseTimeOff );
}

/**
 * Fetch the time away period object for the current period for a single user.
 *
 * This gives data on that persons holiday allowance for the current year.
 * As well as a summary on how many days they have taken and booked.
 */
async function fetchCurrentTimeAwayPeriodForPerson( id: string, key: string ) : Promise<any> {
	const json = await getResourceJSON( addQueryArgs( 'time-away-periods', {
		personId: id,
		isCurrentPeriod: true,
	} ), key );
	return parseTimeAwayPeriod( json.data[0] );
}

/**
 * Make GET request to a resource by bath and return returns parsed JSON.
 *
 * Handles authentication based on token stored in environment variable.
 */
async function getResourceJSON( path: String, key: string ) {
	// process.env.HUMAANS_API_TOKEN//
	const opts = {
		headers: {
			'Authorization': `Bearer ${ key }`,
		},
	};

	const response = await nodeFetch( `${apiBase}/${path}`, opts );

	if ( response.status === 200 ) {
		return await response.json();
	} else {
		console.log( opts );
		throw new Error( `Request failed: ${apiBase}/${path}` );
	}
}

export {
	fetchMe,
	fetchPerson,
	fetchTimeOff,
	getResourceJSON,
	fetchCurrentTimeAwayPeriodForPerson,
};
