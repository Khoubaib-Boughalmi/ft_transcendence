import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import localFont from 'next/font/local';
import { cookies } from 'next/headers'
import PublicContext from "@/contexts/PublicContext";
import Providers from "@/components/Providers";

const flags = localFont({ src: "../public/TwemojiCountryFlags.woff2", variable: "--flag" })

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = cookies();

	return (
		<html lang="en">
			<Providers cookie={cookieStore.get('access_token')}>
				<body className={poppins.className + " bg-black " + flags.variable}>
					<div className="fixed inset-0 bg-gradient-to-t from-background to-accent to-[250%] overflow-hidden -z-50">
						<img
							className="z-10 h-full w-full scale-150 object-cover mix-blend-overlay "
							src="background2.png"
						/>
						<div className="absolute bottom-0 h-full bg-gradient-to-t from-black to-transparent w-full from-50%">

						</div>
					</div>
					<Navbar />
					<div className="flex justify-center pt-28">
						{children}
					</div>
				</body>
			</Providers>
		</html>
	);
}
