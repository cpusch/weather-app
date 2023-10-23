new Vue({
  el: "#app",
  data: {
    loading: false,
    weatherData: [],
    city: "", // Store the city entered by the user
  },
  methods: {
    searchWeather() {
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
        });
    },
    getMap() {
      const map = L.map("map").setView([53.349805, -6.26031], 10); // Default view coordinates (Dublin)

      // Add a tile layer (you can choose a different map provider)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Configure the Weather Plugin (replace with your API key)
      const weatherLayer = L.OWM.current({
        appId: apiKey,
        lang: "en",
        interval: 30 * 60 * 1000, // Update every 30 minutes
      }).addTo(map);

      // Search for weather data based on the user's entered city
      this.searchWeather = () => {
        this.loading = true;
        const apiUrl = `http://127.0.0.1:3000/weather/${this.city}`;

        axios
          .get(apiUrl)
          .then((response) => {
            this.weatherData = response.data;

            // Update the weather layer with new coordinates (replace with coordinates from the API response)
            const coordinates = [response.data[0].lat, response.data[0].lon];
            map.setView(coordinates, 10); // Set the map view based on the city's coordinates

            // Update weather markers on the map
            weatherLayer.setLatLng(coordinates);
          })
          .catch((error) => {
            console.error("Error fetching weather data:", error);
          })
          .finally(() => {
            this.loading = false;
          });
      };
    },
  },
});
