import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin } from "../replitAuth";
import { z } from "zod";

const router = Router();

// Schema for creating/updating a submission
const submissionSchema = z.object({
  contentType: z.enum(['devotional', 'prayer', 'testimony', 'worship', 'teaching', 'spark']),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  scriptureRef: z.string().optional(),
  category: z.string().optional(),
  mediaUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  scheduledDate: z.string().optional(), // ISO date string
  status: z.enum(['draft', 'pending']).optional(),
});

// Schema for review action
const reviewSchema = z.object({
  reviewNotes: z.string().optional(),
  scheduledDate: z.string().optional(), // ISO date string
});

/**
 * GET /api/collaborator/submissions
 * Get current user's submissions
 */
router.get("/collaborator/submissions", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const user = await storage.getUser(userId);

    // Check if user exists and has collaborator role
    if (!user || !user.role || !['collaborator', 'leader', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: "You must be a collaborator to submit content" });
    }

    const submissions = await storage.getCollaboratorSubmissions(userId);
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching collaborator submissions:", error);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});

/**
 * POST /api/collaborator/submissions
 * Create a new submission
 */
router.post("/collaborator/submissions", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const user = await storage.getUser(userId);

    // Check if user exists and has collaborator role
    if (!user || !user.role || !['collaborator', 'leader', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: "You must be a collaborator to submit content" });
    }

    const data = submissionSchema.parse(req.body);

    const submission = await storage.createCollaboratorSubmission({
      userId: parseInt(userId, 10),
      ...data,
      status: data.status || 'draft',
      submittedAt: data.status === 'pending' ? new Date() : undefined,
    });

    res.status(201).json(submission);
  } catch (error: any) {
    console.error("Error creating submission:", error);
    res.status(400).json({ message: error.message || "Failed to create submission" });
  }
});

/**
 * GET /api/collaborator/submissions/:id
 * Get a specific submission
 */
router.get("/collaborator/submissions/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const submissionId = parseInt(req.params.id, 10);

    const submission = await storage.getCollaboratorSubmission(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Users can only view their own submissions (unless admin/leader)
    const user = await storage.getUser(userId);
    if (!user || (submission.userId !== parseInt(userId, 10) && (!user.role || !['admin', 'leader'].includes(user.role)))) {
      return res.status(403).json({ message: "Not authorized to view this submission" });
    }

    res.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ message: "Failed to fetch submission" });
  }
});

/**
 * PATCH /api/collaborator/submissions/:id
 * Update a submission (only if status is draft)
 */
router.patch("/collaborator/submissions/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const submissionId = parseInt(req.params.id, 10);

    const submission = await storage.getCollaboratorSubmission(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Users can only edit their own submissions
    if (submission.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ message: "Not authorized to edit this submission" });
    }

    // Can only edit drafts
    if (submission.status !== 'draft') {
      return res.status(400).json({ message: "Can only edit draft submissions" });
    }

    const data = submissionSchema.partial().parse(req.body);

    const updatedSubmission = await storage.updateCollaboratorSubmission(submissionId, {
      ...data,
      submittedAt: data.status === 'pending' ? new Date() : submission.submittedAt,
    });

    res.json(updatedSubmission);
  } catch (error: any) {
    console.error("Error updating submission:", error);
    res.status(400).json({ message: error.message || "Failed to update submission" });
  }
});

/**
 * DELETE /api/collaborator/submissions/:id
 * Delete a submission (only if status is draft)
 */
router.delete("/collaborator/submissions/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const submissionId = parseInt(req.params.id, 10);

    const submission = await storage.getCollaboratorSubmission(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Users can only delete their own submissions
    if (submission.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ message: "Not authorized to delete this submission" });
    }

    // Can only delete drafts
    if (submission.status !== 'draft') {
      return res.status(400).json({ message: "Can only delete draft submissions" });
    }

    await storage.deleteCollaboratorSubmission(submissionId);

    res.json({ success: true, message: "Submission deleted" });
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ message: "Failed to delete submission" });
  }
});

/**
 * GET /api/admin/submissions
 * Get all submissions (filtered by status)
 * Admin/Leader only
 */
router.get("/admin/submissions", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const user = await storage.getUser(userId);

    // Check if user exists and is admin or leader
    if (!user || !user.role || !['admin', 'leader'].includes(user.role)) {
      return res.status(403).json({ message: "Admin or leader access required" });
    }

    const status = req.query.status as string || 'pending';
    const contentType = req.query.contentType as string;

    const submissions = await storage.getAllCollaboratorSubmissions({
      status: status !== 'all' ? status : undefined,
      contentType: contentType !== 'all' ? contentType : undefined,
    });

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching admin submissions:", error);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});

/**
 * POST /api/admin/submissions/:id/approve
 * Approve a submission
 * Admin/Leader only
 */
router.post("/admin/submissions/:id/approve", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const user = await storage.getUser(userId);

    // Check if user exists and is admin or leader
    if (!user || !user.role || !['admin', 'leader'].includes(user.role)) {
      return res.status(403).json({ message: "Admin or leader access required" });
    }

    const submissionId = parseInt(req.params.id, 10);
    const { scheduledDate } = reviewSchema.parse(req.body);

    const submission = await storage.getCollaboratorSubmission(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ message: "Can only approve pending submissions" });
    }

    const updatedSubmission = await storage.updateCollaboratorSubmission(submissionId, {
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy: parseInt(userId, 10),
      scheduledDate: scheduledDate || null,
    });

    res.json(updatedSubmission);
  } catch (error: any) {
    console.error("Error approving submission:", error);
    res.status(400).json({ message: error.message || "Failed to approve submission" });
  }
});

/**
 * POST /api/admin/submissions/:id/reject
 * Reject a submission
 * Admin/Leader only
 */
router.post("/admin/submissions/:id/reject", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const user = await storage.getUser(userId);

    // Check if user exists and is admin or leader
    if (!user || !user.role || !['admin', 'leader'].includes(user.role)) {
      return res.status(403).json({ message: "Admin or leader access required" });
    }

    const submissionId = parseInt(req.params.id, 10);
    const { reviewNotes } = reviewSchema.parse(req.body);

    if (!reviewNotes || !reviewNotes.trim()) {
      return res.status(400).json({ message: "Review notes are required when rejecting" });
    }

    const submission = await storage.getCollaboratorSubmission(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ message: "Can only reject pending submissions" });
    }

    const updatedSubmission = await storage.updateCollaboratorSubmission(submissionId, {
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: parseInt(userId, 10),
      reviewNotes,
    });

    res.json(updatedSubmission);
  } catch (error: any) {
    console.error("Error rejecting submission:", error);
    res.status(400).json({ message: error.message || "Failed to reject submission" });
  }
});

export default router;
