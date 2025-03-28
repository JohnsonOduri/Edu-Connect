
import React from "react";
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Line,
  Bar,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
    }[];
  };
  height?: number;
}

export const LineChart = ({ data, height = 350 }: LineChartProps) => {
  // Convert from chart.js format to recharts format
  const formattedData = data.labels.map((label, index) => {
    const result: Record<string, any> = { name: label };
    data.datasets.forEach(dataset => {
      result[dataset.label] = dataset.data[index];
    });
    return result;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        {data.datasets.map((dataset, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={dataset.label}
            stroke={dataset.borderColor}
            fill={dataset.backgroundColor}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  height?: number;
}

export const BarChart = ({ data, height = 350 }: BarChartProps) => {
  // Convert from chart.js format to recharts format
  const formattedData = data.labels.map((label, index) => {
    const result: Record<string, any> = { name: label };
    data.datasets.forEach(dataset => {
      result[dataset.label] = dataset.data[index];
    });
    return result;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        {data.datasets.map((dataset, index) => (
          <Bar
            key={index}
            dataKey={dataset.label}
            fill={dataset.backgroundColor}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
  height?: number;
}

export const PieChart = ({ data, height = 350 }: PieChartProps) => {
  // For pie chart, we need a different data structure
  const dataset = data.datasets[0]; // Pie charts typically have a single dataset
  const formattedData = data.labels.map((label, index) => ({
    name: label,
    value: dataset.data[index],
    color: dataset.backgroundColor[index]
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
