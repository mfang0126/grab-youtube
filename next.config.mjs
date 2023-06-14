/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

// TODO: Move to s3 bucket
const HOST = "http://freedoming.asuscomm.com:81";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  output: "standalone",
  swcMinify: true,
  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${HOST}/api/:path*`,
      },
      {
        source: "/downloads/:path*",
        destination: `${HOST}/youtube/:path*`,
      },
    ];
  },
};
export default config;
