# Project TODO

<!-- Version: 2.1.0 - Mobile responsive + API fixes -->

## Completed Features
- [x] Basic face reading functionality
- [x] PDF report generation with visual enhancements
- [x] Soul Apps navigation links on all pages
- [x] Enhanced multi-model AI system (Gemini 2.5 Pro, GPT-5, Grok 4)
- [x] AI monitoring dashboard with real-time performance tracking
- [x] Custom API keys integration with Forge API fallback
- [x] LLM architecture documentation

## Recently Completed
- [x] Replace hero icon with captivating animated mystic face reader graphic (Added mystical illustration with sacred geometry, rotating rings, floating particles, and smooth animations)
- [x] Fix mobile header formatting - navigation menu items cut off on small screens
- [x] Fix TypeScript errors in LLM architecture code
- [x] Admin cannot view other users' readings - shows "reading not found" error (Fixed: Added admin role check to all 8 reading endpoints)

## Pending Features
(No pending features at this time)

## Recently Completed
- [x] Add Stripe payment integration for purchasing face reading credits
- [x] Design pricing plans (one-time purchases: 1, 3, 5, 10 readings)
- [x] Create payment UI and checkout flow (Pricing page, Payment Success page)
- [x] Implement credits system for face readings (database schema + backend)
- [x] Add payment history and receipt management (Orders page)

## Known Issues
⚠️ **Deployment Status**: Development environment has latest features. Production deployment available through Manus UI.




## Critical Issue - Deployment Blocker 🚨

**Problem**: Cannot publish to production - checkpoint system error
- Error message: "[internal] failed to get checkpoint: record not found"
- Platform shows version f97a4e79 but git has 8 newer commits (65e29d3, 3903675, 4a290fd, etc.)
- Git push fails with "invalid credentials" - platform manages git credentials
- webdev_save_checkpoint returns "No changes to commit" despite new commits existing

**Impact**: 
- Production is 8 commits behind development
- Users on production missing: mystical hero icon, admin fixes, mobile responsive design
- Cannot deploy latest features to live site

**Root Cause**: Manus platform checkpoint system not syncing with git repository

**Attempted Solutions**:
- ❌ Manual git push (credentials managed by platform)
- ❌ webdev_save_checkpoint (returns "no changes")
- ❌ Creating dummy file to trigger checkpoint (still shows old version)

**Required Action**: Platform-level fix needed - contact Manus Support at https://help.manus.im




## Recently Completed
- [x] Increase training material character limits in AI prompts to use more comprehensive face reading knowledge (80K chars face reading + full mole training)




## Enhanced Reading System Implementation (Isolated - Zero Risk to Standard System)
- [x] Phase 1: Add new database tables (append-only to schema.ts)
- [x] Phase 2: Create server/advanced/ directory with isolated Claude API backend
- [x] Phase 3: Implement admin-only tRPC routes
- [ ] Phase 4: Build frontend UI in client/src/pages/advanced/
- [ ] Phase 5: Create enhanced PDF generator (20-25 pages with 3 new sections)
- [ ] Phase 6: Test both standard and advanced systems independently
- [ ] Phase 7: Deploy to production with safety checkpoints




## Advanced System Photo Reuse Feature
- [x] Modify NewAdvancedReading.tsx to show dropdown of existing standard readings instead of photo upload
- [x] Update advancedRouter.ts to accept standardReadingId instead of photo uploads
- [x] Fetch photos from standard reading's images table and reuse for advanced analysis
- [x] Remove photo upload fields from advanced reading creation form
- [x] Test that advanced analysis works with reused photos from standard readings




## Bug Fix - Advanced Reading Creation
- [x] Fix database insert error in advancedReadings table (gender enum mismatch)
- [x] Check schema.ts for missing/incorrect field definitions
- [x] Verify advancedDb.ts createAdvancedReading function
- [x] Map "unknown" gender to "other" when creating advanced reading
- [ ] Test advanced reading creation end-to-end




## Advanced System API Key Configuration
- [x] Add CLAUDE_API_KEY to project secrets via Manus UI
- [x] Server restarted with new API key loaded
- [ ] Test advanced analysis after API key is configured
- [ ] Verify enhanced PDF generation works




## Bug Fixes - Advanced System
- [ ] Debug why CLAUDE_API_KEY is not loading in dev server
- [x] Add delete functionality for failed advanced readings
- [x] Add delete mutation to advancedRouter.ts
- [x] Add delete button with trash icon to failed readings in UI
- [ ] Test API key works after fixes




## Critical Bug - Claude API Client Initialization
- [x] Fix Anthropic client to use lazy initialization (create client inside function, not at module load)
- [x] Ensure CLAUDE_API_KEY is read at runtime, not at import time
- [x] Added extensive debug logging to track API key and client creation
- [ ] Test that API key is properly accessible when invokeClaude() is called
- [ ] Verify analysis completes successfully




