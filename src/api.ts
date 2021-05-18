const nodeFetch = require('node-fetch');
const { addQueryArgs } = require('@wordpress/url');
const dateFns = require('date-fns');

const apiBase = 'https://app.humaans.io/api';
const dateFormat = 'yyyy-MM-dd';

interface Person {
	name?: string;
	id?: string;
}

interface TimeOffBreakdown {
	date?: Date;
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

interface DateInterval {
	start: Date,
	end: Date,
}

/**
 * Convert raw API data to Person object.
 *
 * @param rawData Raw data from API.
 * @returns Person
 */
function parsePerson( rawData: any ) : Person {
	return {
		name: `${ rawData.firstName || '' } ${ rawData.lastName || '' }`,
		id: rawData.id || '',
	};
}

/**
 * Convert raw API data to breakdown object.
 *
 * @param rawData Raw data from API.
 * @returns TimeOffBreakdown
 */
function parseBreakdown( rawData: any ) : TimeOffBreakdown {
	return {
		date: dateFns.parse( rawData.date, dateFormat, new Date() ),
		period: rawData.period,
		isFull: rawData.period === 'full',
	}
}

/**
 * Convert raw API data to TimeOff object.
 *
 * @param rawData Raw data from API.
 * @returns TimeOff
 */
function parseTimeOff( rawData: any ) : TimeOff {
	return {
		id: rawData.id || '',
		personId: rawData.personId || '',
		type: rawData.type || '',
		days: rawData.days || '',
		period: {
			start: dateFns.parse( rawData.startDate, dateFormat, new Date() ),
			end: dateFns.parse( rawData.endDate, dateFormat, new Date() ),
		},
		breakdown: rawData.breakdown.map( parseBreakdown ),
	};
}

/**
 * Convert raw API data to TimeAwayPeriod object.
 *
 * @param rawData Raw data from API.
 * @returns TimeAwayPeriod
 */
function parseTimeAwayPeriod( rawData: any ) : TimeAwayPeriod {
	return {
		id: rawData.id || '',
		personId: rawData.personId || '',
		allowance: parseFloat( rawData.allowance ),
		used: parseFloat( rawData.ptoUsed ),
		upcoming: parseFloat( rawData.ptoUpcoming ),
		period: {
			start: dateFns.parse( rawData.startDate, dateFormat, new Date() ),
			end: dateFns.parse( rawData.endDate, dateFormat, new Date() ),
		},
	}
}

async function fetchMe() : Promise<Person> {
	return parsePerson( await getResourceJSON( 'me' ) );
}

async function fetchPerson( id: string ) : Promise<Person> {
	return parsePerson( await getResourceJSON( `people/${ id }` ) );
}

/**
 * Fetch time off for a user for given period.
 *
 * @param personId ID of person.
 * @param interval DateInterval
 * @returns Promise<TimeOff[]>
 */
async function fetchTimeOff( personId: string, type?: String, interval?: DateInterval ) : Promise<TimeOff[]> {
	const args : any = {
		personId,
	}

	if ( type ) {
		args['type'] = type;
	}

	if ( interval ) {
		args['startDate[$gte]'] = dateFns.format( interval.start, dateFormat );
		args['endDate[$lte]'] = dateFns.format( interval.end, dateFormat );
	}

	console.log( addQueryArgs( 'time-away', args ) );

	const json = await getResourceJSON( addQueryArgs( 'time-away', args ) );
	return json.data.map( parseTimeOff );
}

async function fetchCurrentTimeAwayPeriodForPerson( id: string ) : Promise<any> {
	const json = await getResourceJSON( addQueryArgs( 'time-away-periods', {
		personId: id,
		isCurrentPeriod: true,
	} ) );
	return parseTimeAwayPeriod( json.data[0] );
}

async function getResourceJSON( path: String ) {
	const opts = {
		headers: {
			'Authorization': `Bearer ${ process.env.HUMAANS_API_TOKEN }`
		},
	};

	const response = await nodeFetch( `${apiBase}/${path}`, opts );

	if ( response.status === 200 ) {
		return await response.json();
	} else {
		throw new Error( 'Request failed' );
	}
}

export {
	fetchMe,
	fetchPerson,
	fetchTimeOff,
	getResourceJSON,
	fetchCurrentTimeAwayPeriodForPerson,
};
