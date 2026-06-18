import mongoose from 'mongoose';

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not set');

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// User Schema — upserted on /api/auth/verify
const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    displayName: { type: String },
    photoURL: { type: String },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model('User', userSchema);

// Resume Schema
const resumeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    text: { type: String, required: true },
    s3Key: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Resume =
  mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

// Optimization Result Schema
const optimizationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', index: true },
    originalText: { type: String, required: true },
    optimizedText: { type: String, required: true },
    targetRole: { type: String, default: 'General Professional' },
    jobDescriptions: { type: [String], default: [] },
    model: { type: String, default: 'gpt-3.5-turbo' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const OptimizationResult =
  mongoose.models.OptimizationResult ||
  mongoose.model('OptimizationResult', optimizationSchema);

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}
