import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { body, validationResult } from "express-validator";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// CORS configuration - allow requests from frontend
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ai-classroom-feedback-1.onrender.com",
    "https://ai-classroom-feedback-frontend.onrender.com",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Contact Form API is running",
    timestamp: new Date().toISOString(),
  });
});

app.post(
  "/api/contact",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 255 })
      .withMessage("Name must be between 2 and 255 characters"),
    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 255 })
      .withMessage("Last name must be between 2 and 255 characters"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Must be a valid email address")
      .normalizeEmail(),
    body("department")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 255 })
      .withMessage("Department must be less than 255 characters"),
    body("category")
      .trim()
      .notEmpty()
      .withMessage("Category is required")
      .isIn(["feedback", "suggestion", "problem"])
      .withMessage("Category must be one of: feedback, suggestion, problem"),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ min: 10, max: 5000 })
      .withMessage("Message must be between 10 and 5000 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { name, lastName, email, department, category, message } = req.body;
      const { data, error } = await supabase
        .from("contact_submissions")
        .insert([
          {
            name,
            last_name: lastName,
            email,
            department: department || null,
            category,
            message,
          },
        ])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({
          error: "Failed to submit contact form. Please try again later.",
        });
      }

      console.log("Contact form submitted successfully:", data[0].id);

      res.status(201).json({
        success: true,
        message:
          "Your message has been received. We will get back to you soon!",
        submissionId: data[0].id,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({
        error: "An unexpected error occurred. Please try again later.",
      });
    }
  },
);

app.get("/api/submissions", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        error: "Failed to fetch submissions",
      });
    }

    res.json({
      success: true,
      count: data.length,
      submissions: data,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "An unexpected error occurred",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`\n Server is running on http://localhost:${PORT}`);
  console.log(` Contact form endpoint: http://localhost:${PORT}/api/contact`);
  console.log(` Health check: http://localhost:${PORT}/api/health\n`);
});
