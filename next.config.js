/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return {
            fallback: process.env.NODE_ENV === 'production' ? [] : [
                {
                    source: '/:api*',
                    destination: `http://10.21.22.99:8088/:api*`,
                },
            ],
        }
    },
    distDir: 'build',
    compress: true,
}

module.exports = nextConfig
