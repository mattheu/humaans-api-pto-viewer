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

app.get( '/api/pto/me/', async ( req, res ) => {
	try {
		const person = await api.fetchMe();
		const period = await api.fetchCurrentTimeAwayPeriodForPerson( person.id );
		const timeAway = await api.fetchTimeOff( req.params.personId, 'pto', period.period );

		res.json( {
			...person,
			currentTimeAwayPeriod: period,
			ptoInCurrentPeriod: timeAway,
		} );
		res.json();
	} catch ( e ) {
		console.log( e ); // eslint-disable-line no-console
		res.sendStatus( 500 );
	}
} );

app.get( '/api/pto/:personId', async ( req, res ) => {
	try {
		const person = await api.fetchPerson( req.params.personId );
		const period = await api.fetchCurrentTimeAwayPeriodForPerson( person.id );
		const timeAway = await api.fetchTimeOff( req.params.personId, 'pto', period.period );

		res.json( {
			...person,
			currentTimeAwayPeriod: period,
			ptoInCurrentPeriod: timeAway,
		} );
		res.json();
	} catch ( e ) {
		console.log( e ); // eslint-disable-line no-console
		res.sendStatus( 500 );
	}
} );

// listen for requests :)
const listener = app.listen( process.env.PORT, () => {
	// eslint-disable-next-line no-console
	console.log( 'Your app is listening on port ' + listener.address().port );
} );
