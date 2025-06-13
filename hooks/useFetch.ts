"use client";
import { useState } from "react";
import { toast } from "sonner";

type AsyncFunction<TArgs extends any[], TData> = (
  ...args: TArgs
) => Promise<TData>;

const useFetch = <TArgs extends any[], TData>(
  cb: AsyncFunction<TArgs, TData>
) => {
  const [data, setData] = useState<TData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: TArgs) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error: any) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      setError(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, fn, setData };
};

export default useFetch;
