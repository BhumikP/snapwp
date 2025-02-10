import { type NextConfig } from 'next';
import fs from 'fs';
import path from 'path';
import { getConfig, setConfig } from '@snapwp/core/config';
import {
	ModifySourcePlugin,
	ReplaceOperation,
} from 'modify-source-webpack-plugin';

/**
 * Modifies the webpack configuration to include SnapWP configuration.
 * TODO: Explore a better approach to support Turbopack.
 *
 * @param snapWPConfigPath The path to the SnapWP configuration file.
 * @return A function that modifies the webpack configuration.
 */
const modifyWebpackConfig = ( snapWPConfigPath: string ) => {
	/**
	 * Modifies the webpack configuration. This function is called by Next.js.
	 *
	 * @param config The webpack configuration. Using `any` type as the parameter type is `any` in Next.js.
	 * @see node_modules/next/dist/server/config-shared.js:169
	 * @return The modified webpack configuration.
	 */
	return ( config: any ) => {
		const configPath = `
			import __snapWPConfig from '${ snapWPConfigPath }';
		`;

		// Transpile snapwp.config.ts
		//transpile tsx files also to support snapwp.config.tsx
		config.module.rules.push( {
			test: /\.ts$/,
			// include: [
			// 	path.resolve( process.cwd(), 'snapwp.config.ts' ), // Explicitly transpile this file
			// ],
			use: [
				{
					loader: 'ts-loader',
					options: {
						transpileOnly: true, // Skip type checking for faster builds
					},
				},
			],
		} );
		config.plugins.push(
			new ModifySourcePlugin( {
				rules: [
					{
						/**
						 * Tests whether the module should be modified.
						 *
						 * @param normalModule The normal module being processed.
						 * @return `true` if the module should be modified, otherwise `false`.
						 */
						test: ( normalModule ) => {
							const userRequest = normalModule.userRequest || '';

							const startIndex =
								userRequest.lastIndexOf( '!' ) === -1
									? 0
									: userRequest.lastIndexOf( '!' ) + 1;

							const moduleRequest = userRequest
								.substring( startIndex )
								.replace( /\\/g, '/' );

							return /snapwp-config-manager.(ts|js)$/.test(
								moduleRequest
							);
						},
						operations: [
							new ReplaceOperation(
								'once',
								"'use snapWPConfig';",
								configPath
							),
						],
					},
				],
			} )
		);

		return config;
	};
};

/**
 * Extends the Next.js configuration with SnapWP configuration.
 *
 * @param nextConfig The Next.js configuration object.
 * @return The extended configuration object.
 */
const withSnapWP = async ( nextConfig?: NextConfig ): Promise< NextConfig > => {
	// eslint-disable-next-line no-console
	console.log( 'process.cwd()', process.cwd() );
	const possibleSnapWPConfigPaths = [
		process.cwd() + '/snapwp.config.ts',
		process.cwd() + '/snapwp.config.js',
		process.cwd() + '/snapwp.config.mjs',
	];
	// eslint-disable-next-line no-console
	console.log( { possibleSnapWPConfigPaths } );
	// Locate the SnapWP configuration file.
	const snapWPConfigPath = possibleSnapWPConfigPaths.find( ( paths ) => {
		return fs.existsSync( paths );
	} );

	if ( ! snapWPConfigPath ) {
		throw new Error( 'SnapWP configuration file not found.' );
	}

	const snapWPConfig = require( snapWPConfigPath ).default;
	setConfig( snapWPConfig );
	const homeUrl = new URL( getConfig().homeUrl );

	return {
		...nextConfig,
		images: {
			remotePatterns: [
				{
					protocol: 'http',
					hostname: homeUrl.hostname,
				},
				{
					protocol: 'https',
					hostname: homeUrl.hostname,
				},
			],
		},
		webpack: modifyWebpackConfig( snapWPConfigPath ),
	};
};

export default withSnapWP;
