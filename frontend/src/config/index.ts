// Configuration for API endpoints
const config = {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    ENVIRONMENT: process.env.NODE_ENV || 'development',
    // Add other configuration as needed
};

export default config;