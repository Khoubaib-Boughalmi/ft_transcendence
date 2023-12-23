"use client";
import PublicContext from "@/contexts/PublicContext";
import { useContext, useRef, useState } from "react";
import Card from "./Card";
import Input from "./Input";
import { Lock } from "lucide-react";
import { Button } from "./Button";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import axios from "@/lib/axios";
import { makeForm } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Guard({ children }: { children: React.ReactNode}) {
	const router = useRouter();
	const { session, sessionMutate, accessToken, fullMutate, twoFactorAuthenticated } = useContext(PublicContext) as any;
    const [loading, setLoading] = useState(false);
	const submitRef = useRef<HTMLButtonElement>(null);

    const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const otp = formData.get("otp");
		console.log(otp);
		if (otp) 
		{
			try {
				setLoading(true);
				await axios.post("/auth/2fa/login", formData);
				await fullMutate();
				toast.success("Successfully authenticated");
				router.refresh();
			}
			catch (e) {
				toast.error("Invalid code");
			}
			setLoading(false);
		}
    }

	return (
		<>
			{twoFactorAuthenticated ? (
				children
			) : (
				<div className="h-full w-full flex justify-center items-center">
					<Card
						footer={
							<div className="flex w-full justify-end">
								<Button
									onClick={()	=> submitRef?.current?.click()}
									loading={loading}
									variant="danger"
								>
									Confirm
								</Button>
							</div>
						}
						header={"Two Factor Authentication"}
                        className=""
					>
						<form onSubmit={handleRequest} className="flex flex-col items-center gap-4 p-4">
							<Lock size={32} />
							<div className="w-3/4 text-center">
								Two Factor Authentication is required to access
								this page.
							</div>
							<Input
								name="otp"
								placeholder="Enter code"
								classNames={{
									container: "p-4",
								}}
							/>
							<button
								ref={submitRef}
								type="submit"
								className="hidden"
							></button>
						</form>
					</Card>
				</div>
			)}
		</>
	);
}
