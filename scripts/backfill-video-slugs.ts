import { prisma } from "../lib/prisma";
import { assignVideoSlug } from "../lib/video-slug";

async function main() {
  const videos = await prisma.video.findMany({ orderBy: { id: "asc" } });
  for (const video of videos) {
    const slug = await assignVideoSlug(video.id, video.description);
    console.log(`video ${video.id} → ${slug}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
