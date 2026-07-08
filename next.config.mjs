/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['@prisma/client', 'prisma'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
};

export default nextConfig;
