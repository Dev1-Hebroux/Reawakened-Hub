import { Router } from "express";
import { db } from "../db";
import { isAuthenticated } from "../auth";
import {
  productLaunchSessions,
  swotAnalysisData,
  gtmCanvasData,
  pricingCalculatorData,
  launchChecklistData,
  productLaunchMilestones
} from "../../shared/schema";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

// ==========================================
// PRODUCT LAUNCH SESSIONS - Main CRUD
// ==========================================

/**
 * GET /api/product-launch/sessions
 * List all product launch sessions for the current user
 */
router.get("/product-launch/sessions", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;

    const sessions = await db
      .select()
      .from(productLaunchSessions)
      .where(and(
        eq(productLaunchSessions.userId, userId),
        eq(productLaunchSessions.isArchived, false)
      ))
      .orderBy(desc(productLaunchSessions.updatedAt));

    res.json({ sessions });
  } catch (error) {
    console.error("Error fetching product launch sessions:", error);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

/**
 * POST /api/product-launch/sessions
 * Create a new product launch session
 */
router.post("/product-launch/sessions", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const { productName, productDescription, productType, prayerCommitment, scriptureAnchor, kingdomImpact } = req.body;

    const [session] = await db
      .insert(productLaunchSessions)
      .values({
        userId,
        productName: productName || "My New Venture",
        productDescription,
        productType: productType || "digital",
        prayerCommitment,
        scriptureAnchor,
        kingdomImpact,
        stage: "ideation",
      })
      .returning();

    res.status(201).json({ session });
  } catch (error) {
    console.error("Error creating product launch session:", error);
    res.status(500).json({ message: "Failed to create session" });
  }
});

/**
 * GET /api/product-launch/sessions/:id
 * Get a single session with all tool data
 */
router.get("/product-launch/sessions/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const sessionId = parseInt(req.params.id);

    // Get session
    const [session] = await db
      .select()
      .from(productLaunchSessions)
      .where(and(
        eq(productLaunchSessions.id, sessionId),
        eq(productLaunchSessions.userId, userId)
      ));

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Get all tool data in parallel
    const [swotData] = await db.select().from(swotAnalysisData).where(eq(swotAnalysisData.sessionId, sessionId));
    const [gtmData] = await db.select().from(gtmCanvasData).where(eq(gtmCanvasData.sessionId, sessionId));
    const [pricingData] = await db.select().from(pricingCalculatorData).where(eq(pricingCalculatorData.sessionId, sessionId));
    const [checklistData] = await db.select().from(launchChecklistData).where(eq(launchChecklistData.sessionId, sessionId));
    const milestones = await db.select().from(productLaunchMilestones).where(eq(productLaunchMilestones.sessionId, sessionId));

    res.json({
      session,
      tools: {
        swot: swotData || null,
        gtmCanvas: gtmData || null,
        pricing: pricingData || null,
        checklist: checklistData || null,
      },
      milestones,
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ message: "Failed to fetch session" });
  }
});

/**
 * PUT /api/product-launch/sessions/:id
 * Update session metadata
 */
router.put("/product-launch/sessions/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const sessionId = parseInt(req.params.id);
    const { productName, productDescription, productType, stage, prayerCommitment, scriptureAnchor, kingdomImpact, coverImage } = req.body;

    const [updated] = await db
      .update(productLaunchSessions)
      .set({
        productName,
        productDescription,
        productType,
        stage,
        prayerCommitment,
        scriptureAnchor,
        kingdomImpact,
        coverImage,
        updatedAt: new Date(),
      })
      .where(and(
        eq(productLaunchSessions.id, sessionId),
        eq(productLaunchSessions.userId, userId)
      ))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({ session: updated });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ message: "Failed to update session" });
  }
});

/**
 * DELETE /api/product-launch/sessions/:id
 * Archive (soft delete) a session
 */
router.delete("/product-launch/sessions/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const sessionId = parseInt(req.params.id);

    await db
      .update(productLaunchSessions)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(
        eq(productLaunchSessions.id, sessionId),
        eq(productLaunchSessions.userId, userId)
      ));

    res.json({ message: "Session archived" });
  } catch (error) {
    console.error("Error archiving session:", error);
    res.status(500).json({ message: "Failed to archive session" });
  }
});

// ==========================================
// SWOT ANALYSIS TOOL
// ==========================================

/**
 * PUT /api/product-launch/sessions/:id/swot
 * Save or update SWOT analysis data
 */
