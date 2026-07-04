import { http, HttpResponse } from 'msw';

let users = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'user' },
];

const mockCredentials = (email) => ({
  success: true,
  data: {
    token: 'mock-token',
    user: { id: '1', email, role: 'admin', name: 'Admin User' },
  },
});

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.email && body.password) {
      return HttpResponse.json(mockCredentials(body.email));
    }
    return new HttpResponse(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
  }),

  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.email && body.password) {
      return HttpResponse.json(mockCredentials(body.email));
    }
    return new HttpResponse(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json();
    const id = String(Date.now());
    const newUser = { id, name: body.name, email: body.email, role: 'user' };
    users.push(newUser);
    return HttpResponse.json({ success: true, data: { token: 'mock-token', user: newUser } }, { status: 201 });
  }),

  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = await request.json();
    const id = String(Date.now());
    const newUser = { id, name: body.name, email: body.email, role: 'user' };
    users.push(newUser);
    return HttpResponse.json({ success: true, data: { token: 'mock-token', user: newUser } }, { status: 201 });
  }),

  http.get('/api/users', () => HttpResponse.json(users)),
  http.get('/api/users/:id', ({ params }) => {
    const found = users.find(u => u.id === params.id);
    return found ? HttpResponse.json(found) : new HttpResponse(null, { status: 404 });
  }),
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    const id = String(Date.now());
    const newUser = { id, ...body };
    users.push(newUser);
    return HttpResponse.json(newUser, { status: 201 });
  }),
  http.put('/api/users/:id', async ({ params, request }) => {
    const patch = await request.json();
    users = users.map(u => u.id === params.id ? { ...u, ...patch } : u);
    const updated = users.find(u => u.id === params.id);
    return HttpResponse.json(updated);
  }),
  http.delete('/api/users/:id', ({ params }) => {
    users = users.filter(u => u.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];

