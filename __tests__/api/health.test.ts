import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns status 200', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it('returns status ok and timestamp', async () => {
    const response = await GET();
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });
});
