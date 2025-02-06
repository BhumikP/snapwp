import { getImageSizeFromAttributes, getStyleObjectFromString } from '@snapwp/core';
import { Image, Link } from '@snapwp/next';
import Parser, { domToReact, Element } from 'html-react-parser';
import React from 'react'; // Required for React.createElement

export const demoConfig = {
	replace: (domNode) => {
		if (domNode instanceof Element) {
			console.log('Parser:', domNode);
			const { attribs, children, name, type } = domNode;
			const { class: className, style, ...attributes } = attribs;
			const { href } = attribs;
			const styleObject = style ? getStyleObjectFromString(style) : undefined;

			if (type === 'tag' && name === 'a') {
				return React.createElement(
					Link,
					{ ...attributes, href, style: styleObject, className: `${className} test filed` },
					domToReact(children, demoConfig) // Recursively process children
				);
			} else if (type === 'tag' && name === 'img') {
				const { width, height } = getImageSizeFromAttributes(attribs);

				const imageAttributes = {
					id: attribs.id,
					mediaDetails: {
						width,
						height,
					},
				};

				const shouldFill = !width && !height && width !== undefined && height !== undefined;

				// Fix attribute casing
				if (attributes.srcset) {
					attributes.srcSet = attributes.srcset;
					delete attributes.srcset;
				}

				if (attributes.fetchpriority) {
					attributes.fetchPriority = attributes.fetchpriority;
					delete attributes.fetchpriority;
				}

				return React.createElement(Image, {
					...attributes,
					src: attribs.src,
					alt: attribs.alt || '',
					height,
					width,
					className,
					fill: shouldFill,
					style: styleObject,
					image: imageAttributes,
				});
			}
		}

		return undefined;
	},
};
