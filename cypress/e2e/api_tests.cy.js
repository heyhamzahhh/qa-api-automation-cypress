import Ajv from 'ajv';

const ajv = new Ajv();

const userSchema = {
  type: 'object',
  required: ['id', 'name', 'email'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string' }
  }
};

describe('API Testing Suite - Advanced', () => {

  it('GET - Validate users schema & response time', () => {
    const validate = ajv.compile(userSchema);

    cy.request('/users').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.duration).to.be.lessThan(1000);

      response.body.forEach(user => {
        const valid = validate(user);
        expect(valid).to.be.true;
      });
    });
  });

  it('POST - Create user with valid data', () => {
    cy.fixture('user').then((user) => {
      cy.request('POST', '/users', user).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.name).to.eq(user.name);
      });
    });
  });

  it('POST - Negative test (missing required field)', () => {
    cy.request({
      method: 'POST',
      url: '/users',
      failOnStatusCode: false,
      body: {
        email: 'no-name@test.com'
      }
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 422]);
    });
  });

  it('PUT - Update user & validate response', () => {
    cy.request('PUT', '/users/1', {
      name: 'Updated Name'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.name).to.eq('Updated Name');
    });
  });

  it('GET - Edge case (non-existent user)', () => {
    cy.request({
      method: 'GET',
      url: '/users/9999',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([404, 200]);
    });
  });

  it('DELETE - Validate deletion', () => {
    cy.request('DELETE', '/users/1').then((response) => {
      expect(response.status).to.eq(200);
    });
  });

});
