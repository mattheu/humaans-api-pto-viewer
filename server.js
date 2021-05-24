#!/usr/bin/env node

const express = require( 'express' );

const api = require( './build/api.js' );

const app = express();

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use( express.static( 'public' ) );

// Home URL
app.get( '/', ( request, response ) => {
	response.sendFile( __dirname + '/views/index.html' );
} );

app.get( '/api/pto/me', async ( req, res ) => {
	if ( ! req.query.key ) {
		res.sendStatus( 500 );
		return;
	}

	try {
		const person = await api.fetchMe( req.query.key );
		const period = await api.fetchCurrentTimeAwayPeriodForPerson( person.id, req.query.key );
		const timeAway = await api.fetchTimeOff( person.id, 'pto', period.period, req.query.key );

		res.json( {
			person,
			currentTimeAwayPeriod: period,
			ptoInCurrentPeriod: timeAway,
		} );
		return;
	} catch ( e ) {
		console.log( e ); // eslint-disable-line no-console
		res.sendStatus( 500 );
		return;
	}
} );

app.get( '/api/pto/:personId', async ( req, res ) => {
	if ( ! req.params.personId || ! req.query.key ) {
		res.sendStatus( 500 );
		return;
	}

	try {
		const person = await api.fetchPerson( req.params.personId, req.query.key );
		const period = await api.fetchCurrentTimeAwayPeriodForPerson( person.id, req.query.key );
		const timeAway = await api.fetchTimeOff( req.params.personId, 'pto', period.period, req.query.key );

		res.json( {
			person,
			currentTimeAwayPeriod: period,
			ptoInCurrentPeriod: timeAway,
		} );
		return;
	} catch ( e ) {
		console.log( e ); // eslint-disable-line no-console
		res.sendStatus( 500 );
		return;
	}
} );

// listen for requests :)
const listener = app.listen( process.env.PORT, () => {
	console.log( 'http://localhost:' + listener.address().port ); // eslint-disable-line no-console
} );
