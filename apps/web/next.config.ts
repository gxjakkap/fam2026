import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	output: "standalone",
	serverExternalPackages: ["pg"],
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
}

export default nextConfig
