const express = require('express');
const axios = require('axios'); 
const aiRouter = express.Router();

aiRouter.post('/analyze-image', async (req, res) => {
  try {
    const { image_url } = req.body;

    // image_url is required
    if (!image_url) {
      return res.status(400).json({ error: 'image_url is required' });
    }

    //sending post request
    const aiResponse = await axios.post('http://127.0.0.1:8082/predict', { image_url });

    //Response recieved
    return res.status(200).json(aiResponse.data);
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

export default aiRouter;
