import React, { use, useEffect, useRef } from "react";

import socket from "@/lib/socket";

export const TimingComponent = (props) => {
	useEffect(() => {
		console.log("TimingComponent", props.Timing);
	}, [props.Timing]);

	return (
		<div
			className="absolute inset-0 z-10 flex flex flex-col items-center items-center justify-center font-bold text-white text-white"
			style={{ fontSize: "10rem" }}
		>
			{props.Timing}
		</div>
	);
};

export default TimingComponent;
