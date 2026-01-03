"use client";

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export function ok<T>(message: string, data?: T): ApiResponse<T> {
  return { success: true, message, data };
}

export function fail(message: string, error?: string): ApiResponse<never> {
  return { success: false, message, error };
}