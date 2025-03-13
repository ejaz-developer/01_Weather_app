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
    Thunderstorm:
      "https://images.unsplash.com/photo-1530533718754-001d3088360a",
    default: "https://images.unsplash.com/photo-1504608524841-42fe6f032b5b",
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const options = {
      method: "GET",
      url: `https://open-weather13.p.rapidapi.com/city/${city}/EN`,
      headers: {
        "x-rapidapi-key": import.meta.env.VITE_RAPID_API_KEY,
        "x-rapidapi-host": import.meta.env.VITE_RAPID_HOST_URL,
      },
    };

    try {
      const response = await axios.request(options);
      setData(response.data);
      updateBackground(response.data.weather[0]?.main);
    } catch (error) {
      setError("City not found. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const updateBackground = (weather: string) => {
    const imageUrl =
      backgroundImages[weather as keyof typeof backgroundImages] ||
      backgroundImages.default;
    setBgImage(imageUrl);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-500"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-md w-full space-y-6 backdrop-blur-sm rounded-2xl p-4 md:p-8 bg-white/10">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-white drop-shadow-lg">
          Weather Dashboard
        </h1>

        {/* Added Search Bar */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchData()}
            className="flex-1 p-2 md:p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Search city..."
          />
          <button
            onClick={fetchData}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all duration-300"
          >
            Search
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 md:h-8 bg-white/20 rounded"></div>
              <div className="h-6 md:h-8 bg-white/20 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        )}

        {/* Weather Data Display */}
        {data && (
          <div className="space-y-4 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-xl md:text-3xl font-bold">{data.name}</h2>
                <p className="text-lg md:text-xl capitalize">
                  {data.weather[0]?.description}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src={`https://openweathermap.org/img/wn/${data.weather[0]?.icon}@4x.png`}
                  className="w-20 h-20 md:w-24 md:h-24 animate-fade-in"
                  alt="Weather icon"
                />
                <p className="text-4xl md:text-5xl font-bold">
                  {Math.round(data.main.temp)}°C
                </p>
              </div>
            </div>

            {/* Weather Stats Grid */}
            <div className="grid grid-cols-2 gap-y-4 md:grid-cols-3 gap-x-4 text-center">
              <div className="bg-white/20 p-2 md:p-4 rounded-xl backdrop-blur-sm">
                <p className="text-sm">Feels like</p>
                <p className="text-xl font-bold">
                  {Math.round(data.main.feels_like)}°C
                </p>
              </div>
              <div className="bg-white/20 p-2 md:p-4 rounded-xl backdrop-blur-sm">
                <p className="text-sm">Humidity</p>
                <p className="text-xl font-bold">{data.main.humidity}%</p>
              </div>
              <div className="bg-white/20 p-2 md:p-4 rounded-xl backdrop-blur-sm">
                <p className="text-sm">Pressure</p>
                <p className="text-xl font-bold">{data.main.pressure}hPa</p>
              </div>
            </div>

            {/* Temperature Range */}
            <div className="flex flex-col md:flex-row justify-between text-center backdrop-blur-sm bg-white/20 p-2 rounded-xl">
              <div>
                <p className="text-sm">Min Temp</p>
                <p className="text-xl">{Math.round(data.main.temp_min)}°C</p>
              </div>
              <div>
                <p className="text-sm">Max Temp</p>
                <p className="text-xl">{Math.round(data.main.temp_max)}°C</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Handling */}
        {error && (
          <div className="bg-red-100/20 p-4 rounded-xl text-red-100 text-center backdrop-blur-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
