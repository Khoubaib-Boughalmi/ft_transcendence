"use client";
import PublicContext from "@/contexts/PublicContext";
import { Spinner } from "@nextui-org/react";
import { useCallback, useContext, useEffect, useRef } from "react";
import { Button } from "./Button";
import { motion, stagger, useAnimate } from "framer-motion";

export default function LoginGuard({ children }: any) {
	const { verified, verifiedLoading, sessionLoading } = useContext(
		PublicContext,
	) as any;
	const [scope, animate] = useAnimate();

	const divRef = useCallback(() => {
		animate([
			["span", { opacity: 1 }, { duration: 2, delay: stagger(0.05) }],
		]);
		setTimeout(() => {
			animate(
				"span",
				{ textShadow: "0px 0px 150px white" },
				{ duration: 1.5 },
			);
		}, 1500);
	}, []);

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
				<div
					ref={divRef}
					className="z-10 flex select-none flex-col items-center justify-center gap-14 text-[0.75em]"
				>
					<motion.div ref={scope}>
						{"long enough".split("").map((word, idx) => {
							return (
								<motion.span
									key={word + idx}
									className="bg-gradient-to-t from-primary to-secondary-800 bg-clip-text text-[15em] text-transparent opacity-0"
								>
									{word}
								</motion.span>
							);
						})}
					</motion.div>
					<div className="-mt-12 text-[1.25em] font-light text-foreground-600">
						An interactive gaming platform for the 1337 community.
						All rights reserved 2023 ©.
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
