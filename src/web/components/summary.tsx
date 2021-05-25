import { add, isWithinInterval, isWeekend, isBefore, parse } from 'date-fns';
import React from 'react';

import { Person, TimeAway, TimeAwayBreakdown, TimeAwayPeriod } from '../types';

interface SummaryProps {
	user: Person;
	currentPeriod: TimeAwayPeriod;
	timeAway: Array<TimeAway>;
}

/**
 * Display a summary of time off.
 */
function Summary( { user, currentPeriod, timeAway } : SummaryProps ) : JSX.Element {
	const endOfFirstHalf = add( currentPeriod.period.start, { months: 6 } );
	const firstHalfRange = {
		start: currentPeriod.period.start,
		end: endOfFirstHalf,
	};

	const allowanceWithRollover = currentPeriod.allowance + currentPeriod.carriedOver;

	// Work out the total number of days taken or planned within the first half of the year.
	const daysInFirstHalf = timeAway
		.map( ( t: TimeAway ) : Array<TimeAwayBreakdown>  => t.breakdown )
		.flat()
		.filter( ( breakdown: TimeAwayBreakdown ) => {
			return ! isWeekend( breakdown.date ) && isWithinInterval( breakdown.date, firstHalfRange );
		} )
		.map( ( breakdown: TimeAwayBreakdown ) : number => breakdown.isFull ? 1 : 0.5 )
		.reduce( ( total: number, item: number ) : number => total + item, 0 );

	return (
		<table><tbody>
			<tr>
				<th>User</th>
				<td>{ user.name }</td>
			</tr>

			{ currentPeriod && (
				<>
					<tr>
						<th>Allowance</th>
						<td>{ currentPeriod.allowance } + { currentPeriod.carriedOver } = { currentPeriod.allowance + currentPeriod.carriedOver }</td>
					</tr>
					<tr>
						<th>Days Used</th>
						<td>{ currentPeriod.used }</td>
					</tr>
					<tr>
						<th>Days Planned</th>
						<td>{ currentPeriod.upcoming }</td>
					</tr>
					<tr>
						<th>Remaining</th>
						<td>{ allowanceWithRollover - currentPeriod.used - currentPeriod.upcoming }</td>
					</tr>

					{ isBefore( new Date(), parse( 'October 1', 'MMMM d', new Date() ) ) && (
						<tr>
							<th>Days still to book off before Oct 1st</th>
							<td>{ Math.max( 15 - daysInFirstHalf, 0 ) }</td>
						</tr>
					) }

					{ isWithinInterval( new Date(), {
						start: parse( 'October 1', 'MMMM d', new Date() ),
						end: parse( 'December 1', 'MMMM d', new Date() ),
					} ) && (
						<tr>
							<th>Days to book before December 1st</th>
							<td>{ Math.max( 0, allowanceWithRollover - currentPeriod.upcoming - currentPeriod.used - currentPeriod.maxCarryOver ) }</td>
						</tr>
					) }
				</>
			) }
		</tbody></table>
	);
}

export default Summary;
