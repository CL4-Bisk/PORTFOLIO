"use client";

import { useEffect, useState } from "react";

type ForecastResponse = {
  timezone: string;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
    precipitation_probability_max: number[];
    windspeed_10m_max: number[];
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
      "temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max,windspeed_10m_max",
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
          code: weather.forecast.daily.weathercode[0],
          rain: weather.forecast.daily.precipitation_probability_max[0],
          wind: weather.forecast.daily.windspeed_10m_max[0],
        }
      : null;

  return (
    <section className="px-8 pb-16">
      <div className="max-w-3xl rounded-md border border-foreground/15 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-neutral-500">
              Weather
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              {today ? getWeatherLabel(today.code) : "Local forecast"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {weather.status === "success"
                ? `${weather.locationName} - ${weather.forecast.timezone}`
                : "Loading weather from your browser location."}
            </p>
          </div>
        </div>

        {weather.status === "loading" && (
          <p className="mt-5 text-sm text-neutral-500">Loading forecast...</p>
        )}

        {weather.status === "error" && (
          <p className="mt-5 text-sm text-red-500">{weather.message}</p>
        )}

        {weather.status === "success" && weather.note && (
          <p className="mt-5 text-sm text-neutral-500">{weather.note}</p>
        )}

        {today && (
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-neutral-500">High</dt>
              <dd className="mt-1 text-xl font-semibold">{today.high} deg C</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Low</dt>
              <dd className="mt-1 text-xl font-semibold">{today.low} deg C</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Rain</dt>
              <dd className="mt-1 text-xl font-semibold">{today.rain}%</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Wind</dt>
              <dd className="mt-1 text-xl font-semibold">{today.wind} km/h</dd>
            </div>
            <div className="col-span-2 sm:col-span-4">
              <dt className="text-neutral-500">Date</dt>
              <dd className="mt-1">{today.date}</dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  );
}
