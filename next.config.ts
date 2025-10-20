import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  images: { domains: [] },
};

export default withPWA({
  dest: "public",
  disable: !isProd,
})(nextConfig);
