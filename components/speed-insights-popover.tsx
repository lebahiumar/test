
// components/speed-insights-popover.tsx
"use client";

import React from 'react';
import { SimpleMessage, formatSpeedInsightNumber, cn } from '@/lib/utils';
import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface SpeedInsightsPopoverProps {
  message: SimpleMessage;
  className?: string;
}

const InsightCategory: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={cn("mb-3 last:mb-0", className)}>
    <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">{title}</h4>
    <div className="grid grid-cols-3 gap-2 text-center">
      {children}
    </div>
  </div>
);

const InsightMetric: React.FC<{ value: string; label: string; valueClassName?: string }> = ({ value, label, valueClassName }) => (
  <div>
    <p className={cn("text-lg sm:text-xl font-semibold text-neutral-800 dark:text-neutral-100", valueClassName)}>{value}</p>
    <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
  </div>
);

export const SpeedInsightsPopoverContent: React.FC<SpeedInsightsPopoverProps> = ({ message, className }) => {
  const {
    promptTokens,
    completionTokens,
    totalTokens,
    timeToFirstToken,
    streamDuration,
    totalInferenceTime,
    roundTripTime,
    modelId,
  } = message;

  const tokensPerSecInput = (timeToFirstToken && promptTokens && timeToFirstToken > 0)
    ? promptTokens / timeToFirstToken
    : 0;
  const tokensPerSecOutput = (streamDuration && completionTokens && streamDuration > 0)
    ? completionTokens / streamDuration
    : 0;
  const tokensPerSecTotal = (totalInferenceTime && totalTokens && totalInferenceTime > 0)
    ? totalTokens / totalInferenceTime
    : 0;

  return (
    <Card className={cn("w-72 sm:w-80 shadow-xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900", className)}>
      <CardHeader className="flex flex-row items-center space-x-2 p-3 border-b border-neutral-100 dark:border-neutral-800">
        <Zap className="h-4 w-4 text-orange-500" />
        <CardTitle className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Speed Insights</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2 text-xs">
        <InsightCategory title="Tokens">
          <InsightMetric value={formatSpeedInsightNumber(promptTokens)} label="Input tokens" />
          <InsightMetric value={formatSpeedInsightNumber(completionTokens)} label="Output tokens" />
          <InsightMetric value={formatSpeedInsightNumber(totalTokens)} label="Total tokens" />
        </InsightCategory>

        <InsightCategory title="Inference Time">
          <InsightMetric value={formatSpeedInsightNumber(timeToFirstToken, 2)} label="Input seconds" />
          <InsightMetric value={formatSpeedInsightNumber(streamDuration, 2)} label="Output seconds" />
          <InsightMetric value={formatSpeedInsightNumber(totalInferenceTime, 2)} label="Total seconds" />
        </InsightCategory>

        <InsightCategory title="Tokens / second">
          <InsightMetric value={formatSpeedInsightNumber(tokensPerSecInput)} label="Input" />
          <InsightMetric value={formatSpeedInsightNumber(tokensPerSecOutput)} label="Output" />
          <InsightMetric value={formatSpeedInsightNumber(tokensPerSecTotal)} label="Total" />
        </InsightCategory>
      </CardContent>
      <CardFooter className="p-3 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-500 dark:text-neutral-400">
        <div className="w-full text-center truncate">
          Round trip: {formatSpeedInsightNumber(roundTripTime, 2)}s &bull; Model: {modelId || 'N/A'}
        </div>
      </CardFooter>
    </Card>
  );
};
