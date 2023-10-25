const express = require("express");
const axios = require("axios");
require("dotenv").config();
const app = express();
const port = 3000;

app.use(express.json());

const cors = require("cors");
app.use(cors());

app.get("/weather/:cityName", async (req, res) => {
  try {
    const cityName = req.params.cityName;

    const cityCords = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${process.env.WEATHER_API}`,
    );
    lat = cityCords.data[0].lat;
    lon = cityCords.data[0].lon;

    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API}&exclude=current,minutely,hourly,alerts&units=metric`,
    );

    const pollutionResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API}`,
    );

    const weatherData = weatherResponse.data.daily.slice(1, 6);
    const weatherDataReturn = [];
    const tempArr = [];
    const rainArr = [];
    const windArr = [];

    weatherData.forEach((dict) => {
      tempArr.push(dict.temp.day);
      rainArr.push(dict.rain === undefined ? 0 : dict.rain);
      windArr.push(dict.wind_speed === undefined ? 0 : dict.wind_speed);
      weatherDataReturn.push({
        date: formatTimestamp(dict.dt),
        temp: dict.temp,
        summary: dict.summary,
        weather: dict.weather[0],
        rain: dict.rain === undefined ? 0 : dict.rain,
        wind: dict.wind_speed === undefined ? 0 : dict.wind_speed,
        icon: `https://openweathermap.org/img/wn/${dict.weather[0].icon}@2x.png`,
      });
    });
    const avgTemp = tempArr.reduce((a, b) => a + b) / tempArr.length;
    const avgRain = rainArr.reduce((a, b) => a + b) / rainArr.length;
    const avgWind = windArr.reduce((a, b) => a + b) / windArr.length;

    //if there is pm_2.5 > 10 wearMask is true
    const wearMask = pollutionResponse.data.list.some(
      (dict) => dict.main.aqi > 2,
    );
    //if there is any rain predicted rainjacket will be true
    const willRain = weatherDataReturn.some((dict) => dict.rain > 0);

    res.json({
      forecast: weatherDataReturn,
      wearMask: wearMask
        ? "pm_2.5 > 10 is predicted, make sure to pack a mask!"
        : "No need to pack a mask",
      willRain: willRain
        ? "Rain in the forecast. Make sure to bring an umbrella!"
        : "No rain, leave the umbrella at home!",
      packTip: packRecommendation(avgTemp),
      avgTemp: avgTemp.toFixed(1),
      avgRain: avgRain.toFixed(1),
      avgWind: avgWind.toFixed(1),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function packRecommendation(average) {
  if (average > 23) return "Make sure to pack for Hot Weather!";
  else if (average < 13) return "Make sure to pack for Cold Weather!";
  else return "Make sure to pack for Mild Weather!";
}

function formatTimestamp(unixTimestamp) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date(unixTimestamp * 1000);
  const dayOfWeek = daysOfWeek[date.getDay()];
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  const formattedDayOfMonth = dayOfMonth < 10 ? `0${dayOfMonth}` : dayOfMonth;
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDate = `${dayOfWeek} ${formattedDayOfMonth}/${formattedMonth}`;
  return formattedDate;
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