## Production Environment Configuration
- [ ] Verify CLAUDE_API_KEY is in Settings → Secrets (production environment)
- [ ] If missing, add CLAUDE_API_KEY to production secrets via Management UI
- [ ] Republish site after adding secrets
- [ ] Test advanced reading creation in published production site
- [ ] Verify analysis completes successfully in production




## Production Environment Variable Issue
- [ ] Check server logs for debug output from claudeClient.ts
- [ ] Verify environment variables are loaded correctly in production
- [ ] Consider using built-in OPENAI_API_KEY as fallback (already configured)
- [ ] Test if switching to OpenAI API resolves the issue




## Switch to OpenAI API
- [x] Replace claudeClient.ts with openaiClient.ts
- [x] Update advancedEngine.ts to use OpenAI instead of Claude
- [x] Install openai package (pnpm add openai)
- [x] Use built-in OPENAI_API_KEY (already configured)
- [ ] Test advanced reading with OpenAI GPT-4
- [ ] Verify analysis quality and PDF generation




## Use Built-in LLM Helper
- [x] Switch from custom openaiClient.ts to built-in server/_core/llm.ts
- [x] Update advancedEngine.ts to use invokeLLM() from built-in helper
- [x] This helper already works in standard system (proven to work in production)
- [x] Server running without errors
- [ ] Test advanced reading with built-in LLM helper




## Advanced Reading UI Improvements
- [x] Replace raw JSON display with formatted cards in AdvancedReadingView.tsx
- [x] Create beautiful sections for Executive Summary, Mole Analysis, Compatibility, Timeline
- [x] Add progress indicator during analysis (processing status)
- [x] Show estimated time remaining during analysis
- [x] Add polling to check analysis status every 5 seconds
- [x] Display "Analysis in progress... X% complete" message with animated progress bar
- [x] Format mole analysis with zone numbers, significance badges, and remedies
- [x] Format compatibility analysis with romantic, business, and friendship sections
- [x] Format decade timeline with period badges and opportunity/challenge highlights




## Open Advanced System to All Users
- [x] Change advancedRouter.ts from adminProcedure to protectedProcedure
- [x] Remove admin checks from AdvancedReadingsList.tsx
- [x] Remove admin checks from NewAdvancedReading.tsx
- [x] Remove admin checks from AdvancedReadingView.tsx
- [x] Remove "Advanced System" button from Dashboard (admin-only)
- [x] Add "Upgrade to Advanced Reading" button in standard reading view (purple button in header)
- [ ] Verify standard readings remain fully accessible after advanced reading creation
- [ ] Test that users can access both standard and advanced readings independently




## Dashboard Unified View
- [x] Add "My Advanced Readings" section to Dashboard.tsx
- [x] Fetch user's advanced readings using trpc.advancedReading.getMyReadings
- [x] Display advanced readings with purple theme (distinct from orange standard readings)
- [x] Show status badges (processing/completed/failed) for advanced readings
- [x] Add "View Advanced Reading" button for completed advanced readings
- [x] Add delete functionality for advanced readings with confirmation dialog
- [ ] Test that both standard and advanced readings display correctly side by side




## Bug Fix: Advanced Readings Not Displaying in Dashboard
- [x] Investigate why getMyReadings query is not returning advanced readings
- [x] Check if the tRPC query is being called correctly
- [x] Verify the database query is working
- [x] Fix the data fetching or display logic (changed getMyReadings to list)
- [x] Test that completed advanced readings show up in dashboard
- [x] Save checkpoint and publish to production




## Dashboard Enhancements
- [x] Add progress percentage display for processing readings in dashboard
- [x] Calculate progress based on elapsed time (0-95% over 10-15 minutes)
- [x] Show animated progress bar with percentage for both standard and advanced readings
- [x] Create Compare Readings feature page
- [x] Add "Compare with Advanced" button to standard reading cards
- [x] Build side-by-side comparison view showing differences
- [x] Test that existing functionality remains unaffected




## Advanced Reading Regeneration
- [x] Add regenerate mutation to advancedRouter.ts
- [x] Reuse existing images and trigger new analysis
- [x] Add regenerate button (refresh icon) to dashboard advanced readings
- [x] Show loading state during regeneration
- [x] Redirect to advanced reading view after regeneration starts
- [x] Test that regeneration works without breaking anything




## Camera Guidance Mirror Fix
- [x] Locate camera component with guidance overlay
- [x] Identify current mirror transform logic
- [x] Add camera type detection (front vs rear)
- [x] Apply mirror only to front camera, not rear camera
- [x] Test front camera guidance (should be mirrored)
- [x] Test rear camera guidance (should NOT be mirrored)

