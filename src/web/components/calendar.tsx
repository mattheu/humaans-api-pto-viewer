import classNames from 'classnames';
import { min, max, isBefore, areIntervalsOverlapping, isWeekend, addDays, getDaysInMonth, startOfWeek, eachDayOfInterval, isSameDay, endOfWeek, endOfMonth, format, startOfMonth, addMonths, differenceInDays, isWithinInterval, isEqual } from 'date-fns';
import React, { Fragment } from 'react';

import { TimeAway, AppState } from '../types';
import { getYearStart } from '../utilities';

import './calendar.css';

const startOfWeekGlobalConfig : any = {
	weekStartsOn: 1,
};

interface TimeAwayMarkerProps {
	day: number,
	length: number,
	isStart?: Boolean,
	isEnd?: Boolean,
	isPadding?: Boolean,
	padStart: number,
	text: string,
}

/**
 * Time Away Marker.
 */
function TimeAwayMarker( {
	day,
	length,
	isStart = false,
	isEnd = false,
	isPadding = false,
	padStart,
	text = '',
} : TimeAwayMarkerProps ) : JSX.Element {
	return (
		<div
			className={ classNames( 'time-away__item', {
				'time-away__item--start': isStart,
				'time-away__item--end': isEnd,
				'time-away__item--is-pad': isPadding,
			} ) }
			style={ {
				gridColumnStart: day + padStart,
				gridColumnEnd: day + length + padStart + 1,
				gridRow: 1,
			} }
		>
		</div>
	);

}

interface TimeAwayHighlightProps {
	monthStart: Date,
	monthEnd: Date,
	displayStart: Date,
	displayEnd: Date,
	timeAwayData: Array<TimeAway>,
	maxDisplayDays: number,
}

/**
 * Time Away Highlight
 */
function TimeAwayHighlight( {
	monthStart,
	monthEnd,
	displayStart,
	displayEnd,
	timeAwayData,
	maxDisplayDays,
} : TimeAwayHighlightProps ) : JSX.Element {
	return (
		<div className="time-away" style={ { gridTemplateColumns: `repeat( ${ maxDisplayDays + 1 }, 2.5em )` } }>

			{ timeAwayData.map( ( timeAway : TimeAway, i : number ) => {
				const padStart = differenceInDays( monthStart, displayStart );
				const timeAwayStart = max( [ monthStart, timeAway.period.start ] );
				const timeAwayEnd = min( [ monthEnd, timeAway.period.end ] );

				const isStart = isBefore( monthStart, timeAway.period.start ) || isEqual( monthStart, timeAway.period.start );
				const isEnd = isBefore( timeAway.period.end, monthEnd ) || isEqual( timeAway.period.end, monthEnd );

				const text = ( timeAway.days > 1 ) ? `${ timeAway.days } days` : `${ timeAway.days } day`;

				const padStartDay = ! isStart ? max( [ displayStart, timeAway.period.start ] ) : null;
				const padEndDay = ! isEnd ? min( [ displayEnd, timeAway.period.end ] ) : null;

				// if ( ! isEnd ) {
				//   console.log( {
				//     padEndDay,
				//     day:  differenceInDays( padEndDay, monthStart ) + 1,
				//     l: differenceInDays( padEndDay, timeAwayEnd ),
				//   } );
				// }

				return (
					<Fragment key={ `${ timeAwayStart.getDate() }-${ timeAwayEnd.getDate() }-${ i }` }>
						<TimeAwayMarker
							day={ timeAwayStart.getDate() }
							isEnd={ isEnd }
							isStart={ isStart }
							length={ differenceInDays( timeAwayEnd, timeAwayStart ) }
							padStart={ padStart }
							text={ text }
						/>
					</Fragment>
				);
			} ) }
		</div>
	);
}

interface MonthProps {
	start: Date,
	end: Date,
	displayStart: Date,
	maxDisplayDays: number,
	padStart: number,
	timeAwayData: Array<TimeAway>,
}
/**
 *
 */
function Month( {
	start,
	end,
	displayStart,
	maxDisplayDays,
	padStart,
	timeAwayData = [],
} : MonthProps ) : JSX.Element {
	const displayEnd = addDays( displayStart, maxDisplayDays );
	const days = eachDayOfInterval( {
		start: displayStart,
		end: displayEnd,
	} );

	// Interval for the actual month, not displayed days.
	const monthInterval = {
		start,
		end,
	};

	return (
		<div className="cal__month">
			<h2 className="cal__month-title">{ format( start, 'MMM yyyy' ) }</h2>
			<div className="cal__month-days" style={ { gridTemplateColumns: `repeat( ${ maxDisplayDays + 1 }, 2.5em )` } }>
				{ days.map( day => (
					<div
						key={ day.toISOString() }
						className={ classNames( 'cal__day', {
							'cal__day--is-pad': ! isWithinInterval( day, monthInterval ),
							'cal__day--is-weekend': isWeekend( day ),
							'cal__day--is-current': isSameDay( day, new Date() ),
						} ) }
					>{ format( day, 'd' ) }</div>
				) ) }
			</div>
			<TimeAwayHighlight
				displayEnd={ displayEnd }
				displayStart={ displayStart }
				maxDisplayDays={ maxDisplayDays }
				monthEnd={ end }
				monthStart={ start }
				// padStart={ padStart }
				timeAwayData={ timeAwayData }
			/>
		</div>
	);
}

/**
 *
 */
function Calendar( { user, period, timeAway } : AppState ) : JSX.Element {
	const yearStartDate = getYearStart();

	const months = Array.from( { length: 12 }, ( v, i ) => {
		const start = startOfMonth( addMonths( yearStartDate, i ) );
		const end = endOfMonth( start );
		const displayStart = startOfWeek( start, startOfWeekGlobalConfig );
		const displayEnd = endOfWeek( end, startOfWeekGlobalConfig );
		// const displayEnd = end;

		const allowedTypes = [ 'pto', 'away' ];
		const timeAwayData = timeAway
			.filter( timeAway => !! allowedTypes.includes( timeAway.type ) )
			.filter( timeAway => areIntervalsOverlapping( {
				start,
				end,
			}, timeAway.period ) );

		return {
			start,
			end,
			days: getDaysInMonth( start ),
			displayStart,
			displayEnd,
			displayDays: differenceInDays( displayEnd, displayStart ),
			padStart: differenceInDays( start, displayStart ),
			padEnd: differenceInDays( displayEnd, end ),
			timeAwayData,
		};
	} );

	const maxDisplayDays = Math.max( ...months.map( month => month.displayDays ) );

	return (
		<div className="cal">
			<div className="cal__header">
				<div></div>
				{ Array.from( { length: 6 } ).map( ( v, i ) => (
					<div key={ `week-${ i }` }>Mon</div>
				) ) }
			</div>
			<>
				{ months.map( month => {
					return (
						<Month
							key={ month.start.toISOString() }
							{ ...month }
							maxDisplayDays={ maxDisplayDays }
					  />
					);
				} ) }
			</>
		</div>
	);
}

export default Calendar;
