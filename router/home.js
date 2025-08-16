import express from 'express';
import {PopularityRank, NewBookPublish} from '../data/HomePageSort.js';
const homeRoutes = express.Router();

homeRoutes.get('/', async (req,res) => {
  const popular = await PopularityRank();
  const newest  = await NewBookPublish();
  res.render('homepage', {
    popular,
    newest,
    pageCSS: ['/css/home.css'] 
  });
});
export default homeRoutes;