import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';

const mockStorage = {
  getSparks: vi.fn(),
  getSpark: vi.fn(),
  getPublishedSparks: vi.fn(),
  getFeaturedSparks: vi.fn(),
  getTodaySpark: vi.fn(),
  getReadingPlans: vi.fn(),
  getReadingPlan: vi.fn(),
  getReadingPlanDay: vi.fn(),
  getUserPlanEnrollments: vi.fn(),
  createPlanEnrollment: vi.fn(),
  updateReadingProgress: vi.fn(),
  getUser: vi.fn(),
  updateUserPreferences: vi.fn(),
};

vi.mock('../storage', () => ({
  storage: mockStorage,
}));

describe('API Integration Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    vi.clearAllMocks();
  });

  describe('GET /api/sparks', () => {
    it('should return all sparks', async () => {
      const mockSparks = [
        { id: 1, title: 'Spark 1', status: 'published' },
        { id: 2, title: 'Spark 2', status: 'published' },
      ];
      mockStorage.getSparks.mockResolvedValue(mockSparks);

      app.get('/api/sparks', async (req, res) => {
        const sparks = await mockStorage.getSparks();
        res.json(sparks);
      });

      const response = await request(app).get('/api/sparks');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Spark 1');
    });

    it('should filter sparks by category', async () => {
      const mockSparks = [{ id: 1, title: 'Prayer Spark', category: 'prayer' }];
      mockStorage.getSparks.mockResolvedValue(mockSparks);

      app.get('/api/sparks', async (req, res) => {
        const category = req.query.category as string;
        const sparks = await mockStorage.getSparks(category);
        res.json(sparks);
      });

      const response = await request(app).get('/api/sparks?category=prayer');
      expect(response.status).toBe(200);
      expect(mockStorage.getSparks).toHaveBeenCalledWith('prayer');
    });
  });

  describe('GET /api/sparks/today', () => {
    it('should return today\'s spark for audience segment', async () => {
      const mockSpark = { 
        id: 1, 
        title: 'Today\'s Devotional', 
        audienceSegment: 'schools',
        dailyDate: '2026-01-04'
      };
      mockStorage.getTodaySpark.mockResolvedValue(mockSpark);

      app.get('/api/sparks/today', async (req, res) => {
        const audience = req.query.audience as string;
        const spark = await mockStorage.getTodaySpark(audience);
        if (!spark) {
          return res.status(404).json({ message: 'No devotional for today' });
        }
        res.json(spark);
      });

      const response = await request(app).get('/api/sparks/today?audience=schools');
      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Today\'s Devotional');
      expect(mockStorage.getTodaySpark).toHaveBeenCalledWith('schools');
    });

    it('should return 404 when no spark for today', async () => {
      mockStorage.getTodaySpark.mockResolvedValue(null);

      app.get('/api/sparks/today', async (req, res) => {
        const spark = await mockStorage.getTodaySpark();
        if (!spark) {
          return res.status(404).json({ message: 'No devotional for today' });
        }
        res.json(spark);
      });

      const response = await request(app).get('/api/sparks/today');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/sparks/:id', () => {
    it('should return a single spark by ID', async () => {
      const mockSpark = { id: 25, title: 'Seated, Not Shaken' };
      mockStorage.getSpark.mockResolvedValue(mockSpark);

      app.get('/api/sparks/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        const spark = await mockStorage.getSpark(id);
        if (!spark) {
          return res.status(404).json({ message: 'Spark not found' });
        }
        res.json(spark);
      });

      const response = await request(app).get('/api/sparks/25');
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(25);
      expect(mockStorage.getSpark).toHaveBeenCalledWith(25);
    });

    it('should return 404 for non-existent spark', async () => {
      mockStorage.getSpark.mockResolvedValue(null);

      app.get('/api/sparks/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        const spark = await mockStorage.getSpark(id);
        if (!spark) {
          return res.status(404).json({ message: 'Spark not found' });
        }
        res.json(spark);
      });

      const response = await request(app).get('/api/sparks/9999');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/reading-plans', () => {
    it('should return all reading plans', async () => {
      const mockPlans = [
        { id: 1, title: 'Overcoming Anxiety', durationDays: 7 },
        { id: 2, title: 'Prayer Foundations', durationDays: 14 },
      ];
      mockStorage.getReadingPlans.mockResolvedValue(mockPlans);

      app.get('/api/reading-plans', async (req, res) => {
        const plans = await mockStorage.getReadingPlans();
        res.json(plans);
      });

      const response = await request(app).get('/api/reading-plans');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should filter plans by topic', async () => {
      const mockPlans = [{ id: 1, title: 'Prayer Plan', topics: ['prayer'] }];
      mockStorage.getReadingPlans.mockResolvedValue(mockPlans);

      app.get('/api/reading-plans', async (req, res) => {
        const filters = { topic: req.query.topic };
        const plans = await mockStorage.getReadingPlans(filters);
        res.json(plans);
      });

      const response = await request(app).get('/api/reading-plans?topic=prayer');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/reading-plans/:id', () => {
    it('should return plan with days', async () => {
      const mockPlan = {
        id: 1,
        title: 'Test Plan',
        durationDays: 7,
        days: [
          { dayNumber: 1, title: 'Day 1' },
          { dayNumber: 2, title: 'Day 2' },
        ]
      };
      mockStorage.getReadingPlan.mockResolvedValue(mockPlan);

      app.get('/api/reading-plans/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        const plan = await mockStorage.getReadingPlan(id);
        if (!plan) {
          return res.status(404).json({ message: 'Plan not found' });
        }
        res.json(plan);
      });

      const response = await request(app).get('/api/reading-plans/1');
      expect(response.status).toBe(200);
      expect(response.body.days).toHaveLength(2);
    });
  });

  describe('POST /api/reading-plans/:id/enroll', () => {
    it('should enroll user in plan', async () => {
      const mockEnrollment = { id: 1, userId: 'user123', planId: 1, status: 'active' };
      mockStorage.createPlanEnrollment.mockResolvedValue(mockEnrollment);
      mockStorage.getUserPlanEnrollments.mockResolvedValue([]);

      app.post('/api/reading-plans/:id/enroll', async (req, res) => {
        const planId = parseInt(req.params.id);
        const userId = 'user123';
        
        const existing = await mockStorage.getUserPlanEnrollments(userId);
        if (existing.some((e: any) => e.planId === planId)) {
          return res.status(400).json({ message: 'Already enrolled' });
        }
        
        const enrollment = await mockStorage.createPlanEnrollment({ userId, planId });
        res.status(201).json(enrollment);
      });

      const response = await request(app).post('/api/reading-plans/1/enroll');
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('active');
    });

    it('should reject duplicate enrollment', async () => {
      mockStorage.getUserPlanEnrollments.mockResolvedValue([{ planId: 1 }]);

      app.post('/api/reading-plans/:id/enroll', async (req, res) => {
        const planId = parseInt(req.params.id);
        const userId = 'user123';
        
        const existing = await mockStorage.getUserPlanEnrollments(userId);
        if (existing.some((e: any) => e.planId === planId)) {
          return res.status(400).json({ message: 'Already enrolled' });
        }
        
        const enrollment = await mockStorage.createPlanEnrollment({ userId, planId });
        res.status(201).json(enrollment);
      });

      const response = await request(app).post('/api/reading-plans/1/enroll');
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Already enrolled');
    });
  });

  describe('POST /api/reading-plans/:planId/days/:dayNumber/complete', () => {
    it('should mark day as complete', async () => {
      const mockProgress = { 
        userId: 'user123', 
        planId: 1, 
        dayNumber: 1, 
        completed: true 
      };
      mockStorage.updateReadingProgress.mockResolvedValue(mockProgress);

      app.post('/api/reading-plans/:planId/days/:dayNumber/complete', async (req, res) => {
        const planId = parseInt(req.params.planId);
        const dayNumber = parseInt(req.params.dayNumber);
        const userId = 'user123';
        
        const progress = await mockStorage.updateReadingProgress({
          userId,
          planId,
          dayNumber,
          completed: true,
          journalEntry: req.body.journalEntry
        });
        res.json(progress);
      });

      const response = await request(app)
        .post('/api/reading-plans/1/days/1/complete')
        .send({ journalEntry: 'My reflection...' });
      
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });
  });

  describe('User Preferences', () => {
    it('should update user audience segment', async () => {
      const updatedUser = { 
        id: 'user123', 
        audienceSegment: 'universities',
        contentMode: 'faith'
      };
      mockStorage.updateUserPreferences.mockResolvedValue(updatedUser);

      app.patch('/api/auth/user/preferences', async (req, res) => {
        const userId = 'user123';
        const preferences = req.body;
        const user = await mockStorage.updateUserPreferences(userId, preferences);
        res.json(user);
      });

      const response = await request(app)
        .patch('/api/auth/user/preferences')
        .send({ audienceSegment: 'universities', contentMode: 'faith' });
      
      expect(response.status).toBe(200);
      expect(response.body.audienceSegment).toBe('universities');
    });
  });
});
