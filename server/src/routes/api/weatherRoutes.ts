import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

router.post('/weather', async (req, res) => {
    try {
      const weatherData = await WeatherService.getWeatherForCity(req.body.city);
      res.json(weatherData);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  },
);

  router.get('/weather/:city', async (req, res) => {
    try {
      const weatherData = await WeatherService.getWeatherForCity(req.params.city);
      res.json(weatherData);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  router.post('/history', async (req, res) => {
    try {
      const city = await HistoryService.addCity(req.body.city);
      res.json(city);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

router.get('/history', async (_req, res) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});


router.delete('/history/:id', async (req, res) => {
  try {
    const cities = await HistoryService.getCities();
    const city = cities.find(city => city.id === parseInt(req.params.id));
    if (!city) {
      throw new Error('City not found');
    }
    const newCities = cities.filter(city => city.id !== parseInt(req.params.id));
    await HistoryService.write(newCities);
    res.json(city);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});


export default router;
