import { eachMonthOfInterval, isWithinInterval, isWeekend, compareAsc, differenceInMonths } from 'date-fns';
import { chunk, last, sum } from 'lodash';
import React from 'react';
import { VictoryBar, VictoryAxis, VictoryChart, VictoryLine } from 'victory';

import { TimeAway, TimeAwayBreakdown, TimeAwayPeriod } from '../types';
import { getCurrentBusinessYearInterval } from '../utilities';
import theme from '../victory-theme';

import './graphs.css';

interface QuarterlyReportProps {
	timeAway: Array<TimeAway>;
	currentPeriod: TimeAwayPeriod
}

/**
 * Graphs
 */
function Graphs( { timeAway, currentPeriod } : QuarterlyReportProps ) : JSX.Element | null {
	const yearInterval = getCurrentBusinessYearInterval();

	// All breakdown items, filtered by current year, excluding weekends.
	const breakdowns = timeAway.map( i => i.breakdown ).flat().filter( ( breakdownItem: TimeAwayBreakdown ) => {
		if ( ! isWithinInterval( breakdownItem.date, yearInterval ) ) {
			return false;
		}

		if ( isWeekend( breakdownItem.date ) ) {
			return false;
		}

		// TODO why isn't this working.
		// if ( breakdownItem.kind && ! allowedKinds.includes( breakdownItem.kind ) ) {
		// 	return false;
		// }

		return true;
	} ).sort( ( a: TimeAwayBreakdown, b : TimeAwayBreakdown ) : number => {
		return compareAsc( a.date, b.date );
	} );

	// Get the number of days for each month.
	// Get breakdown items, filter by time and date range.
	// Convert it into data format.
	const totalByMonth = breakdowns.reduce(
		( acc: any, item: TimeAwayBreakdown ) : any => {
			// const month = getMonth( item.date );
			// const year  = getYear( item.date );
			// const key   = `${ year }-${ month }`;
			const key = differenceInMonths( item.date, currentPeriod.period.start );

			return {
				...acc,
				[ key ]: ( acc[ key ] || 0 ) + 1,
			};
		},
		eachMonthOfInterval( yearInterval )
			.map( date => ( {
				[ differenceInMonths( date, currentPeriod.period.start ) ]: 0,
			} ) ).reduce( ( acc: any, value: any ) : any => {
				return Object.assign( acc, value );
			}, {} )
	);

	// Convert the monthly data into quarterly data.
	const quarterlyData = Object.values( chunk( Object.values( totalByMonth ), 3 )
		.map( v => sum( v ) ) )
		.reduce( ( acc: any, days: number, quarter: number ) => ( [ ...acc, {
			quarter: quarter + 1,
			days,
		} ] ), [] );

	const monthlyData = Object.values( totalByMonth )
		.map( ( days: any ) : number => parseInt( days ) )
		.reduce( ( acc: Array<any>, days: number, month: number ) : Array<any> => {
			return [
				...acc,
				{
					x: month + 1,
					y: parseInt( last( acc )?.y || 0 ) + days,
				},
			];
		}, [] );

	const axisStyle : any = {
		axis: {
			stroke: '#CCC',
			strokeWidth: 1,
		},
	};

	// Total allowed.
	const allowedHoliday = currentPeriod.allowance + currentPeriod.carriedOver;

	// minimum holiday to take to avoid loosing days.
	const minimumHoliday = allowedHoliday - currentPeriod.maxCarryOver;

	const months = [ 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J', 'F', 'M' ];

	return (
		<div className="quarterly-report">
			<div className="summary-chart">
				<h2>Time off by quarter.</h2>
				<VictoryChart
					domainPadding={ 60 }
					theme={ theme }
				>
					<VictoryAxis
						dependentAxis
						style={ axisStyle }
					/>
					<VictoryAxis
						style={ axisStyle }
						tickValues={ [ 1, 2, 3, 4 ] }
						// @ts-ignore
						x={ x => `Q${x}` }
					/>
					<VictoryBar
						barRatio={ 1 }
						data={ quarterlyData }
						style={ {
							data: {
								fill: '#333',
								strokeWidth: 1,
							},
						} }
						x="quarter"
						y="days"
					/>
					<VictoryLine
						style={ {
							data: {
								stroke: '#4d4dff',
								strokeWidth: 1,
								strokeDasharray: '5.5',
							},
						} }
						y={ () => 5 }
					/>
				</VictoryChart>
				<p className="caption">
					It is recommended that you take <em>at least</em> 5 days per quarter, which is highlighted on the chart.
				</p>
			</div>
			<div className="summary-chart">
				<h2>Time off by month.</h2>
				<VictoryChart
					domainPadding={ 60 }
					theme={ theme }
				>
					<VictoryAxis
						dependentAxis
						style={ axisStyle }
						tickValues={ [ minimumHoliday, allowedHoliday ] }
					/>
					<VictoryAxis
						domainPadding={ {
							x: [ 0, 0 ],
							y: 0,
						} }
						style={ axisStyle }
						tickFormat={ t => months[ t - 1 ] }
						tickValues={ Array.from( { length: 12 }, ( x, i ) => i + 1  ) }
					/>
					<VictoryLine
						data={ monthlyData }
						style={ {
							data: {
								stroke: '#000',
							},
						} }
					/>

					{ /* Show minimum to avoid losing days */ }
					<VictoryLine
						style={ {
							data: {
								stroke: '#4d4dff',
								strokeWidth: 1,
								strokeDasharray: '5.5',
							},
						} }
						y={ point => point.x < 13 ? minimumHoliday : null }
					/>

					{ /* Show total allowance */ }
					<VictoryLine
						style={ {
							data: {
								stroke: '#CCC',
								strokeWidth: 1,
								strokeDasharray: '5.5',
							},
						} }
						y={ point => point.x < 13 ? allowedHoliday : null }
					/>

					{ /* Current Month */ }
					<VictoryLine
						style={ {
							data: {
								stroke: '#4d4dff',
								strokeWidth: 1,
							},
						} }
						x={ () => 1 + differenceInMonths( new Date(), currentPeriod.period.start ) }
					/>

					<VictoryLine
						data={ [ {
							x: 0,
							y: 0,
						}, {
							x: 12,
							y: minimumHoliday,
						} ] }
						style={ {
							data: {
								stroke: '#CCC',
								strokeWidth: 1,
								strokeDasharray: '5.5',
							},
						} }
					/>
				</VictoryChart>
				<p className="caption">
					The lower horizontal blue line indicates the number of days you need to take to avoid loosing holiday.
					The upper line is your total allowed days.
				</p>
			</div>
		</div>
	);
}

export default Graphs;
