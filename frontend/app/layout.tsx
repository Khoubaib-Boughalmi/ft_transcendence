import LoginGuard from "@/components/LoginGuard";
import Providers from "@/components/Providers";
import SuperImage from "@/components/SuperImage";
import TwoFactorAuthenticationGuard from "@/components/TwoFactorAuthenticationGuard";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import { cookies, headers } from "next/headers";
import { Navbar } from "../components/Navbar";
import "./globals.css";
import { usePathname } from "next/navigation";

const flags = localFont({
	src: "../public/TwemojiCountryFlags.woff2",
	variable: "--flag",
	preload: false,
});

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = cookies();
	const accessToken = cookieStore.get("access_token");

	return (
		<html suppressHydrationWarning lang="en" className="dark">
			<body className={poppins.className + " bg-black " + flags.variable}>
				<Providers accessToken={accessToken}>
					<div className="min-w-screen grid min-h-screen grid-cols-1">
						<div className="fixed inset-0 overflow-hidden bg-gradient-to-t from-background to-accent to-[250%]">
							<SuperImage
								width={1280}
								height={720}
								alt="Background"
								className="z-10 h-full w-full scale-150 object-cover mix-blend-overlay blur-lg"
								src="/background2.png"
								priority
							/>
							<div className="absolute bottom-0 h-full w-full bg-gradient-to-t from-black from-50% to-transparent"></div>
						</div>
						<LoginGuard>
							<Navbar />
							<div className="z-10 flex h-full w-full justify-center pt-28">
								<TwoFactorAuthenticationGuard>
									{children}
								</TwoFactorAuthenticationGuard>
							</div>
						</LoginGuard>
					</div>
				</Providers>
			</body>
		</html>
	);
}
