"use client";
import {
	CategoryScale,
	Chart as ChartJS,
	Filler,
	LineElement,
	LinearScale,
	PointElement,
	Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";

import { Line } from "react-chartjs-2";

export function useStyles() {
	const [styles, setStyles] = useState({});

	useEffect(() => {
		const style = getComputedStyle(document.body);
		setStyles({
			primaryColor: `rgb(${style.getPropertyValue("--primary-400")})`,
			cardColor: `rgb(${style.getPropertyValue("--card-500")})`,
			backgroundColor: `rgb(${style.getPropertyValue("--background-900")})`,
		});
	}, []);

	return styles;
}

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Filler,
);

const labels = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export default function App({ activity }: any) {
	const style = useStyles() as any;
	const data = {
		labels,
		datasets: [
			{
				fill: true,
				data: activity,
				borderColor: style.primaryColor,
				backgroundColor: style.cardColor,
				tension: 0.35,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		legend: {
			display: false,
		},
		scales: {
			y: {
				display: false,
			},
			x: {
				display: false,
				ticks: {
					color: style.backgroundColor,
				},
			},
		},
	};

	return (
		<div className="overflow-hidden rounded-b-[25px]">
			<Line options={options} data={data} />
		</div>
	);
}
