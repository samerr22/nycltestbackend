// services/updateNews.js

import News from "../models/News.js";
import { fetchRSSNews } from "./rssNewsService.js";
import { basicNewsFilter } from "../utils/newsFilter.js";
import { analyzeNewsArticle } from "./newsAI.js";

export async function updateDailyNews() {

  console.log("\n======================================");
  console.log("📰 DAILY LOGISTICS NEWS JOB STARTED");
  console.log("======================================\n");

  const rssArticles = await fetchRSSNews();

  console.log("\n📥 RSS FETCH COMPLETE");
  console.log("Total RSS articles:", rssArticles.length);


  // ========================================
  // FREE KEYWORD FILTER
  // ========================================

  const filtered = [];

  let keywordRejected = 0;

  for (const article of rssArticles) {

    const passed = basicNewsFilter(article);

    if (passed) {

      filtered.push(article);

    } else {

      keywordRejected++;

      console.log("\n🚫 KEYWORD FILTER REJECTED:");
      console.log(article.title);
    }
  }


  console.log("\n======================================");
  console.log("FREE FILTER RESULTS");
  console.log("======================================");

  console.log("RSS articles:", rssArticles.length);
  console.log("Keyword rejected:", keywordRejected);
  console.log("Passed keyword filter:", filtered.length);


  // ========================================
  // LIMIT OPENAI COST
  // ========================================

  const candidates = filtered.slice(0, 15);

  console.log(
    `\n🤖 Sending maximum ${candidates.length} articles to OpenAI`
  );


  let savedCount = 0;

  let duplicateCount = 0;

  let aiRejectedCount = 0;

  let aiCheckedCount = 0;

  let errorCount = 0;


  // ========================================
  // PROCESS ARTICLES
  // ========================================

  for (const article of candidates) {

    console.log("\n--------------------------------------");
    console.log("📰 PROCESSING ARTICLE");
    console.log("--------------------------------------");

    console.log("Title:", article.title);
    console.log("URL:", article.url);


    try {

      // ====================================
      // DUPLICATE CHECK
      // ====================================

      const existing = await News.findOne({
        url: article.url,
      });


      if (existing) {

        duplicateCount++;

        console.log("⏭️ DUPLICATE — already in MongoDB");

        continue;
      }


      // ====================================
      // OPENAI CHECK
      // ====================================

      console.log("🤖 Sending article to OpenAI...");

      const ai = await analyzeNewsArticle(article);

      aiCheckedCount++;


      console.log("\nAI DECISION:");

      console.log("Relevance:", ai.relevanceScore);
      console.log("Professional:", ai.isProfessional);
      console.log("Gossip:", ai.isGossip);
      console.log("Publish:", ai.publish);
      console.log("Category:", ai.category);


      // ====================================
      // AI REJECTION RULES
      // ====================================

      if (!ai.publish) {

        aiRejectedCount++;

        console.log("❌ AI REJECTED");
        console.log("Reason: publish = false");

        continue;
      }


     if (ai.relevanceScore < 85) {

        aiRejectedCount++;

        console.log("❌ AI REJECTED");
        console.log(
          `Reason: relevance score too low (${ai.relevanceScore})`
        );

        continue;
      }


      if (ai.isGossip === true) {

        aiRejectedCount++;

        console.log("❌ AI REJECTED");
        console.log("Reason: gossip / unsuitable");

        continue;
      }


      if (ai.isProfessional !== true) {

        aiRejectedCount++;

        console.log("❌ AI REJECTED");
        console.log("Reason: not professional");

        continue;
      }


      // ====================================
      // SAVE TO MONGODB
      // ====================================

      await News.create({
  title: article.title,

  description: ai.summary,

  content: article.content || article.description,

  image: article.image || null,

  url: article.url,

  source: article.sourceName,

  category: ai.category,

  publishedAt: article.publishedAt,

  relevanceScore: ai.relevanceScore,

  isProfessional: ai.isProfessional,

  isGossip: ai.isGossip,

  aiProcessed: true,

  fetchedAt: new Date(),
});


      savedCount++;


      console.log("✅ APPROVED");
      console.log("✅ SAVED TO MONGODB");
      console.log("Category:", ai.category);
      console.log("Score:", ai.relevanceScore);


      // maximum 10 articles/day

      if (savedCount >= 10) {

        console.log(
          "\n🛑 Reached maximum 10 saved articles."
        );

        break;
      }


    } catch (error) {

      errorCount++;

      console.error("\n❌ ARTICLE PROCESSING ERROR");
      console.error("Title:", article.title);
      console.error("Error:", error.message);
    }
  }


  // ========================================
  // FINAL REPORT
  // ========================================

  console.log("\n======================================");
  console.log("📊 DAILY NEWS JOB REPORT");
  console.log("======================================");

  console.log("RSS fetched:", rssArticles.length);
  console.log("Keyword rejected:", keywordRejected);
  console.log("Passed keyword filter:", filtered.length);
  console.log("Sent to OpenAI:", aiCheckedCount);
  console.log("Duplicates:", duplicateCount);
  console.log("AI rejected:", aiRejectedCount);
  console.log("Saved:", savedCount);
  console.log("Errors:", errorCount);

  console.log("======================================\n");


  return {

    fetched: rssArticles.length,

    keywordRejected,

    passedKeywordFilter: filtered.length,

    sentToOpenAI: aiCheckedCount,

    duplicates: duplicateCount,

    aiRejected: aiRejectedCount,

    saved: savedCount,

    errors: errorCount,
  };
}