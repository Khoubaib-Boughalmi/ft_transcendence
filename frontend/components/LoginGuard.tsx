"use client";
import PublicContext from "@/contexts/PublicContext";
import { Spinner } from "@nextui-org/react";
import { useContext, useEffect } from "react";
import { Button } from "./Button";
import { motion } from "framer-motion";
import Divider from "./Divider";
import { useRouter } from "next/navigation";

const LongEnough = () => {
	const words = "Transcendence";

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
	const router = useRouter();

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
				<div onClick={() => {
					router.push(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/intra/login`)
				}}  className="z-10 flex flex-col select-none  items-center text-[0.75em] justify-center relative active:scale-95 transition-all active:opacity-50">
					<div>
						
					<LongEnough />
					<div className="-mt-14 text-[1.25em] font-light text-foreground-600 bg-card-500 rounded-3xl px-4 py-2 animate-slow_fadein">
						An interactive gaming platform for the 1337 community.
						All rights reserved 2024 ©.
					</div>
					</div>
					<div className="text-xl absolute bottom-32 text-neutral-500 animate-bounce">
						انقر في أي مكان للمتابعة
					</div>
				</div>
			)}
		</>
	);
}
