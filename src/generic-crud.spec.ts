import { Client } from './client';
import { Model, ResourceAttributes, ResourceRelationships } from './models/model';
import { EmptyBodyError, ApiError } from './errors';
import { expect } from 'chai';
import nock from 'nock';

// Simple test model for testing generic CRUD
class TestResource extends Model {
  static type = 'test-resources';
  public email?: string;
  public active?: boolean;
}

describe('Generic CRUD Operations', () => {
  let client: Client;
  
  beforeEach(() => {
    client = new Client('test_client_id', 'test_client_secret');
    
    // Mock OAuth token request
    nock('https://api.flair.co')
      .post('/oauth/token')
      .reply(200, {
        access_token: 'test_access_token',
        token_type: 'Bearer',
        expires_in: 3600,
      });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Generic GET Operations', () => {
    it('should get a collection of resources', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            type: 'test-resources',
            attributes: { email: 'test1@example.com', active: true },
            relationships: {},
          },
          {
            id: '2', 
            type: 'test-resources',
            attributes: { email: 'test2@example.com', active: false },
            relationships: {},
          },
        ],
      };

      nock('https://api.flair.co')
        .get('/api/test-resources')
        .reply(200, mockResponse);

      const resources = await client.get<TestResource>('test-resources') as TestResource[];
      
      expect(Array.isArray(resources)).to.be.true;
      expect(resources).to.have.length(2);
      expect(resources[0].id).to.equal('1');
      expect(resources[0].email).to.equal('test1@example.com');
      expect(resources[1].id).to.equal('2');
      expect(resources[1].email).to.equal('test2@example.com');
    });

    it('should get a single resource by id', async () => {
      const mockResponse = {
        data: {
          id: '123',
          type: 'test-resources',
          attributes: { email: 'single@example.com', active: true },
          relationships: {},
        },
      };

      nock('https://api.flair.co')
        .get('/api/test-resources/123')
        .reply(200, mockResponse);

      const resource = await client.get<TestResource>('test-resources', '123') as TestResource;
      
      expect(resource.id).to.equal('123');
      expect(resource.email).to.equal('single@example.com');
      expect(resource.active).to.be.true;
    });

    it('should handle empty response with EmptyBodyError', async () => {
      nock('https://api.flair.co')
        .get('/api/test-resources')
        .reply(200, { data: null });

      try {
        await client.get<TestResource>('test-resources');
        expect.fail('Should have thrown EmptyBodyError');
      } catch (error) {
        expect(error).to.be.instanceOf(EmptyBodyError);
        expect((error as EmptyBodyError).statusCode).to.equal(200);
      }
    });
  });

  describe('Generic CREATE Operations', () => {
    it('should create a new resource with attributes', async () => {
      const requestAttributes = { email: 'new@example.com', active: true };
      const responseData = {
        data: {
          id: 'new-id',
          type: 'test-resources',
          attributes: requestAttributes,
          relationships: {},
        },
      };

      nock('https://api.flair.co')
        .post('/api/test-resources', {
          data: {
            type: 'test-resources',
            attributes: requestAttributes,
            relationships: {},
          },
        })
        .reply(201, responseData);

      const resource = await client.create<TestResource>('test-resources', requestAttributes);
      
      expect(resource.id).to.equal('new-id');
      expect(resource.email).to.equal('new@example.com');
      expect(resource.active).to.be.true;
    });

    it('should create a resource with relationships', async () => {
      const relatedResource = new TestResource();
      relatedResource.id = 'related-id';
      relatedResource.setClient(client);

      const requestAttributes = { email: 'with-rel@example.com' };
      const requestRelationships = { parent: relatedResource };

      const responseData = {
        data: {
          id: 'new-id',
          type: 'test-resources', 
          attributes: requestAttributes,
          relationships: { parent: { data: { id: 'related-id', type: 'test-resources' } } },
        },
      };

      nock('https://api.flair.co')
        .post('/api/test-resources', {
          data: {
            type: 'test-resources',
            attributes: requestAttributes,
            relationships: {
              parent: { data: { id: 'related-id', type: 'test-resources' } },
            },
          },
        })
        .reply(201, responseData);

      const resource = await client.create<TestResource>('test-resources', requestAttributes, requestRelationships);
      
      expect(resource.id).to.equal('new-id');
      expect(resource.email).to.equal('with-rel@example.com');
    });
  });

  describe('Generic UPDATE Operations', () => {
    it('should update a resource with new attributes', async () => {
      const updateAttributes = { email: 'updated@example.com', active: false };
      const responseData = {
        data: {
          id: '123',
          type: 'test-resources',
          attributes: updateAttributes,
          relationships: {},
        },
      };

      nock('https://api.flair.co')
        .patch('/api/test-resources/123', {
          data: {
            id: '123',
            type: 'test-resources',
            attributes: updateAttributes,
            relationships: {},
          },
        })
        .reply(200, responseData);

      const resource = await client.update<TestResource>('test-resources', '123', updateAttributes);
      
      expect(resource.id).to.equal('123');
      expect(resource.email).to.equal('updated@example.com');
      expect(resource.active).to.be.false;
    });
  });

  describe('Generic DELETE Operations', () => {
    it('should delete a resource', async () => {
      nock('https://api.flair.co')
        .delete('/api/test-resources/123')
        .reply(204);

      // Should not throw
      await client.delete('test-resources', '123');
    });
  });

  describe('Model Instance CRUD Operations', () => {
    it('should refresh a model instance from API', async () => {
      const resource = new TestResource();
      resource.id = '123';
      resource.setClient(client);

      const responseData = {
        data: {
          id: '123',
          type: 'test-resources',
          attributes: { email: 'refreshed@example.com', active: true },
          relationships: {},
        },
      };

      nock('https://api.flair.co')
        .get('/api/test-resources/123')
        .reply(200, responseData);

      const refreshed = await resource.refresh();
      
      expect(refreshed.email).to.equal('refreshed@example.com');
      expect(refreshed.active).to.be.true;
    });

    it('should update a model instance', async () => {
      const resource = new TestResource();
      resource.id = '123';
      resource.setClient(client);

      const updateAttributes = { email: 'instance-updated@example.com' };
      const responseData = {
        data: {
          id: '123',
          type: 'test-resources',
          attributes: updateAttributes,
          relationships: {},
        },
      };

      nock('https://api.flair.co')
        .patch('/api/test-resources/123', {
          data: {
            id: '123',
            type: 'test-resources',
            attributes: updateAttributes,
            relationships: {},
          },
        })
        .reply(200, responseData);

      const updated = await resource.update(updateAttributes);
      
      expect(updated.email).to.equal('instance-updated@example.com');
    });

    it('should delete a model instance', async () => {
      const resource = new TestResource();
      resource.id = '123';
      resource.setClient(client);

      nock('https://api.flair.co')
        .delete('/api/test-resources/123')
        .reply(204);

      await resource.delete();
      
      expect(resource.deleted).to.be.true;
    });

    it('should create relationship data correctly', async () => {
      const resource = new TestResource();
      resource.id = '123';

      const relationshipData = resource.toRelationship();
      
      expect(relationshipData).to.deep.equal({
        id: '123',
        type: 'test-resources',
      });
    });

    it('should check equality correctly', async () => {
      const resource1 = new TestResource();
      resource1.id = '123';

      const resource2 = new TestResource();
      resource2.id = '123';

      const resource3 = new TestResource();
      resource3.id = '456';

      expect(resource1.equals(resource2)).to.be.true;
      expect(resource1.equals(resource3)).to.be.false;
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiError for HTTP error responses', async () => {
      const errorResponse = {
        errors: [{ detail: 'Resource not found' }],
      };

      nock('https://api.flair.co')
        .get('/api/test-resources/404')
        .reply(404, errorResponse);

      try {
        await client.get<TestResource>('test-resources', '404');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).to.be.instanceOf(ApiError);
        expect((error as ApiError).statusCode).to.equal(404);
      }
    });

    it('should handle model operations without client', async () => {
      const resource = new TestResource();
      resource.id = '123';
      // No client set

      try {
        await resource.refresh();
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.include('Cannot refresh: missing client or ID');
      }
    });

    it('should handle model operations without ID', async () => {
      const resource = new TestResource();
      resource.setClient(client);
      // No ID set

      try {
        await resource.update({ email: 'test@example.com' });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).to.include('Cannot update: missing client or ID');
      }
    });
  });
});