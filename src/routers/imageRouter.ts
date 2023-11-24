const express = require('express');
const axios = require('axios');
const imageRouter = express.Router();

imageRouter.post('/detect', async (req, res) => {
  try {
    const { image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: 'image_url is required' });
    }

    const response = await axios({
      method: "POST",
      url: "https://detect.roboflow.com/american-sign-language-v36cz/1",
      params: {
        api_key: "AL6rQcQcn1KDLjS8iyVu",
        image: image_url
      }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error', error.message);
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default imageRouter;
