import { response } from 'express';
import React, {useState, useEffect} from 'react';
import { Line } from "react-chartjs-2";

const apiURL= 'http://localhost:5000/api';

function LineGraph() {
    const [data, setData] = useState({});

useEffect(() => {
    fetch(`${apiURL}/all`)
    .then(response => response.json())
    .then(data => {

    })
}, []);

const buildChartData = data => {
    const chartData = [];
    let lastDataPoint;
    data.Cumulative_cases.forEach(date => {
        if(lastDataPoint) {
            const newDataPoint = {
                x: date,
                y:data['Cumulative_cases'][date] - lastDataPoint
            }
            chartData.push(newDataPoint);
        }
        lastDataPoint = data['Cumulative_cases'][date];
    })
    return chartData;
}

    return (
        <div>
            <Line 
                data
                options
            />
        </div>
    )
}

export default LineGraph

//2:51:34
