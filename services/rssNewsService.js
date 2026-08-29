import Parser from "rss-parser";
import { NEWS_FEEDS } from "../config/newsFeeds.js";

const parser = new Parser();

export async function fetchRSSNews() {
  const articles = [];

  for (const source of NEWS_FEEDS) {
    try {
      console.log(`Fetching RSS: ${source.name}`);
      console.log(`URL: ${source.url}`);

      const feed = await parser.parseURL(source.url);

      console.log(
        `SUCCESS: ${source.name} → ${feed.items?.length || 0} items`
      );

      for (const item of feed.items || []) {
        articles.push({
          title: item.title,
          url: item.link,
          description:
            item.contentSnippet ||
            item.content ||
            item.summary ||
            "",
          contentSnippet:
            item.contentSnippet ||
            item.content ||
            "",
          publishedAt:
            item.isoDate ||
            item.pubDate ||
            new Date(),
          sourceName: source.name,
        });
      }
    } catch (error) {
      console.error(`RSS FAILED: ${source.name}`);
      console.error(`URL: ${source.url}`);
      console.error(`MESSAGE: ${error.message}`);
    }
  }

  console.log("TOTAL RSS ARTICLES:", articles.length);

  return articles;
}