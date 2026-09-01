// services/rssNewsService.js

import Parser from "rss-parser";
import { NEWS_FEEDS } from "../config/newsFeeds.js";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

export async function fetchRSSNews() {
  const articles = [];

  for (const source of NEWS_FEEDS) {
    try {
      console.log("\n======================================");
      console.log(`📡 Fetching RSS: ${source.name}`);
      console.log(`URL: ${source.url}`);
      console.log("======================================");

      const feed = await parser.parseURL(source.url);

      console.log(
        `✅ SUCCESS: ${source.name} → ${feed.items?.length || 0} items`
      );

      for (const item of feed.items || []) {

        // ========================================
        // GET IMAGE FROM FREIGHTWAVES
        // ========================================

        let image =
          item.mediaContent?.$?.url ||
          item.mediaContent?.url ||
          null;

        // Fallback:
        // Sometimes image can exist inside content:encoded
        if (!image && item.contentEncoded) {
          const imageMatch =
            item.contentEncoded.match(
              /<img[^>]+src=["']([^"']+)["']/i
            );

          if (imageMatch?.[1]) {
            image = imageMatch[1];
          }
        }

        console.log("\n📰 RSS ARTICLE");
        console.log("Title:", item.title);
        console.log("URL:", item.link);
        console.log(
          "Image:",
          image || "⚠️ No image available"
        );

        articles.push({
          title: item.title || "",

          url: item.link || "",

          description:
            item.contentSnippet ||
            item.description ||
            "",

          contentSnippet:
            item.contentSnippet ||
            item.description ||
            "",

          content:
            item.contentEncoded ||
            item.content ||
            item.description ||
            "",

          image: image,

          publishedAt:
            item.isoDate ||
            item.pubDate ||
            new Date(),

          sourceName: source.name,
        });
      }

    } catch (error) {
      console.error(`❌ RSS FAILED: ${source.name}`);
      console.error(`URL: ${source.url}`);
      console.error(`MESSAGE: ${error.message}`);
    }
  }

  console.log("\n======================================");
  console.log("TOTAL RSS ARTICLES:", articles.length);
  console.log("======================================\n");

  return articles;
}