router.put("/product-launch/sessions/:id/swot", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const sessionId = parseInt(req.params.id);

    // Verify session ownership
    const [session] = await db.select().from(productLaunchSessions).where(and(
      eq(productLaunchSessions.id, sessionId),
      eq(productLaunchSessions.userId, userId)
    ));

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const { strengths, weaknesses, opportunities, threats, actionItems, prayerPoints } = req.body;

    // Check if SWOT data exists
    const [existing] = await db.select().from(swotAnalysisData).where(eq(swotAnalysisData.sessionId, sessionId));

    let result;
    if (existing) {
      [result] = await db
        .update(swotAnalysisData)
        .set({ strengths, weaknesses, opportunities, threats, actionItems, prayerPoints, updatedAt: new Date() })
        .where(eq(swotAnalysisData.sessionId, sessionId))
        .returning();
    } else {
      [result] = await db
        .insert(swotAnalysisData)
        .values({ sessionId, strengths, weaknesses, opportunities, threats, actionItems, prayerPoints })
        .returning();
    }

    // Update session timestamp
    await db.update(productLaunchSessions).set({ updatedAt: new Date() }).where(eq(productLaunchSessions.id, sessionId));

    res.json({ swot: result });
  } catch (error) {
    console.error("Error saving SWOT data:", error);
    res.status(500).json({ message: "Failed to save SWOT analysis" });
  }
});

// ==========================================
// GTM CANVAS TOOL
// ==========================================

/**
 * PUT /api/product-launch/sessions/:id/gtm-canvas
 * Save or update GTM canvas data
 */
router.put("/product-launch/sessions/:id/gtm-canvas", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const sessionId = parseInt(req.params.id);

    // Verify session ownership
    const [session] = await db.select().from(productLaunchSessions).where(and(
      eq(productLaunchSessions.id, sessionId),
      eq(productLaunchSessions.userId, userId)
    ));

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const {
      targetMarket, customerPersonas, valueProposition, competitorAnalysis,
      distributionChannels, marketingChannels, partnerships,
      positioningStatement, brandValues, messagingPillars,
      stewardshipReflection, integrityCommitment
    } = req.body;

    // Check if GTM data exists
    const [existing] = await db.select().from(gtmCanvasData).where(eq(gtmCanvasData.sessionId, sessionId));

    let result;
    if (existing) {
      [result] = await db
        .update(gtmCanvasData)
        .set({
          targetMarket, customerPersonas, valueProposition, competitorAnalysis,
          distributionChannels, marketingChannels, partnerships,
          positioningStatement, brandValues, messagingPillars,
          stewardshipReflection, integrityCommitment, updatedAt: new Date()
        })
        .where(eq(gtmCanvasData.sessionId, sessionId))
        .returning();
    } else {
      [result] = await db
        .insert(gtmCanvasData)
        .values({
          sessionId, targetMarket, customerPersonas, valueProposition, competitorAnalysis,
          distributionChannels, marketingChannels, partnerships,
          positioningStatement, brandValues, messagingPillars,
          stewardshipReflection, integrityCommitment
        })
        .returning();
    }

    // Update session timestamp
    await db.update(productLaunchSessions).set({ updatedAt: new Date() }).where(eq(productLaunchSessions.id, sessionId));

    res.json({ gtmCanvas: result });
  } catch (error) {
    console.error("Error saving GTM canvas:", error);
    res.status(500).json({ message: "Failed to save GTM canvas" });
  }
});

// ==========================================
// PRICING CALCULATOR TOOL
// ==========================================

/**
 * PUT /api/product-launch/sessions/:id/pricing
 * Save or update pricing calculator data
 */
router.put("/product-launch/sessions/:id/pricing", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const sessionId = parseInt(req.params.id);

    // Verify session ownership
    const [session] = await db.select().from(productLaunchSessions).where(and(
      eq(productLaunchSessions.id, sessionId),
      eq(productLaunchSessions.userId, userId)
    ));

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const {
      fixedCosts, variableCosts, laborCosts, totalCostPerUnit,
      pricingStrategy, targetMargin, recommendedPrice,
      competitorPrices, pricePositioning,
      generosityTier, kingdomTithe, fairPricingReflection
    } = req.body;

    // Check if pricing data exists
    const [existing] = await db.select().from(pricingCalculatorData).where(eq(pricingCalculatorData.sessionId, sessionId));

    let result;
    if (existing) {
      [result] = await db
        .update(pricingCalculatorData)
        .set({
          fixedCosts, variableCosts, laborCosts, totalCostPerUnit,
          pricingStrategy, targetMargin, recommendedPrice,
          competitorPrices, pricePositioning,
          generosityTier, kingdomTithe, fairPricingReflection, updatedAt: new Date()
        })
        .where(eq(pricingCalculatorData.sessionId, sessionId))
        .returning();
    } else {
      [result] = await db
        .insert(pricingCalculatorData)
        .values({
          sessionId, fixedCosts, variableCosts, laborCosts, totalCostPerUnit,
          pricingStrategy, targetMargin, recommendedPrice,
          competitorPrices, pricePositioning,
          generosityTier, kingdomTithe, fairPricingReflection
        })
        .returning();
    }

    // Update session timestamp
    await db.update(productLaunchSessions).set({ updatedAt: new Date() }).where(eq(productLaunchSessions.id, sessionId));

    res.json({ pricing: result });
  } catch (error) {
    console.error("Error saving pricing data:", error);
    res.status(500).json({ message: "Failed to save pricing data" });
  }
});

