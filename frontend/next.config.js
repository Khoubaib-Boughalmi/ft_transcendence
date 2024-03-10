/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
	},
	images: {
		remotePatterns: [
			{
				hostname: "*",
			},
		],
	},
	webpack: (config, options) => {
		config.module.rules.push({
			test: /\.glb$/,
			use: [
				{
					loader: "file-loader",
					options: {
						publicPath: "/_next/static/files",
						outputPath: "static/files",
						name: "[name].[ext]",
					},
				},
			],
		});

		return config;
	},
};

module.exports = nextConfig;
