"use client";

import Card from "@/components/Card";
import Divider from "@/components/Divider";
import Input from "@/components/Input";
import { Select, SelectItem, extendVariants } from "@nextui-org/react";

// const NewSelect = extendVariants(Select, {
// 	variants: {
// 		color: {
// 			primary: {
				
// 			}
// 		}
// 	}
// });
	

export default function Settings()
{
	return (
		<main className="mb-12 flex w-[1250px] max-w-full flex-col justify-center gap-4">
			<Card>
				<div className="p-4 flex flex-col items-start gap-4">
					<div className="w-full">
						<div className="bg-white w-full h-96	 rounded-xl overflow-hidden">
							<img src="background2.png" className="h-full w-full object-cover"/>
						</div>
						<div className="w-full mr-auto h-16 relative">
							<div className="h-[200%] aspect-square -translate-y-1/2 rounded-full overflow-hidden">
								<img src="pfp.png" className="h-full w-full aspect-square object-cover" />
							</div>
						</div>
					</div>
					<Divider />	
					<Input classNames={{ container: "p-4 py-2 w-1/2" }} placeholder="Username"/>
				</div>
			</Card>
		</main>
	)
}