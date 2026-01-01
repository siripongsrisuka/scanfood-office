import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";


const TripleChart = ({ datasets, bar }) => {
  return (
    <ResponsiveContainer width="100%" height="90%">
         <BarChart
          width={500}
          height={300}
          data={datasets}
        >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey={bar[0]} fill='#FF5757' />
      <Bar dataKey={bar[1]} fill='#FA8D94' />
      <Bar dataKey={bar[2]} fill='#00F39F' />
      <Bar dataKey={bar[3]} fill='#C6BDF4' />
    </BarChart>
        
      </ResponsiveContainer>
  );
};

export default TripleChart;
