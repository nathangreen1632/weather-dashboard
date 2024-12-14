import dotenv from 'dotenv';

dotenv.config();

interface Coordinates {
  latitude: number;
  longitude: number;
}

class Weather {
  city: string;
  date: string;
  temperature: string;
  humidity: number;
  windSpeed: number;
  forecast?: { date: string; temperature: string; description: string }[];

  constructor(
    city: string,
    date: string,
    temperature: string,
    humidity: number,
    windSpeed: number,
  ) {
    this.city = city;
    this.date = date;
    this.temperature = temperature;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
  }
}

class WeatherService {
  private readonly baseURL: string = 'https://api.openweathermap.org/';
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
    this.cityName = locationData[0].name;
    return {
      latitude: locationData[0].lat,
      longitude: locationData[0].lon,
    };
  }

  private buildGeocodeQuery(): string {
    if (!this.cityName) {
      throw new Error('City name cannot be empty');
    }
    return encodeURIComponent(this.cityName); // Encode city name for URL
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    if (!coordinates.latitude || !coordinates.longitude) {
      throw new Error('Invalid coordinates');
    }
    return `${this.baseURL}data/2.5/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const query: string = this.buildGeocodeQuery();
    const locationData: any = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const query: string = this.buildWeatherQuery(coordinates);
    const response: Response = await fetch(query);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    return response.json();
  }

  private parseCurrentWeather(response: any): Weather {
    if (!response) {
      throw new Error('Invalid weather response');
    }

    const nowWeather = response.list[0];
    return new Weather(
      this.cityName,
      new Date(nowWeather.dt * 1000).toLocaleDateString(),
      nowWeather.main.temp.toString(),
      nowWeather.main.humidity,
      nowWeather.wind.speed,
    );
  }

  private buildForecastArray(weatherData: any[]): any[] {
    if (!Array.isArray(weatherData)) {
      throw new Error('Invalid forecast data');
    }

    const forecastByDate: { [key: string]: { temps: number[]; descriptions: string[] } } = {};

    weatherData.forEach((interval: any) => {
      const date = new Date(interval.dt * 1000).toLocaleDateString();
      if (!forecastByDate[date]) {
        forecastByDate[date] = { temps: [], descriptions: [] };
      }
      forecastByDate[date].temps.push(interval.main.temp);
      forecastByDate[date].descriptions.push(interval.weather[0]?.description);
    });

    return Object.keys(forecastByDate).map((date) => ({
      date,
      temperature: (
        forecastByDate[date].temps.reduce((sum, temp) => sum + temp, 0) /
        forecastByDate[date].temps.length
      ).toFixed(1),
      description: forecastByDate[date].descriptions[0],
    }));
  }

  public async getWeatherForCity(city: string): Promise<Weather> {
    if (!city) {
      throw new Error('City name cannot be empty');
    }
    this.cityName = city;

    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);

    console.log('Fetched weather data', weatherData);

    const currentWeather = this.parseCurrentWeather(weatherData);
    currentWeather.forecast = this.buildForecastArray(weatherData.list);
    return currentWeather;
  }
}

export default new WeatherService();
