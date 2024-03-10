"use client";
import PublicContext from "@/contexts/PublicContext";
import { Spinner } from "@nextui-org/react";
import { useContext, useEffect } from "react";
import { Button } from "./Button";
import { motion } from "framer-motion";

const LongEnough = () => {
	const words = "long enough";

	return (
		<motion.div className="relative text-center">
			{words.split("").map((word, idx) => {
				return (
					<motion.span
						key={word + idx}
						className="bg-gradient-to-t from-primary to-secondary-800 bg-clip-text text-[15em] text-transparent"
						initial={{ opacity: 0 }}
						animate={{
							opacity: 1,
							transition: { duration: 2, delay: idx * 0.05 },
						}}
					>
						{word}
					</motion.span>
				);
			})}
			<motion.span
				className="absolute inset-0 bg-gradient-to-t from-primary to-secondary-800 bg-clip-text text-[15em] text-transparent"
				initial={{ opacity: 0, textShadow: "0px 0px 0px transparent" }}
				animate={{
					opacity: 1,
					textShadow: "0px 0px 150px white",
					transition: { duration: 1.5, delay: 2 },
				}}
			>
				{words}
			</motion.span>
		</motion.div>
	);
};

export default function LoginGuard({ children }: any) {
	const { verified, verifiedLoading, sessionLoading } = useContext(
		PublicContext,
	) as any;

	useEffect(() => {
		if (verified) return;
		document.title = "long enough";
	}, [verified]);

	if (verifiedLoading || sessionLoading)
		return (
			<div className="z-10 flex items-center justify-center">
				<Spinner size="lg" />
			</div>
		);

	return (
		<>
			{verified ? (
				<>{children}</>
			) : (
				<div className="z-10 flex select-none flex-col items-center justify-center gap-14 text-[0.75em]">
					<LongEnough />
					<div className="-mt-12 text-[1.25em] font-light text-foreground-600">
						An interactive gaming platform for the 1337 community.
						All rights reserved 2024 ©.
					</div>
					<Button
						className="px-96 text-lg"
						startContent={
							<img className="h-7 w-7" src="/42_Logo.svg" />
						}
						as="a"
						href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/intra/login`}
					>
						تسجيل الدخول
					</Button>
				</div>
			)}
		</>
	);
}
