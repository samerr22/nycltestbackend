import News from "../models/News.js";

// ========================================
// GET ALL NEWS
// ========================================

export const getNews = async (req, res) => {
  try {
    const news = await News.find({
  isProfessional: true,
  isGossip: false,
  relevanceScore: {
    $gte: 85,
  },
})
  .sort({ publishedAt: -1 })
  .limit(50);

    const formattedNews = news.map((article) => ({
  _id: article._id,

  title: article.title,
  description: article.description,
  content: article.content,
  image: article.image,
  url: article.url,
  source: article.source,
  category: article.category,
  isSaved: article.isSaved,

  publishedAt: article.publishedAt,

  date: article.publishedAt
    ? article.publishedAt.toISOString().split("T")[0]
    : null,

  fetchedAt: article.fetchedAt,
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
}));

    return res.status(200).json({
      success: true,
      total: formattedNews.length,
      data: formattedNews,
    });
  } catch (error) {
    console.error("Get news error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};