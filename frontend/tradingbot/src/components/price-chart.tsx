"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceArea,
  Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { LoadingSpinner } from "./loading-spinner";

export interface PriceDataPoint {
  time: string;
  price: number;
  prediction?: number;
  volume?: number;
  [key: string]: any;
}

interface PriceChartProps {
  data: PriceDataPoint[];
  height?: number;
  isLoading?: boolean;
  showPrediction?: boolean;
  labeledPoints?: {x: string, y: number, label: string}[];
  onChartClick?: (event: any) => void;
}

export function PriceChart({
  data,
  height = 400,
  isLoading = false,
  showPrediction = false,
  labeledPoints = [],
  onChartClick
}: PriceChartProps) {
  const [leftZoomIndex, setLeftZoomIndex] = useState<number | null>(null);
  const [rightZoomIndex, setRightZoomIndex] = useState<number | null>(null);
  const [zoomData, setZoomData] = useState<PriceDataPoint[]>(data);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    setZoomData(data);
  }, [data]);

  const handleChartMouseDown = (e: any) => {
    if (!e || !e.activeTooltipIndex) return;
    setLeftZoomIndex(e.activeTooltipIndex);
    setRightZoomIndex(null);
  };

  const handleChartMouseMove = (e: any) => {
    if (!e || leftZoomIndex === null || !e.activeTooltipIndex) return;
    setRightZoomIndex(e.activeTooltipIndex);
  };

  const handleChartMouseUp = () => {
    if (leftZoomIndex !== null && rightZoomIndex !== null) {
      const startIndex = Math.min(leftZoomIndex, rightZoomIndex);
      const endIndex = Math.max(leftZoomIndex, rightZoomIndex);

      if (startIndex !== endIndex) {
        setZoomData(data.slice(startIndex, endIndex + 1));
      }
    }
    setLeftZoomIndex(null);
    setRightZoomIndex(null);
  };

  const handleReset = () => {
    setIsRefreshing(true);
    setZoomData(data);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const getAreaCoordinates = () => {
    if (leftZoomIndex !== null && rightZoomIndex !== null) {
      const startIndex = Math.min(leftZoomIndex, rightZoomIndex);
      const endIndex = Math.max(leftZoomIndex, rightZoomIndex);
      return {
        x1: data[startIndex].time,
        x2: data[endIndex].time,
      };
    }
    return {};
  };

  const handleClickWrapper = (chartEvent: any) => {
    if (onChartClick) {
      onChartClick(chartEvent);
    }
  };

  const formatYAxis = (value: number) => {
    // Format numbers for better readability
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isRefreshing}
          className="bg-card/70 backdrop-blur-sm"
        >
          {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ZoomOut className="h-4 w-4" />}
        </Button>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={zoomData}
            onMouseDown={handleChartMouseDown}
            onMouseMove={handleChartMouseMove}
            onMouseUp={handleChartMouseUp}
            onClick={handleClickWrapper}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#4b5563' }}
            />
            <YAxis
              stroke="#9ca3af"
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#4b5563' }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "4px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
            />
            {showPrediction && <Legend />}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Actual Price"
              activeDot={{ r: 6, fill: "#3b82f6", stroke: "#1e3a8a" }}
            />
            {showPrediction && (
              <Line
                type="monotone"
                dataKey="prediction"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Prediction"
                activeDot={{ r: 6, fill: "#10b981", stroke: "#064e3b" }}
              />
            )}

            {labeledPoints.map((point, index) => (
              <ReferenceDot
                key={index}
                x={point.x}
                y={point.y}
                r={5}
                fill={point.label === "bullish" ? "#10b981" : point.label === "bearish" ? "#ef4444" : "#f59e0b"}
                stroke={point.label === "bullish" ? "#047857" : point.label === "bearish" ? "#b91c1c" : "#d97706"}
                strokeWidth={1}
              />
            ))}

            {leftZoomIndex !== null && rightZoomIndex !== null && (
              <ReferenceArea
                {...getAreaCoordinates()}
                strokeOpacity={0.3}
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
