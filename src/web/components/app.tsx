import React, { useEffect, useState, Fragment } from 'react';

import { AppState, Person, TimeAway, TimeAwayPeriod } from '../types';
import { prepareTimeAway, prepareTimeAwayPeriod } from '../utilities';

import Calendar from './calendar';

/* <QuarterSummaryChart /> */

const initialState : AppState = {
	user: null,
	period: null,
	timeAway: [],
};

/**
 * Convert raw response data into app state.
 */
function parseResponse( responseData : any ) : AppState {
	return {
		user: responseData.person,
		period: prepareTimeAwayPeriod( responseData.currentTimeAwayPeriod ),
		timeAway: responseData.ptoInCurrentPeriod.map( prepareTimeAway ),
	};
}

/**
 * App component.
 */
function App() {
	const [ appState, setAppState ] = useState( initialState );

	useEffect( () => {
		window.fetch( '/api/pto/me' )
			.then( async response => {
				setAppState( parseResponse( await response.json() ) );
				console.log( appState );
			} );
	}, [] );

	return (
		<>
			{ appState.user ? (
				<>
					<p>User: { appState.user.name }</p>
					<Calendar { ...appState } />
				</>
			) : (
				<p>Loading...</p>
			) }
		</>
	);
}

export default App;
