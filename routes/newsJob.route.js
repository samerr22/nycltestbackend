// routes/newsJob.route.js

import express from "express";
import { updateDailyNews } from "../services/updateNews.js";

const router = express.Router();

router.post(
  "/refresh",
  async (req, res) => {

    try {

      const secret =
        req.headers["x-news-job-secret"];

      if (
        secret !== process.env.NEWS_JOB_SECRET
      ) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result =
        await updateDailyNews();

      res.status(200).json({
        success: true,
        ...result,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;