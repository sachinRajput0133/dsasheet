import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { TOPICS_SEED } from './data/topics.seed';
import { PROBLEMS_SEED } from './data/problems.seed';

// Load .env from repo root
// __dirname = apps/api/src/database/seeds → 5 levels up to reach repo root
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dsasheet';

const TopicSchema = new mongoose.Schema({
  title: String,
  description: String,
  order: Number,
}, { timestamps: true });




const ProblemSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  title: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  tags: [String],
  youtubeLink: String,
  codingLink: String,
  articleLink: String,
  description: String,
  order: Number,
}, { timestamps: true });

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  const TopicModel = mongoose.model('Topic', TopicSchema);
  const ProblemModel = mongoose.model('Problem', ProblemSchema);

  console.log('🧹 Clearing existing topics and problems...');
  await Promise.all([TopicModel.deleteMany({}), ProblemModel.deleteMany({})]);

  console.log('🌱 Seeding topics...');
  const createdTopics = await TopicModel.insertMany(TOPICS_SEED);

  // Build slug → ObjectId map
  const topicMap = new Map<string, mongoose.Types.ObjectId>();
  createdTopics.forEach((t) => topicMap.set(t.title, t._id as mongoose.Types.ObjectId));

  const problemDocs = PROBLEMS_SEED.map(({ topicSlug, ...rest }) => {
    const topicId = topicMap.get(topicSlug);
    if (!topicId) throw new Error(`Unknown topic slug: ${topicSlug}`);
    return { ...rest, topicId };
  });

  console.log('🌱 Seeding problems...');
  await ProblemModel.insertMany(problemDocs);

  console.log(`✅ Seeded ${createdTopics.length} topics and ${problemDocs.length} problems`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
