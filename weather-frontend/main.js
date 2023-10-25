new Vue({
  el: "#app",
  data: {
    loading: false,
    loaded: false,
    weatherData: [],
    city: "", // Store the city entered by the user
    temperatureData: [{ timestamp: 1635613200, value: 22 }],
    chartDataLoaded: false,
    tempChart: null,
    windChart: null,
    rainChart: null,
    pollutionChart: null,
  },
  methods: {
    searchWeather() {
      this.loaded = false;
      this.chartDataLoaded = false;
      this.loading = true;
      // Construct the API URL with the user's entered city
      const apiUrl = `http://127.0.0.1:3000/weather/${this.city}`;

      axios
        .get(apiUrl)
        .then((response) => {
          this.weatherData = response.data;
          this.chartDataLoaded = true;
          this.createChart("tempChart", this.temperatureData);
          this.createChart("windChart", this.temperatureData);
          this.createChart("rainChart", this.temperatureData);
          this.createChart("pollutionChart", this.temperatureData);
        })
        .catch((error) => {
          console.error("Error fetching weather data:", error);
        })
        .finally(() => {
          this.loading = false;
          this.loaded = true;
        });
    },
    createChart(containerId, data) {
      const canvas = document.querySelector(`.${containerId}`);

      if (this[containerId]) {
        // Destroy the existing chart if it exists
        this[containerId].destroy();
      }

      if (canvas) {
        const ctx = canvas.getContext("2d");

        this[containerId] = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.map((point) => point.timestamp),
            datasets: [
              {
                label: "Data",
                data: data.map((point) => point.value),
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: "time",
                time: {
                  unit: "hour",
                },
              },
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    },
  },
});
