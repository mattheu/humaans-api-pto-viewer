import { addYears, endOfDay, isPast, parse, startOfDay, subSeconds } from 'date-fns';

import { DateInterval, TimeAway, TimeAwayBreakdown, TimeAwayPeriod } from '../types';

const apiDateFormat = 'yyyy-MM-dd';
const YEAR_START_MONTH = 3; // month index, april.

/**
 *
 */
export function getYearStart() : Date {
	// return new Date( 2022, YEAR_START_MONTH, 1 );

	const aprilFirst = new Date( new Date().getFullYear(), YEAR_START_MONTH, 1 );

	if ( isPast( aprilFirst ) ) {
		return aprilFirst;
	} else {
		return new Date( new Date().getFullYear() - 1, 3, 1 );
	}
}

/**
 *
 */
export function getCurrentBusinessYearInterval() : DateInterval {
	// If april first of this year. If in the past, that is start, else use previous year.
	const aprilFirst = new Date( new Date().getFullYear(), YEAR_START_MONTH, 1 );
	const start = ( isPast( aprilFirst ) ) ? aprilFirst : new Date( new Date().getFullYear() - 1, 3, 1 );

	return {
		start,
		end: subSeconds( addYears( start, 1 ), 1 ),
	};
}

/**
 *
 */
export function prepareTimeAwayBreakdown( data : any ) : TimeAwayBreakdown {
	return {
		date: parse( data.date, apiDateFormat, new Date() ),
		isFull: !! data.isFull,
		period: data.period,
	};
}

/**
 * Prepare Time Away Object
 */
export function prepareTimeAway( data : any ) : TimeAway {
	const period: DateInterval = {
		start: startOfDay( parse( data.period.start, apiDateFormat, new Date() ) ),
		end: endOfDay( parse( data.period.end, apiDateFormat, new Date() ) ),
	};

	return {
		id: data.days,
		personId: data.days,
		days: data.days,
		breakdown: data.breakdown.map( prepareTimeAwayBreakdown ),
		type: data.type,
		period,
	};
}

/**
 *
 */
export function prepareTimeAwayPeriod( data : any ) : TimeAwayPeriod {
	const period: DateInterval = {
		start: startOfDay( parse( data.period.start, apiDateFormat, new Date() ) ),
		end: endOfDay( parse( data.period.end, apiDateFormat, new Date() ) ),
	};

	return {
		id: data.id,
		personId: data.personId,
		allowance: data.allowance,
		upcoming: data.upcoming,
		used: data.used,
		period,
	};
}

// export function prepareBreakdown( breakdownItem ) : TimeAwayBreakdown {
// 	const date = parse( breakdownItem.date, apiDateFormat, startOfDay( new Date() ) );

// 	return {
// 	  date,
// 	  kind: breakdownItem.kind || 'weekday',
// 	  period: breakdownItem.period || 'full',
// 	};
// }
