'use client'
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

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
            },
        ],
    };

    const options = {
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
                    color: style.backgroundColor,
                },
            },
        },
    };

    return <div>
        <Line options={options} data={data} />
    </div>
}
