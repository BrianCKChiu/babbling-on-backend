import request from 'supertest';
import { server } from '../..'; 

const someUserId = 'someUserId';
const someAssessmentId = 'someAssessmentId';
// TODO: fix the hardcoding temporary fix

jest.mock('@prisma/client', () => {
    return {
      PrismaClient: jest.fn().mockImplementation(() => ({
        selfAssessment: {
          create: jest.fn().mockResolvedValue({ id: someAssessmentId, userId: "someUserId", score: 0, isPractice: true }),
          update: jest.fn().mockResolvedValue({ id: someAssessmentId, score: 85 }),
          findMany: jest.fn().mockResolvedValue([
            {
              id: 'assessment1',
              userId: 'someUserId',
              score: 75,
              isPractice: false,
              dateTaken: new Date('2023-01-01'),
            },
            {
              id: 'assessment2',
              userId: 'someUserId',
              score: 85,
              isPractice: true,
              dateTaken: new Date('2023-01-02'),
            },
          ]),
          findUnique: jest.fn().mockResolvedValue({ id: "someAssessmentId" }),
          delete: jest.fn().mockResolvedValue({ id: "someAssessmentId" }),
        },
      })),
    };
  });

describe('SelfAssessment Router Tests', () => {

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(done => {
    server.close(() => {
      done();
    });
    console.log("Closed");
  });

  it('should start an assessment', async () => {
    const response = await request(server)
      .post('/selfAssessment/start-assessment')
      .send({ userId: 'someUserId', isPractice: true });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('id', 'someAssessmentId');
  });

  it('should end an assessment', async () => {
    const response = await request(server)
      .put('/selfAssessment/end-assessment/someAssessmentId')
      .send({ score: 85 });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('score', 85);
  });

  it('should retrieve all assessments for a user', async () => {
    const response = await request(server)
      .get('/selfAssessment/assessments/all/someUserId');

    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  it('should retrieve all self-assessments for a user', async () => {
    const response = await request(server)
      .get('/selfAssessment/assessments/someUserId');

    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  it('should retrieve average score for a user', async () => {
    const response = await request(server)
      .get('/selfAssessment/average-score/someUserId');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('averageScore');
  });

  it('should retrieve highest score for a user', async () => {
    const response = await request(server)
      .get('/selfAssessment/highest-score/someUserId');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('highestScore');
  });


  it('should retrieve a specific assessment', async () => {
    const response = await request(server)
      .get('/selfAssessment/assessment/someAssessmentId');

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('id', 'someAssessmentId');
  });

  it('should delete a specific assessment', async () => {
    const response = await request(server)
      .delete('/selfAssessment/assessment/someAssessmentId');

    expect(response.statusCode).toEqual(200);
  });
});
  
