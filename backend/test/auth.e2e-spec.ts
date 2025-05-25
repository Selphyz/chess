import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  // Test user data
  const user = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'testpassword123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('should signup successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(user)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('username', user.username);
      expect(res.body).toHaveProperty('email', user.email);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should fail to signup with duplicate username/email', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(user)
        .expect(409); // Conflict or appropriate error code
    });

    it('should fail to signup with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ username: '', email: 'not-an-email', password: '123' })
        .expect(400);
    });
  });

  describe('/auth/signin (POST)', () => {
    it('should signin successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ username: user.username, password: user.password })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('should fail to signin with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ username: user.username, password: 'wrongpassword' })
        .expect(401);
    });

    it('should fail to signin with non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ username: 'nouser', password: 'nopass' })
        .expect(401);
    });
  });
});