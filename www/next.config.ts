import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

let strapiRemotePattern: { protocol: 'http' | 'https'; hostname: string; port?: string } = {
  protocol: 'https',
  hostname: 'buildersapi.salemcapital.cd',
};

try {
  const strapiUrl = new URL(process.env.STRAPI_API_URL || 'https://buildersapi.salemcapital.cd');
  strapiRemotePattern = {
    protocol: strapiUrl.protocol === 'http:' ? 'http' : 'https',
    hostname: strapiUrl.hostname,
    ...(strapiUrl.port ? { port: strapiUrl.port } : {}),
  };
} catch {
  // Keep the default Strapi host when STRAPI_API_URL is invalid.
}

export default withNextIntl({
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      strapiRemotePattern,
    ],
  },
});
