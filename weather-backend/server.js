const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;

app.use(express.json());

const cors = require("cors");
app.use(cors());

app.get("/weather/:cityName", async (req, res) => {
  try {
    const cityName = req.params.cityName;

    const cityCords = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=205ab8c5605847d0ff1d8cf324e1b9ad`,
    );
    lat = cityCords.data[0].lat;
    lon = cityCords.data[0].lon;

    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=205ab8c5605847d0ff1d8cf324e1b9ad&exclude=current,minutely,hourly,alerts&units=metric`,
    );

    const pollutionResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=205ab8c5605847d0ff1d8cf324e1b9ad&exclude`,
    );

    const weatherData = weatherResponse.data.daily.slice(1, 6);

    //if there is pm_2.5 > 10 wearMask is true
    const wearMask = await pollutionResponse.data.list.some(
      (dict) => dict.main.aqi > 2,
    );
    const weatherDataReturn = [];

    weatherData.forEach((dict) => {
      weatherDataReturn.push({
        date: formatTimestamp(dict.dt),
        temp: dict.temp,
        summary: dict.summary,
        weather: dict.weather,
        rain: dict.rain === undefined ? 0 : dict.rain,
        wind: dict.wind_speed === undefined ? 0 : dict.wind_speed,
        pollution: wearMask,
      });
    });

    res.json(weatherDataReturn);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


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
