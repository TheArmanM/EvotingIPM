// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactCompiler: true,
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tambahkan baris ini untuk mengizinkan akses dari IP lokal Anda
  allowedDevOrigins: ['192.168.156.1', 'localhost'],
};

export default nextConfig;