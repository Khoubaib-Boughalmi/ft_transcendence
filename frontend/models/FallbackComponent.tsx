import { use, useEffect } from "react";

export const FallbackComponent = () => {
	useEffect(() => {
		console.log("Loading...");
		return () => {
			console.log("Loaded");
		};
	});

	return (
		<div
			style={{
				// background: "#171720",
				// gradient: "linear-gradient(45deg, #171720, #3f3f3f)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "75vh",
				borderRadius: `20px`,
			}}
		>
			<div
				className="text-4xl text-white"
				style={{
					fontFamily: "Roboto",
					fontWeight: 900,
					letterSpacing: 1.5,
					textShadow: "0px 0px 10px rgba(255,255,255,0.5)",
					color: "#ff1f00",
					fontSize: "3rem",
				}}
			>
				Loading...
			</div>
		</div>
	);
};
export default FallbackComponent;
