import mongoose from 'mongoose';
import { vi, beforeAll, afterAll } from 'vitest';

// ── Module mocks ────────────────────────────────────────────────────────────

vi.mock('../app/services/socketService.js', () => ({
  initIO: vi.fn(),
  getIO: vi.fn(() => ({
    to: vi.fn(() => ({ emit: vi.fn() })),
    emit: vi.fn(),
  })),
}));

vi.mock('../app/config/NodeMailer.js', () => ({
  default: {
    sendMail: vi.fn(async ({ html }) => {
      // Match 6 digits that appear as a text node (between > and <), not inside an attribute.
      // This avoids matching hex colour codes like #374151 that appear in CSS style attributes.
      const match = html?.match(/>\s*(\d{6})\s*</);
      if (match) global.__testOtp = match[1];
      return { messageId: 'test-msg-id' };
    }),
  },
}));

// ── DB lifecycle ─────────────────────────────────────────────────────────────

beforeAll(async () => {
  const uri = process.env.VITEST_MONGO_URI;
  if (!uri) throw new Error('VITEST_MONGO_URI not set — check globalSetup.js');
  process.env.MONGO_URI = uri;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

// NOTE: No afterEach here — tests within a file share beforeAll state.
// Each test FILE adds its own afterAll to wipe collections between files.
