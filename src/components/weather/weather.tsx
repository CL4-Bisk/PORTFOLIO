"use client";

function getWeatherForUser() {
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    const params = new URLSearchParams({
        latitude: String(coords.latitude),
        longitude: String(coords.longitude),
        daily:
        "temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max,windspeed_10m_max",
        timezone: "auto",
        forecast_days: "7",
    });

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_OPENMETEO_API_BASE}?${params}`
    );

    const data = await res.json();
    console.log(data);
    });
}