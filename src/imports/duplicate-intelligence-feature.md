Add a “Duplicate Intelligence” feature that detects exact and near-duplicate files and presents them in a controlled review experience.

This feature must prioritize safety, clarity, and reversibility. It should never auto-delete files.

Purpose

Users accumulate:

Exact duplicates (same file copied multiple times)

Versioned duplicates (v2, final, final2)

Re-encoded media (same image resized or exported differently)

Duplicate downloads

The goal is to detect and group duplicates — not remove them automatically.

Duplicate management must feel cautious, not aggressive.

Entry Point

Add a new toggle in the File Rules section:

Duplicate Detection
[ Toggle ]

Tooltip:
“Detect and group duplicate or near-duplicate files. Review before applying.”

This toggle should appear below Smart Categorization.

Preview Integration

Inside the “Preview Changes” layer:

Add a new section:

Duplicates Found (12 groups)

Each group should display as a stacked card:

Group 1

IMG_8473.jpg

IMG_8473 (1).jpg

2026-02-22_Screenshot.png

Display metadata summary:

File size

Resolution

Modified date

File type

Keep Best Logic

For each group, the system suggests:

Recommended to Keep:
IMG_8473.jpg
Reason:

Highest resolution

Original creation date

Largest file size

Use a small label:

Recommended

User must explicitly confirm.

User Controls Per Group

Provide:

[ Keep Recommended ]
[ Select Manually ]

If selecting manually:
Allow checkboxes to choose which file to keep.

Non-selected files default to:

Move to Duplicates Archive

Never default to delete.

Archive Workflow

Create a system folder:

Duplicates (Inside main destination or separate archive)

All non-kept files are moved there.

Add microcopy:

“No files will be permanently deleted.”

Confidence Indicators

For near-duplicates (not exact matches):

Display:

Similarity: 92%
Confidence: Medium

Tooltip:
“Files share visual similarity but differ in size or metadata.”

If confidence is low:
Route to Needs Review.

Post-Run Summary

After execution, Status Bar should display:

Duplicates Grouped: 12
Files Archived: 23

Include:

View Duplicate Log
Undo Last Run

Safety Guardrails

Design must include:

No automatic deletion

Archive instead of delete

Clear explanation for recommendation

Visible undo

Preview before execution

Deletion (if ever added in future versions) should be a separate, deliberate action.

Visual Tone

Duplicate review should feel:

Calm

Analytical

Structured

Conservative

Avoid:

Red danger tones unless user initiates delete

“Cleanup aggressively” language

Animated collapsing stacks

Gamified cleanup visuals

This is file management — not inbox zero.

Design Goal

Users should feel:

“This is helping me decide.”

Not:

“This is deciding for me.”