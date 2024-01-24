/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
	},
	images: {
		domains: ['upload.wikimedia.org', 'cdn.abcotvs.com', 'i.natgeofe.com', 'pregonanto.s3.eu-west-3.amazonaws.com', 'static.vecteezy.com', 'dslv9ilpbe7p1.cloudfront.net', 'i.ytimg.com']
	},
}

module.exports = nextConfig
