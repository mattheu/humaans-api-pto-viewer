/**
 * .config/webpack.config.prod.js :
 * This file defines the production build configuration
 */
const { helpers, externals, presets, plugins } = require( '@humanmade/webpack-helpers' );
const { filePath } = helpers;

module.exports = presets.production( {
	externals,
	entry: {
		app: filePath( 'src/app.ts' ),
	},
	output: {
		path: filePath( 'public/build' ),
	},
	plugins: [
		plugins.clean(),
	]
} );
