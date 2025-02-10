// eslint-disable-next-line jsdoc/check-tag-names

// import { parserOptionsConfig } from "./src/demoparser";
import { parserOptionsConfig } from './src/demoparser.tsx';

const config = {
	// Allow Proxy to WordPress assets (scripts, theme files, etc) to prevent CORS issues on localhost.
	useCorsProxy: process.env.NODE_ENV === 'development',
	parserOptions : parserOptionsConfig

};

export default config;
