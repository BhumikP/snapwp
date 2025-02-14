import type { SnapWPConfig } from '@snapwp/core/config';

const config: SnapWPConfig = {
	parserOptions: <HTMLReactParserOptions>(): HTMLReactParserOptions => {
		return {
			replace: ( domNode: any ) => {
				return domNode;
			}
		} as HTMLReactParserOptions;
	}
};

export default config;
