new Vue({
  el: "#app",
  data: {
    loading: false,
    loaded: false,
    weatherData: [],
    city: "", // Store the city entered by the user
  },
  methods: {
    searchWeather() {
      this.loaded = false;
      this.loading = true;
      // Construct the API URL with the user's entered city
      const apiUrl = `http://127.0.0.1:3000/weather/${this.city}`;

      axios
        .get(apiUrl)
        .then((response) => {
          this.weatherData = response.data;
        })
        .catch((error) => {
          console.error("Error fetching weather data:", error);
        })
        .finally(() => {
          this.loading = false;
          this.loaded = true;
        });
    },
  },
});
