/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
	},
	images: {
		remotePatterns: [
			{
				hostname: '*',
			},
		],
	},
}

module.exports = nextConfig
