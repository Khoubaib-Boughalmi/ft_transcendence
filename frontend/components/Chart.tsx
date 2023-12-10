import React, { use } from "react";
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
const style = getComputedStyle(document.body);


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
);

export const options = {
    responsive: true,
    legend: {
        display: false,
    },
    scales: {
        y: {
            display: false,
        },
        x: {
            ticks: {
                color: style.getPropertyValue("--background-900"),
            },
        },
    },
};

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const data = {
    labels,
    datasets: [
        {
            fill: true,
            data: labels.map((v, i) => Math.round(Math.random() * 100)),
            borderColor: style.getPropertyValue("--primary-400"),
            backgroundColor: style.getPropertyValue("--card-500"),
		},
	],
};

export default function App() {
	return <div>
            <Line options={options} data={data} />
        </div>
}