// ==========================================
// LAUNCH CHECKLIST TOOL
// ==========================================

/**
 * PUT /api/product-launch/sessions/:id/checklist
 * Save or update launch checklist data
 */
router.put("/product-launch/sessions/:id/checklist", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const sessionId = parseInt(req.params.id);

    // Verify session ownership
    const [session] = await db.select().from(productLaunchSessions).where(and(
      eq(productLaunchSessions.id, sessionId),
      eq(productLaunchSessions.userId, userId)
    ));

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const {
      launchDate, preLaunchTasks, launchDayTasks, postLaunchTasks,
      dedicationPrayer, mentorBlessing, communitySupport, launchDayPrayer, gratitudeLog,
      accountabilityPartner, weeklyCheckIn
    } = req.body;

    // Check if checklist data exists
    const [existing] = await db.select().from(launchChecklistData).where(eq(launchChecklistData.sessionId, sessionId));

    let result;
    if (existing) {
      [result] = await db
        .update(launchChecklistData)
        .set({
          launchDate, preLaunchTasks, launchDayTasks, postLaunchTasks,
          dedicationPrayer, mentorBlessing, communitySupport, launchDayPrayer, gratitudeLog,
          accountabilityPartner, weeklyCheckIn, updatedAt: new Date()
        })
        .where(eq(launchChecklistData.sessionId, sessionId))
        .returning();
    } else {
      [result] = await db
        .insert(launchChecklistData)
        .values({
          sessionId, launchDate, preLaunchTasks, launchDayTasks, postLaunchTasks,
          dedicationPrayer, mentorBlessing, communitySupport, launchDayPrayer, gratitudeLog,
          accountabilityPartner, weeklyCheckIn
        })
        .returning();
    }

    // Update session timestamp
    await db.update(productLaunchSessions).set({ updatedAt: new Date() }).where(eq(productLaunchSessions.id, sessionId));

    res.json({ checklist: result });
  } catch (error) {
    console.error("Error saving checklist:", error);
    res.status(500).json({ message: "Failed to save checklist" });
  }
});

// ==========================================
// MILESTONES
// ==========================================

/**
 * POST /api/product-launch/sessions/:id/milestones
 * Add a milestone
 */
router.post("/product-launch/sessions/:id/milestones", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const sessionId = parseInt(req.params.id);

    // Verify session ownership
    const [session] = await db.select().from(productLaunchSessions).where(and(
      eq(productLaunchSessions.id, sessionId),
      eq(productLaunchSessions.userId, userId)
    ));

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const { title, description, targetDate, celebrationNote } = req.body;

    const [milestone] = await db
      .insert(productLaunchMilestones)
      .values({ sessionId, title, description, targetDate, celebrationNote })
      .returning();

    res.status(201).json({ milestone });
  } catch (error) {
    console.error("Error creating milestone:", error);
    res.status(500).json({ message: "Failed to create milestone" });
  }
});

/**
 * PUT /api/product-launch/milestones/:id/complete
 * Mark a milestone as completed
 */
router.put("/product-launch/milestones/:id/complete", isAuthenticated, async (req: any, res) => {
  try {
    const milestoneId = parseInt(req.params.id);
    const { celebrationNote } = req.body;

    const [milestone] = await db
      .update(productLaunchMilestones)
      .set({ completedAt: new Date(), celebrationNote })
      .where(eq(productLaunchMilestones.id, milestoneId))
      .returning();

    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    res.json({ milestone });
  } catch (error) {
    console.error("Error completing milestone:", error);
    res.status(500).json({ message: "Failed to complete milestone" });
  }
});

export default router;
