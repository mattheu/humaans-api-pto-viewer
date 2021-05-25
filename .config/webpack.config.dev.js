/**
 * .config/webpack.config.prod.js :
 * This file defines the production build configuration
 */
const { helpers, presets, plugins } = require( '@humanmade/webpack-helpers' );
const { choosePort, filePath } = helpers;

module.exports = choosePort( 8080 ).then( port => [
	presets.development( {
		name: 'calendar',
		devServer: {
			port,
		},
		entry: {
			app: filePath( 'src/web/app.tsx' ),
		},
		output: {
			path: filePath( 'public/build' ),
			publicPath: `http://localhost:${ port }/calendar/`,
		},
		plugins: [
			plugins.clean(),
		],
		resolve: {
			extensions: [ '.tsx', '.ts', '.js' ],
		},
	} ),
] );
