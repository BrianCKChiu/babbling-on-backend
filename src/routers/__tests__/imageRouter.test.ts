import request from 'supertest';
import { server } from '../..';
import mockAxios from 'jest-mock-axios';
import { wait } from 'lib0/promise';

describe('Image Router Tests', () => {
  
  afterAll(done => {
    server.close(() => {
      done();
    });
    console.log("Closed");
  });

  afterEach(() => {
    mockAxios.reset();
  });


it('should detect image and return response', async () => {
  const mockResponse = {
    status: 200,
    data: {
      "predictions": [
        {
          "x": 1310,
          "y": 748.5,
          "width": 778,
          "height": 969,
          "confidence": 0.694,
          "class": "K",
          "class_id": 10
        }
      ]
    },
  };

  mockAxios.post.mockResolvedValueOnce(mockResponse);

  const testImageUrl = "https://img.freepik.com/free-photo/sign-language-hand-showing-letter_23-2148590392.jpg?w=2000";

  const response = await request(server)
    .post('/image/detect')
    .send({ image_url: testImageUrl });

  expect(response.statusCode).toEqual(200);
  const hasClassK = response.body.predictions.some((prediction) => prediction.class === "K");
  expect(hasClassK).toBeTruthy();
});


  it('should return 400 for missing image_url', async () => {
    const response = await request(server)
      .post('/image/detect')
      .send({});

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('error', 'image_url is required');
  });

});
