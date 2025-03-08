"use client";

import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
}

export function ApiErrorBoundary({
  children,
  fallback,
  onRetry,
}: ApiErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Add global error handler for fetch errors
    const handleError = (event: ErrorEvent) => {
      if (event.error instanceof Error &&
          (event.error.message.includes('fetch') ||
           event.error.message.includes('API error'))) {
        setHasError(true);
        setError(event.error);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  const handleRetry = () => {
    setHasError(false);
    setError(null);
    if (onRetry) {
      onRetry();
    }
  };

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error connecting to API</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <div>
            {error?.message || "There was a problem connecting to the server. Please check your connection and try again."}
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
