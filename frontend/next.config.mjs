/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Optimizes for production deployment
    poweredByHeader: false, // Removes X-Powered-By header
    compress: true, // Enables gzip compression
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    headers: async () => [
        {
            source: '/:path*',
            headers: [
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff',
                },
                {
                    key: 'X-Frame-Options',
                    value: 'DENY',
                },
                {
                    key: 'X-XSS-Protection',
                    value: '1; mode=block',
                },
                {
                    key: 'Referrer-Policy',
                    value: 'strict-origin-when-cross-origin',
                },
            ],
        },
    ],
};

export default nextConfig;