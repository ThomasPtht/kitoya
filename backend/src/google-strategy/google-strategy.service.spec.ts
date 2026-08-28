import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategyService } from './google-strategy.service';

describe('GoogleStrategyService', () => {
  let service: GoogleStrategyService;

  beforeEach(async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_CALLBACK_URL =
      'http://localhost:3000/auth/google/callback';

    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleStrategyService],
    }).compile();

    service = module.get<GoogleStrategyService>(GoogleStrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validate', () => {
    it('should extract email, first name, last name and picture from a complete Google profile', (done) => {
      const profile = {
        name: { givenName: 'John', familyName: 'Doe' },
        emails: [{ value: 'john.doe@gmail.com' }],
        photos: [{ value: 'https://lh3.googleusercontent.com/photo.jpg' }],
      };

      const doneCallback = (err: any, user: any) => {
        expect(err).toBeNull();
        expect(user).toEqual({
          email: 'john.doe@gmail.com',
          firstName: 'John',
          lastName: 'Doe',
          picture: 'https://lh3.googleusercontent.com/photo.jpg',
        });
        done();
      };

      service.validate('access-token', 'refresh-token', profile, doneCallback);
    });

    it('should handle a profile without a photo', (done) => {
      const profile = {
        name: { givenName: 'Jane', familyName: 'Smith' },
        emails: [{ value: 'jane.smith@gmail.com' }],
        photos: undefined,
      };

      const doneCallback = (err: any, user: any) => {
        expect(err).toBeNull();
        expect(user.picture).toBeUndefined();
        expect(user.email).toBe('jane.smith@gmail.com');
        done();
      };

      service.validate('access-token', 'refresh-token', profile, doneCallback);
    });

    it('should handle a profile without name information', (done) => {
      const profile = {
        name: undefined,
        emails: [{ value: 'noname@gmail.com' }],
        photos: [{ value: 'https://example.com/pic.jpg' }],
      };

      const doneCallback = (err: any, user: any) => {
        expect(err).toBeNull();
        expect(user.firstName).toBeUndefined();
        expect(user.lastName).toBeUndefined();
        expect(user.email).toBe('noname@gmail.com');
        done();
      };

      service.validate('access-token', 'refresh-token', profile, doneCallback);
    });
  });
});
