/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: false,
    images: {
        domains: ['i.scdn.co'],
    },
}

export default nextConfig
