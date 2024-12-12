import dotenv from 'dotenv';

dotenv.config();

interface Coordinates {
  latitude: number;
  longitude: number;
}

class Weather {
  city: string;
  date: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  icon: string;
  forecast?: { date: string; temperature: number; description: string }[];

  constructor(
    city: string,
    date: string,
    temperature: number,
    humidity: number,
    windSpeed: number,
    uvIndex: number,
    icon: string
  ) {
    this.city = city;
    this.date = date;
    this.temperature = temperature;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.uvIndex = uvIndex;
    this.icon = icon;
  }
}

class WeatherService {
  private baseURL: string = 'https://api.openweathermap.org/data/2.5/';
  private readonly apiKey: string = process.env.WEATHER_API_KEY ?? '';
  private cityName: string = '';

  private async fetchLocationData(query: string) {
    const response = await fetch(`${this.baseURL}geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`);
    return response.json();
  }

  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData || locationData.length === 0) {
      throw new Error('Invalid location data');
    }
    return {
      latitude: locationData[0].lat,
      longitude: locationData[0].lon,
    };
  }

  private buildGeocodeQuery(): string {
    if (!this.cityName) {
      throw new Error('City name cannot be empty');
    }
    return `${this.cityName}`;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    if (!coordinates.latitude || !coordinates.longitude) {
      throw new Error('Invalid coordinates');
    }
    return `${this.baseURL}onecall?lat=${coordinates.latitude}&lon=${coordinates.longitude}&exclude=minutely,hourly,alerts&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData() : Promise<Coordinates> {
    const query : string = this.buildGeocodeQuery();
    const locationData : any = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
  }

private async fetchWeatherData(coordinates: Coordinates) : Promise<any> {
    const query : string = this.buildWeatherQuery(coordinates);
  const response : Response = await fetch(query);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  return response.json();
}

  private parseCurrentWeather(response: any) : Weather {
    if (!response || !response.main || !response.weather) {
      throw new Error('Invalid weather response');
    }
    return new Weather(
      this.cityName,
      new Date().toISOString(),
      response.main.temp,
      response.main.humidity,
      response.wind.speed,
      response.current?.uvi || 0,
      response.weather[0]?.icon || ''
    );
  }

 private buildForecastArray(weatherData: any[]) : any[] {
    if (!Array.isArray(weatherData)) {
      throw new Error('Invalid forecast data');
    }
    return weatherData.map((day: any) => ({
      date: new Date(day.dt * 1000).toLocaleDateString(),
      temperature: day.temp.day,
      description: day.weather[0]?.description,
    }));
 }

public async getWeatherForCity(city: string) : Promise<Weather> {
    if (!city) {
      throw new Error('City name cannot be empty');
    }
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    currentWeather.forecast = this.buildForecastArray(weatherData.daily);
    return currentWeather;
  }
}

export default new WeatherService();
