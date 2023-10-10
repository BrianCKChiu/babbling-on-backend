const express = require('express');
const axios = require('axios'); 
const aiRouter = express.Router();

aiRouter.post('/analyze-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const aiResponse = await axios.post('http://localhost:8082/predict', { imageUrl });
    
    // todo: prcoess the returned data if  needed

    return res.status(200).json(aiResponse.data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default aiRouter;
