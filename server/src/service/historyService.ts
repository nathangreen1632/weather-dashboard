class City {
  name: string;
  id: number;

  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

   private async read() : Promise<City[]> {
    try {
      const data = await import('fs').then(fs => fs.promises.readFile(this.filePath, 'utf8'));
      return JSON.parse(data) as City[];
    } catch (error) {
      if (error instanceof Error && (error as any).code === 'ENOENT') {
        return [];
      }
      if (error instanceof Error) {
        throw new Error(`Failed to read file: ${error.message}`);
      }
      throw new Error('Failed to read file: Unknown error');
    }
   }

   async write(cities: City[]) :Promise<void> {
    try {
      await import('fs').then(fs => fs.promises.writeFile(this.filePath, JSON.stringify(cities, null, 2), 'utf8'));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to write file: ${error.message}`);
      }
      throw new Error('Failed to write file: Unknown error');
      }
    }

  async getCities() : Promise<City[]> {
     return await this.read();
   }

  async addCity(cityName: string) : Promise<City> {
    if (cityName !== 'string' || !cityName) {
      throw new Error('Invalid city name');
    }

    const cities :City[] = await this.read();
    if (cities.some(city => city.name.toLowerCase() === cityName.toLowerCase())) {
      throw new Error('City already exists');
    }

    const newCity = new City(cityName, cities.length > 0 ? cities[cities.length - 1].id + 1 : 1);
    cities.push(newCity);
    await this.write(cities);
    return newCity;
  }

  async removeCity(id: number) :Promise<City[]> {
    if (id <= 0) {
      throw new Error('Invalid city id');
    }
    const cities : City[] = await this.read();
    const filteredCities : City[] = cities.filter(city => city.id !== id);

    if (filteredCities.length === cities.length) {
      throw new Error('City not found');
    }
    await this.write(filteredCities);
    return filteredCities;
  }
}

export default new HistoryService('defaultName');
