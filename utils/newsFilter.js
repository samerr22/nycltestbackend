// utils/newsFilter.js

const logisticsKeywords = [
  "logistics",
  "shipping",
  "container",
  "containers",
  "freight",
  "cargo",
  "maritime",
  "port",
  "ports",
  "vessel",
  "vessels",
  "supply chain",
  "warehouse",
  "warehousing",
  "customs",
  "import",
  "export",
  "air freight",
  "ocean freight",
  "road freight",
  "freight forwarding",
  "carrier",
  "carriers",
  "terminal",
  "trade route",
];

const blockedKeywords = [
  "celebrity",
  "movie",
  "actor",
  "actress",
  "fashion",
  "football",
  "cricket",
  "basketball",
  "relationship",
  "dating",
  "wedding",
  "gossip",
];

export function basicNewsFilter(article) {
  const text = `
    ${article.title || ""}
    ${article.contentSnippet || ""}
    ${article.content || ""}
  `.toLowerCase();

  const blocked = blockedKeywords.some((word) =>
    text.includes(word)
  );

  if (blocked) {
    return false;
  }

  const matches = logisticsKeywords.filter((word) =>
    text.includes(word)
  );

  return matches.length >= 2;
}