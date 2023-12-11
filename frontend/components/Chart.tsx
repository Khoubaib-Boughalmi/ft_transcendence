"use client";
import React, { useEffect, useState } from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Filler,
	Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

export function useStyles() {
	const [styles, setStyles] = useState({});

	useEffect(() => {
		const style = getComputedStyle(document.body);
		setStyles({
			primaryColor: style.getPropertyValue("--primary-400"),
			cardColor: style.getPropertyValue("--card-500"),
			backgroundColor: style.getPropertyValue("--background-900"),
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
    "December"
];;

export default function App() {
	const style = useStyles() as any;
	const data = {
		labels,
		datasets: [
			{
				fill: true,
				data: labels.map((v, i) => Math.round(Math.random() * 100)),
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
		<div className="rounded-[25px] overflow-hidden" >
			<Line options={options} data={data} />
		</div>
	);
}
