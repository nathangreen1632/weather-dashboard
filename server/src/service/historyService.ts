import fs from 'node:fs/promises';
import {v4 as uuidv4} from 'uuid';

class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  private async read() {
    const filePath = './db/searchHistory.json';
    try{
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    }
    catch (error) {
      console.error('Failed to read file:', error);
      return [];
    }
  }

  private async write(cities: City[]) {
    const filePath = './db/searchHistory.json';
    try {
      await fs.writeFile(filePath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing file', error);
    }
  }

  async getCities() {
    try {
      return await this.read();
    }
    catch (error) {
      console.error('Error populating cities:', error);
      return [];
    }
  }

  async addCity(city: string) {
    try {
      const cities = await this.read();
      const newCity = new City(city, uuidv4());
      cities.push(newCity);
      await this.write(cities);
      return newCity;
    } catch (error) {
      console.error('Error adding city:', error);
      return null;
    }
  }

  async removeCity(id: string) {
    try {
      const cities = await this.read();
      const filteredCities = cities.filter((city: City) => city.id !== id);
      await this.write(filteredCities);
    } catch (error) {
      console.error('Error removing city:', error);
    }
  }
}

export default new HistoryService();
