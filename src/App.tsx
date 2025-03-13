import { useState, useEffect } from "react";
import axios from "axios";

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

interface WeatherData {
  name: string;
  weather: Weather[];
  main: Main;
}

function App() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("skardu");
  const [bgImage, setBgImage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const backgroundImages = {
    Clear: "https://images.unsplash.com/photo-1601134467661-3a775e007848",
    Clouds: "https://images.unsplash.com/photo-1483977399921-6cf94f6fdc3a",
    Rain: "https://images.unsplash.com/photo-1438449805895-5918d2267f19",
    Snow: "https://images.unsplash.com/photo-1491002052546-bf38f186af56",
    "Moderate snow showers": "https://example.com/moderate-snow-image.jpg",
    "Heavy snow showers": "https://example.com/heavy-snow-image.jpg",
    Thunderstorm:
      "https://images.unsplash.com/photo-1530533718754-001d3088360a",
    default: "https://images.unsplash.com/photo-1504608524841-42fe6f032b5b",
  };
  const updateBackground = (weatherArr: Weather[]) => {
    const weatherDescriptions = weatherArr.map(
      (weather) => weather.description
    );

    // Try to find a matching weather condition
    for (const [condition, url] of Object.entries(backgroundImages)) {
      if (weatherDescriptions.some((desc) => desc.includes(condition))) {
        setBgImage(url);
        return;
      }
    }

    // Fallback to default image if no match found
    setBgImage(backgroundImages.default);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const API_URL = `https://api.weatherapi.com/v1/current.json?key=${
      import.meta.env.VITE_WEATHER_API_KEY
    }&q=${city}&aqi=yes`;

    try {
      const response = await axios.get(API_URL);
      const weatherData = response.data;

      // Transform the data to match the existing structure
      const formattedData: WeatherData = {
        name: weatherData.location.name,
        weather: [
          {
            id: weatherData.current.condition.code, // Not used but kept for consistency
            main: weatherData.current.condition.text,
            description: weatherData.current.condition.text,
            icon: `https:${weatherData.current.condition.icon}`,
          },
        ],
        main: {
          temp: weatherData.current.temp_c,
          feels_like: weatherData.current.feelslike_c,
          temp_min: weatherData.current.temp_c, // No min/max temp in API, using current temp
          temp_max: weatherData.current.temp_c,
          pressure: weatherData.current.pressure_mb,
          humidity: weatherData.current.humidity,
        },
      };

      setData(formattedData);
      updateBackground(formattedData.weather);
    } catch (error) {
      setError("City not found. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-500"
      style={{
        backgroundImage: `
          linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.1),
            rgba(0, 0, 0, 0.3)
          ),
          linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 50%),
          url(${bgImage})
        `,
        backgroundSize: "cover, 200%, 200%, cover",
        backgroundPosition: "center",
        backgroundBlendMode: "multiply, overlay",
        borderRadius: "32px",
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
        boxShadow: `
          0 8px 32px 0 rgb(31 38 135 / 30%),
          0 6px 8px -4px rgb(31 38 135 / 20%)
        `,
      }}
    >
      <div className="max-w-md w-full space-y-8 backdrop-blur-sm rounded-2xl p-6 md:p-8 bg-orange-300/10 shadow-2xl shadow-black/20">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-white drop-shadow-lg">
          Weather Dashboard
        </h1>

        {/* Search Bar with Gradient */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
          <div className="flex-1 flex items-center">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchData()}
              className="w-full p-2 md:p-3 rounded-2xl pl-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Search city..."
            />
          </div>
          <button
            onClick={fetchData}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl transition-all duration-300 font-semibold shadow-lg shadow-gray-800/20 hover:shadow-xl"
          >
            Search
          </button>
        </div>

        {/* Loading State with Colored Spinner */}
        {loading && (
          <div className="text-center p-8 space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2  border-t-2 border-transparent"></div>
            <p className="text-white opacity-70">Loading weather data...</p>
          </div>
        )}

        {/* Weather Data Display */}
        {data && (
          <div className="space-y-6 text-white">
            {/* Weather Header */}
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white backdrop-blur-sm bg-black/10 p-2 rounded">
                  {data.name}
                </h2>
                <p className="text-lg md:text-xl text-white/80 font-semibold backdrop-blur-sm bg-black/10 p-2 rounded">
                  {data.weather[0]?.description}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={`https://images.unsplash.com/photo-1705077689363-76d4424a13c7?q=80&w=1409&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                  className="w-10 h-10 md:w-15 md:h-15 animate-fade-in transform hover:scale-105 transition-transform duration-300 backdrop-blur-sm bg-black/10 rounded-full"
                  alt="Weather icon"
                />
                <p className="text-4xl m-2 md:text-5xl font-bold text-white backdrop-blur-sm bg-black/10 p-2 rounded">
                  {Math.round(data.main.temp)}°C
                </p>
              </div>
            </div>

            {/* Weather Stats Grid with Gradient */}
            <div className="grid grid-cols-2 gap-y-4 md:grid-cols-3 gap-x-4">
              {[
                {
                  title: "Feels like",
                  value: `${Math.round(data.main.feels_like)}°C`,
                  color: "bg-red-500/20",
                },
                {
                  title: "Humidity",
                  value: `${data.main.humidity}%`,
                  color: "bg-green-500/20",
                },
                {
                  title: "Pressure",
                  value: `${data.main.pressure}hPa`,
                  color: "bg-blue-500/20",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`${stat.color} p-3 rounded-xl backdrop-blur-sm shadow-lg shadow-gray-800/20 transition-all hover:scale-95`}
                >
                  <p className="text-sm text-white/80 font-semibold">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Temperature Range with Custom Design */}
            <div className="flex flex-col md:flex-row justify-between text-center bg-gradient-to-r from-cyan-500/20 to-amber-500/20 p-4 rounded-xl backdrop-blur-sm">
              <div className="space-y-2">
                <p className="text-sm text-white/80 font-semibold backdrop-blur-sm bg-black/10 p-2 rounded">
                  Min Temp
                </p>
                <p className="text-lg font-bold backdrop-blur-sm bg-black/10 p-2 rounded">
                  {Math.round(data.main.temp_min)}°C
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-white/80 font-semibold backdrop-blur-sm bg-black/10 p-2 rounded">
                  Max Temp
                </p>
                <p className="text-lg font-bold backdrop-blur-sm bg-black/10 p-2 rounded">
                  {Math.round(data.main.temp_max)}°C
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Handling with Better Styling */}
        {error && (
          <div className="bg-red-500/20 p-4 rounded-xl text-red-100 text-center backdrop-blur-sm shadow-lg shadow-red-800/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="font-semibold">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
