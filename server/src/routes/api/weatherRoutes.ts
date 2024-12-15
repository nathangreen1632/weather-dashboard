import { Router, Request, Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

router.post('/', async (req: Request, res: Response) => {
  try {
    const city = req.body.cityName;
    if (!city) {
      return res.status(400).json({ error: `City name is required: ${city}` });
    }

    const weatherData = await WeatherService.getWeatherForCity(city);
    if (!weatherData) {
      return res.status(404).json({ message: `City "${city}" not found` });
    }
    const existingCity = await HistoryService.getCities().then((cities) =>
      cities.find((existingCity: { name: string }) => existingCity.name === city)
    );

    if (!existingCity) {
      await HistoryService.addCity(city);
      console.log(`City "${city}" added to search history.`);
    } else {
      console.log(`City "${city}" already exists in search history.`);
    }

    return res.status(200).json(weatherData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

router.get('/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch search history' });
  }
});

router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.id, 10);
    await HistoryService.removeCity(cityId);
    res.json({ message: 'City removed from search history' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete city from search history' });
  }
});

export default router;