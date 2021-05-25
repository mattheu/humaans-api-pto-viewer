import React, { useEffect, useReducer, useRef } from 'react';

import { AppState, Person } from '../types';
import { prepareTimeAway, prepareTimeAwayPeriod } from '../utilities';

import './app.css';

import Calendar from './calendar';
import Graphs from './graphs';
import Summary from './summary';

const initialState : AppState = {
	people: [],
	periods: [],
	timeAway: [],
	apiKey: window.sessionStorage.getItem( 'apiKey' ) || null,
	selectedUserId: null,
};

interface ApiKeyFormProps {
	onSubmit: ( key : string ) => void,
}

/**
 * Component to handle saving key.
 */
function ApiKeyForm( { onSubmit } : ApiKeyFormProps ) : JSX.Element {
	const inputRef = useRef<HTMLInputElement>( null );

	/**
	 * Submit handler.
	 */
	const handleSubmit = ( e : React.SyntheticEvent ) => {
		if ( inputRef.current ) {
			onSubmit( inputRef.current.value );
		}
	};

	return (
		<form onSubmit={ handleSubmit }>
			<label>API Key</label>
			<input ref={ inputRef } type="text" />
			<button type="submit">Save key</button>
		</form>
	);
}

/**
 * Filter an array to remove items by ID.
 *
 * Pass an array to filter and an array of IDs to remove.
 */
function removeItemsFromArrayByIds( a : Array<any>, ids : Array<string> ) : Array<any> {
	return a.filter( item => ! ids.includes( item?.id ) );
}

/**
 * Utliity function to get an array of IDs from an array of objects.
 */
function pluckIds( a: Array<any> ) : Array<string> {
	return a.map( ( i : any ) : string => i?.id );
}
interface Action {
	type: string,
	payload: any,
}

/**
 * Utility function to update state with a new array.
 *
 * Handles de-duping of existing items.
 */
function handleArrayOfItemsAction( property: string, payload: Array<any>, initialState: Array<any> = [] ) : Object {
	return {
		[ property ]: [
			...removeItemsFromArrayByIds( initialState, pluckIds( payload ) ),
			...payload,
		],
	};
}

/**
 * App State Reducer
 */
function reducer( state: AppState, action: Action ) : AppState {
	switch ( action.type ) {
		case 'appendPeople' :
			return {
				...state,
				...handleArrayOfItemsAction( 'people', action.payload, state.people ),
			};
		case 'appendPeriods' :
			return {
				...state,
				...handleArrayOfItemsAction( 'periods', action.payload, state.periods ),
			};
		case 'appendTimeAway' :
			return {
				...state,
				...handleArrayOfItemsAction( 'timeAway', action.payload, state.timeAway ),
			};
		case 'updateApiKey' :
			sessionStorage.setItem( 'apiKey', action.payload );
			return {
				...state,
				apiKey: action.payload,
			};
		case 'updateSelectedUserId' :
			return {
				...state,
				selectedUserId: action.payload,
			};
		default:
			return state;
	}
}

/**
 * App component.
 */
function App() : JSX.Element {
	const [ appState, dispatch ] = useReducer( reducer, initialState );

	const selectedUser = appState.selectedUserId ? appState.people.find( p => p.id === appState.selectedUserId ) : null;
	const period = appState.selectedUserId ? appState.periods.find( p => p.personId === appState.selectedUserId ) : null;
	const timeAway = appState.timeAway.filter( t => t.personId === ( selectedUser?.id || '' ) );

	/**
	 * Handle the PTO response, and dispatch actions to update data.
	 */
	function handlePtoResponse( responseData : any ) : void {
		dispatch( {
			type: 'appendPeople',
			payload: [ responseData.person ],
		} );

		dispatch( {
			type: 'appendPeriods',
			payload: [ prepareTimeAwayPeriod( responseData.currentTimeAwayPeriod ) ],
		} );

		dispatch( {
			type: 'appendTimeAway',
			payload: responseData.ptoInCurrentPeriod.map( prepareTimeAway ),
		} );
	}

	useEffect( () => {
		if ( ! appState.apiKey ) {
			return;
		}

		/**
		 * Fetch data for direct reports.
		 */
		function fetchReports( directReports : Array<string> ) : void {
			directReports.forEach( ( reportId : string ) : void => {
				window.fetch( `/api/pto/${ reportId }?key=${ appState.apiKey }`  ).then( async response => {
					handlePtoResponse( await response.json() );
				} );
			} );
		}

		window.fetch( `/api/pto/me?key=${ appState.apiKey }` )
			.then( async response => {
				const data = await response.json();
				handlePtoResponse( data );

				dispatch( {
					type: 'updateSelectedUserId',
					payload: data.person.id,
				} );

				if ( data.person.directReports ) {
					fetchReports( data.person.directReports );
				}

			} );
	}, [ appState.apiKey ] );

	return (
		<>
			{ ! appState.apiKey && (
				<ApiKeyForm
					onSubmit={ ( newKey : string ) : void => {
						dispatch( {
							type: 'updateApiKey',
							payload: newKey,
						} );
					} }
				/>
			) }

			{ appState.apiKey && ! selectedUser && (
				<p>Loading...</p>
			) }

			{ appState.people.length > 1 && (
				<select onChange={ e => {
					dispatch( {
						type: 'updateSelectedUserId',
						payload: e.target.value,
					} );
				} }>
					{ appState.people.map( ( p : Person ) : JSX.Element => (
						<option
							key={ p.id }
							value={ p.id }
						>
							{ p.name }
						</option>
					) ) }
				</select>
			) }

			{ ( selectedUser && period ) && (
				<>
					<Summary currentPeriod={ period } timeAway={ timeAway } user={ selectedUser } />
					<Calendar timeAway={ timeAway } />
					<Graphs currentPeriod={ period } timeAway={ timeAway } />
				</>
			) }

		</>
	);
}

export default App;
