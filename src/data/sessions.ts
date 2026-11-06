export const SESSION_PERIODS = ["This year", "Last year", "Last 6 months"] as const;
export type SessionPeriod = (typeof SESSION_PERIODS)[number];

export interface SessionPoint {
  month: string;
  sessions: number;
  /** Taux de conversion, en points de pourcentage. */
  conversion: number;
}

export interface SessionDataset {
  delta: number;
  /** Taux de conversion sur la période, en points de pourcentage. */
  conversion: number;
  points: readonly SessionPoint[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const THIS_YEAR_SESSIONS = [4800, 5200, 5600, 6100, 6500, 6900, 7300, 7600, 7800, 8100, 8000, 9300];
const THIS_YEAR_CONVERSION = [3.1, 3.4, 3.2, 3.8, 4.1, 3.9, 3.6, 3.7, 4.2, 3.9, 3.5, 4.0];

const zip = (
  months: readonly string[],
  sessions: readonly number[],
  conversion: readonly number[],
): SessionPoint[] =>
  months.map((month, index) => ({
    month,
    sessions: sessions[index] ?? 0,
    conversion: conversion[index] ?? 0,
  }));

export const sessionData: Record<SessionPeriod, SessionDataset> = {
  "This year": {
    delta: 9.4,
    conversion: 3.7,
    points: zip(MONTHS, THIS_YEAR_SESSIONS, THIS_YEAR_CONVERSION),
  },
  "Last year": {
    delta: 5.1,
    conversion: 3.3,
    points: zip(
      MONTHS,
      [4300, 4700, 4400, 5300, 5900, 5600, 6400, 6200, 7000, 6800, 7300, 7700],
      [2.8, 3.1, 2.6, 3.3, 3.6, 3.0, 3.4, 3.2, 3.9, 3.5, 3.7, 3.4],
    ),
  },
  "Last 6 months": {
    delta: 7.2,
    conversion: 3.8,
    points: zip(MONTHS.slice(6), THIS_YEAR_SESSIONS.slice(6), THIS_YEAR_CONVERSION.slice(6)),
  },
};
