import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// API Routes
app.get("/api", (req, res) => {
  res.json({ message: "Paulis Studio API is running", version: "1.0.0" });
});

app.post("/api/send-email", async (req, res) => {
  const { to, subject, html, attachments } = req.body;

  if (!resend) {
    console.warn("RESEND_API_KEY not found. Skipping email send.");
    return res.status(503).json({ error: "Email service not configured. Please add RESEND_API_KEY to environment variables." });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Paulis Studio <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
      attachments: attachments || [],
    });

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Since Vercel handles static serving, we don't need the Vite middleware or static serving here
// if we use re-writes in vercel.json. This index.ts only handles /api.

export default app;
