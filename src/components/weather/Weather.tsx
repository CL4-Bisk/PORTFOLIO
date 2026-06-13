"use client";

import { useEffect, useState } from "react";

type ForecastResponse = {
  timezone: string;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
};

type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "success";
      forecast: ForecastResponse;
      locationName: string;
      note?: string;
    };

const OPENMETEO_API_URL =
  process.env.NEXT_PUBLIC_OPENMETEO_API_URL ??
  "https://api.open-meteo.com/v1/forecast";

const FALLBACK_LOCATION = {
  latitude: 10.642,
  longitude: 122.2363,
  name: "Iloilo fallback",
};
const loadingMetricLabels = ["High", "Low", "Rain", "Wind"];

function getBrowserPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    });
  });
}

function buildForecastUrl(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily:
      "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,wind_speed_10m_max",
    timezone: "auto",
    forecast_days: "7",
  });

  return `${OPENMETEO_API_URL}?${params}`;
}

function getWeatherLabel(code: number) {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Weather";
}

export function Weather() {
  const [weather, setWeather] = useState<WeatherState>({ status: "idle" });

  useEffect(() => {
    let isActive = true;

    async function fetchForecast(
      latitude: number,
      longitude: number,
      locationName: string,
      note?: string,
    ) {
      const response = await fetch(buildForecastUrl(latitude, longitude));

      if (!response.ok) {
        throw new Error("Weather request failed.");
      }

      const forecast = (await response.json()) as ForecastResponse;
      if (isActive) {
        setWeather({ status: "success", forecast, locationName, note });
      }
    }

    async function loadWeather() {
      if (isActive) {
        setWeather({ status: "loading" });
      }

      try {
        if (!("geolocation" in navigator)) {
          throw new Error("Geolocation is not available in this browser.");
        }

        const position = await getBrowserPosition();
        await fetchForecast(
          position.coords.latitude,
          position.coords.longitude,
          "Your location",
        );
      } catch {
        try {
          await fetchForecast(
            FALLBACK_LOCATION.latitude,
            FALLBACK_LOCATION.longitude,
            FALLBACK_LOCATION.name,
            "Location access was unavailable, showing fallback forecast.",
          );
        } catch (error) {
          if (!isActive) return;
          setWeather({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to load the weather forecast.",
          });
        }
      }
    }

    void loadWeather();

    return () => {
      isActive = false;
    };
  }, []);

  const today =
    weather.status === "success"
      ? {
          date: weather.forecast.daily.time[0],
          high: weather.forecast.daily.temperature_2m_max[0],
          low: weather.forecast.daily.temperature_2m_min[0],
          code: weather.forecast.daily.weather_code[0],
          rain: weather.forecast.daily.precipitation_probability_max[0],
          wind: weather.forecast.daily.wind_speed_10m_max[0],
        }
      : null;
  const weatherSummary =
    weather.status === "success"
      ? `${weather.locationName} - ${weather.forecast.timezone}`
      : "Loading weather from your browser location.";
  const metrics = today
    ? [
        { label: "High", value: `${Math.round(today.high)} C` },
        { label: "Low", value: `${Math.round(today.low)} C` },
        { label: "Rain", value: `${today.rain}%` },
        { label: "Wind", value: `${Math.round(today.wind)} km/h` },
      ]
    : [];

  return (
    <section className="px-4 pt-6 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 rounded-lg border border-line bg-panel p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_32rem] lg:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase text-accent">
              Local Weather
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-balance">
              {today ? getWeatherLabel(today.code) : "Forecast is loading"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              {weatherSummary}
            </p>

            {weather.status === "loading" && (
              <p className="mt-5 text-sm text-muted" aria-live="polite">
                Loading forecast...
              </p>
            )}

            {weather.status === "error" && (
              <p
                className="mt-5 text-sm font-medium text-accent-alt"
                aria-live="polite"
              >
                {weather.message}
              </p>
            )}

            {weather.status === "success" && weather.note && (
              <p className="mt-5 text-sm text-muted">{weather.note}</p>
            )}
          </div>

          {today ? (
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="border-t border-line pt-4">
                  <dt className="text-muted">{metric.label}</dt>
                  <dd className="mt-2 font-mono text-2xl font-semibold">
                    {metric.value}
                  </dd>
                </div>
              ))}
              <div className="col-span-2 border-t border-line pt-4 sm:col-span-4">
                <dt className="text-muted">Date</dt>
                <dd className="mt-2 font-medium">{today.date}</dd>
              </div>
            </dl>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {loadingMetricLabels.map((label) => (
                <div key={label} className="border-t border-line pt-4">
                  <p className="text-muted">{label}</p>
                  <div className="mt-3 h-8 rounded-md bg-panel-muted" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
