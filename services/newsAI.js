// services/newsAI.js

import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeNewsArticle(article) {

  console.log("\n🤖 OPENAI EDITOR CHECK");
  console.log("Title:", article.title);
  console.log("Source:", article.publisher || article.sourceName);

  const input = `
You are a strict senior editor for a professional international
logistics and freight forwarding company's news website.

Your job is NOT to publish every logistics-related article.

Only approve articles that provide meaningful professional,
commercial, operational, regulatory, market, infrastructure,
technology, or supply-chain value to logistics customers
and industry professionals.

ARTICLE

TITLE:
${article.title || ""}

DESCRIPTION:
${article.contentSnippet || article.description || ""}

PUBLISHER:
${article.publisher || article.sourceName || ""}

DATE:
${article.publishedAt || ""}


APPROVE topics such as:

- ocean freight rates
- container shipping
- carrier capacity
- vessel deployments
- port congestion
- port operations
- terminal developments
- Red Sea / Suez shipping disruption
- Panama Canal shipping
- major trade route changes
- air cargo rates and capacity
- air freight operations
- road freight
- freight forwarding
- customs regulations
- import/export regulations
- tariffs when directly affecting logistics
- supply chain disruption
- logistics technology
- warehouse operations
- maritime sustainability
- major shipping carrier announcements
- significant logistics acquisitions or investments


REJECT articles that are:

- gossip
- celebrity news
- entertainment
- sports
- lifestyle
- tourism
- luxury yacht stories
- general politics without direct logistics impact
- military/political stories where logistics is incidental
- crime stories unless there is significant supply-chain impact
- sensational or graphic reporting
- weak clickbait
- advertisements
- promotional press releases with little industry value
- generic corporate marketing
- opinion pieces without useful industry information
- loosely related to logistics
- local stories with little international/business relevance
- duplicate/repackaged reporting with no additional value


QUALITY STANDARD:

A logistics keyword appearing in an article is NOT enough.

The article must be something a logistics company could confidently
show to customers, freight professionals, importers, exporters,
supply-chain managers or shipping industry professionals.

Score relevance from 0 to 100.

Use this guideline:

95-100 = highly important professional logistics news
90-94  = strong professional industry news
85-89  = useful and clearly relevant
70-84  = somewhat relevant but not strong enough
0-69   = unsuitable

Only publish if relevanceScore >= 85.

Return ONLY valid JSON:

{
  "publish": true,
  "relevanceScore": 95,
  "isProfessional": true,
  "isGossip": false,
  "businessValue": "high",
  "category": "Ocean Freight",
  "summary": "Professional 2-3 sentence summary explaining why this matters to logistics industry readers.",
  "rejectionReason": null
}

If rejected:

{
  "publish": false,
  "relevanceScore": 40,
  "isProfessional": false,
  "isGossip": false,
  "businessValue": "low",
  "category": "Supply Chain",
  "summary": "",
  "rejectionReason": "Not sufficiently relevant to professional logistics operations."
}

category MUST be exactly one of:

Ocean Freight
Air Freight
Road Freight
Freight Forwarding
Supply Chain
Import & Export
`;

  try {

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input,
    });

    console.log("✅ OPENAI RESPONSE RECEIVED");

    const text = response.output_text.trim();

    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleaned);

    console.log("🤖 AI DECISION:", {
      publish: result.publish,
      score: result.relevanceScore,
      professional: result.isProfessional,
      gossip: result.isGossip,
      businessValue: result.businessValue,
      category: result.category,
      rejectionReason: result.rejectionReason,
    });

    return result;

  } catch (error) {

    console.error("❌ OPENAI ERROR");
    console.error("Title:", article.title);
    console.error("Message:", error.message);

    throw error;
  }
}