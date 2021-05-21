/**
 * .config/webpack.config.prod.js :
 * This file defines the production build configuration
 */
const { helpers, presets, plugins } = require( '@humanmade/webpack-helpers' );
const { filePath } = helpers;

module.exports = presets.production( {
	entry: {
		app: filePath( 'src/web/app.tsx' ),
	},
	output: {
		path: filePath( 'public/build' ),
	},
	plugins: [
		plugins.clean(),
	],
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ],
	},
} );
