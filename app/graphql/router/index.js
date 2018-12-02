import express from 'express';
import Captcha from './captcha';

module.exports = () => {
  const router = express.Router();
  router.get('/captcha/:id', Captcha.showImage);
  return router;
}
