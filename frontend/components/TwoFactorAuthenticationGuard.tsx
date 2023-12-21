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

export default function Guard({ children }: { children: React.ReactNode}) {

	const { session, sessionMutate, accessToken } = useContext(PublicContext) as any;
    const [loading, setLoading] = useState(false);
	const submitRef = useRef<HTMLButtonElement>(null);
    const payload = jwt?.decode(accessToken.value) as any;
    const allowed = payload?.two_factor_passed === true;

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
				await sessionMutate();
			}
			catch (e) {
				console.log(e);
			}
			setLoading(false);
		}
    }

    console.log(payload, accessToken);

	return (
		<>
			{allowed ? (
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
