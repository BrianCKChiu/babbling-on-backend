import request from 'supertest';
import { server } from '../..'; 
import { validate as uuidValidate } from 'uuid';

interface MockDataItem {
  assessmentId: string;
  userId: string;
  score: number;
  isPractice: boolean;
  dateTaken?: Date;
}

interface WhereClause {
  isPractice: boolean;
  assessmentId?: string;
  userId?: string;
}

jest.mock('@prisma/client', () => {
  const { v4: uuidv4 } = require('uuid');
  let mockData: Record<string, MockDataItem> = {};

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      selfAssessment: {
        create: jest.fn().mockImplementation(({ data }) => {
          const newId = uuidv4();
          mockData[newId] = { ...data, assessmentId: newId };
          return Promise.resolve(mockData[newId]);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          if (mockData[where.assessmentId]) {
            mockData[where.assessmentId] = { ...mockData[where.assessmentId], ...data };
            return Promise.resolve(mockData[where.assessmentId]);
          } else {
            return Promise.reject(new Error('Record to update not found.'));
          }
        }),
        findMany: jest.fn().mockImplementation(({ where }: { where: WhereClause }) => {
          if (where.userId) {
            return Promise.resolve(
              Object.values(mockData)
                .filter(item => item.userId === where.userId)
                .filter(item => where.isPractice === undefined || item.isPractice === where.isPractice) // Filter based on isPractice if provided
            );
          }
          return Promise.resolve([]);
        }),
        findUnique: jest.fn().mockImplementation(({ where }: { where: WhereClause }) => {
          if (where.assessmentId && mockData[where.assessmentId]) {
            return Promise.resolve(mockData[where.assessmentId]);
          }
          return Promise.resolve(null);
        }),
        delete: jest.fn().mockImplementation(({ where }: { where: WhereClause }) => {
          if (where.assessmentId && mockData[where.assessmentId]) {
            const deletedItem = mockData[where.assessmentId];
            delete mockData[where.assessmentId];
            return Promise.resolve(deletedItem);
          } else {
            return Promise.reject(new Error('Record to delete does not exist.'));
          }
        }),
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
    expect(response.body).toHaveProperty('assessmentId');
    expect(uuidValidate(response.body.assessmentId)).toBeTruthy();
  });

  it('should end an assessment', async () => {
    const createResponse = await request(server)
      .post('/selfAssessment/start-assessment')
      .send({ userId: 'someUserId', isPractice: true });
    const assessmentId = createResponse.body.assessmentId;

    const response = await request(server)
      .put(`/selfAssessment/end-assessment/${assessmentId}`)
      .send({ score: 85 });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('score', 85);
  });

  it('should retrieve all assessments for a user', async () => {
    await request(server)
      .post('/selfAssessment/start-assessment')
      .send({ userId: 'someUserId', isPractice: true });
  
    await request(server)
      .post('/selfAssessment/start-assessment')
      .send({ userId: 'someUserId', isPractice: false });
  
    const response = await request(server)
      .get('/selfAssessment/assessments/all/someUserId');
  
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });
  
  it('should retrieve all self-assessments for a user', async () => {
    await request(server)
      .post('/selfAssessment/start-assessment')
      .send({ userId: 'someUserId', isPractice: false });
    
    await request(server)
      .post('/selfAssessment/start-assessment')
      .send({ userId: 'someUserId', isPractice: false });
  
    const response = await request(server)
      .get('/selfAssessment/assessments/someUserId');
  
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    response.body.forEach(assessment => {
      expect(assessment.isPractice).toEqual(false);
    });
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
    const createResponse = await request(server)
      .post('/selfAssessment/start-assessment')
      .send({ userId: 'someUserId', isPractice: true });
    const assessmentId = createResponse.body.assessmentId;

    const response = await request(server)
      .get(`/selfAssessment/assessment/${assessmentId}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('assessmentId', assessmentId);
  });

  it('should delete a specific assessment', async () => {
    const createResponse = await request(server)
      .post('/selfAssessment/start-assessment')
      .send({ userId: 'someUserId', isPractice: true });
    const assessmentId = createResponse.body.assessmentId;

    const response = await request(server)
      .delete(`/selfAssessment/assessment/${assessmentId}`);

    expect(response.statusCode).toEqual(200);
  });

});
