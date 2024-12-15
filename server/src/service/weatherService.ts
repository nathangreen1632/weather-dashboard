import dotenv from 'dotenv';

dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

class Weather {
  city: string;
  country: string;
  date: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  description: string;

  constructor(city: string, country: string, date : string, temperature: number, windSpeed: number, humidity: number, description: string,) {
    this.city = city;
    this.country = country;
    this.date = date;
    this.temperature = temperature;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.description = description;
  }
}

class WeatherService {
  private readonly baseURL: string = 'https://api.openweathermap.org/data/2.5/';
  private readonly apiKey: string = process.env.WEATHER_API_KEY ?? '';
  private cityName: string = '';

  private async fetchLocationData(query: string) {
    const response = await fetch(query);
    return await response.json();
  }

  private destructureLocationData(locationData: Coordinates) {
    const { lat, lon } = locationData;
    return { lat, lon };
  }

  private buildGeocodeQuery() {
    return `${this.baseURL}weather?q=${this.cityName}&appid=${this.apiKey}`;
  }

  private buildWeatherQuery(coordinates: Coordinates) {
    const { lat, lon } = coordinates;
    return `${this.baseURL}onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    return this.destructureLocationData(locationData.coord);
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<{ daily: any[] }> {
    return await this.fetchLocationData(this.buildWeatherQuery(coordinates));
  }

  private parseCurrentWeather(response: any) {
    const { name, sys, dt, main, wind, weather } = response;
    return new Weather(name, sys.country, new Date(dt * 1000).toLocaleDateString(), main.temp, wind.speed, main.humidity, weather[0].description);
  }

  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    return weatherData.map((data: any) => {
      const { dt, temp, wind_speed, humidity, weather } = data;
      return new Weather(currentWeather.city, currentWeather.country, new Date(dt * 1000).toLocaleDateString(), temp.day, wind_speed, humidity, weather[0].description);
    });
  }

  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const currentWeather = this.parseCurrentWeather(await this.fetchWeatherData(coordinates));
    const weatherData = await this.fetchWeatherData(coordinates);
    const forecast = this.buildForecastArray(currentWeather, weatherData.daily);
    return { currentWeather, forecast };
  }
}

export default new WeatherService();