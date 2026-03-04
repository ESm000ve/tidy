Add a “Smart Categorization” feature that enhances existing file organization logic by grouping files based on content type, not just extension.

This feature must build on the current deterministic structure and integrate into the existing Preview flow.

Purpose

The app currently organizes files by:

Top-level category (Documents, Images, Audio, Video)
→ Subfolders by extension (.jpg, .png, .pdf, .mp3)

Smart Categorization extends this by detecting meaningful subtypes based on file content.

Example:

Instead of:
Images
→ .jpg
→ .png

It becomes:

Images
→ Screenshots
→ Photos
→ Scans
→ Designs

The goal is to make organization feel intelligent without becoming unpredictable.

Entry Point

Within each File Rule section (e.g., Images), add:

Smart Categorization
[ Toggle ]

Tooltip:
“Group files by detected content type (e.g., Screenshots, Photos, Scans). Preview before applying.”

This toggle should sit beneath “Create Subfolders” to indicate it enhances subfolder logic.

UI Behavior When Enabled

When Smart Categorization is ON:

The subfolder preview dynamically changes.

Example (Images rule expanded):

Images

Screenshots

Photos

Scans

Designs

Other

If OFF:

Images

.jpg

.png

.gif

etc.

The interface should visually show this difference before execution.

Preview Integration

Inside the Preview Changes layer:

Add a new column:

Detected Type

Example rows:

IMG_8372.png
→ Images / Screenshots
Source: AI
Confidence: High

Scan_2026_Invoice.pdf
→ Documents / Scans
Source: AI
Confidence: Medium

Files flagged with medium/low confidence should route to:

Needs Review

Confidence Handling

Use the same confidence system as Preview:

High (green)
Medium (yellow)
Low (red → review bucket)

Hover tooltip:
“Detected screen resolution and macOS screenshot metadata.”
“Detected camera metadata (EXIF).”
“Detected flatbed scan characteristics.”

Keep explanations short and human-readable.

Safety Rules

Smart Categorization must:

Never override top-level categories

Only affect subfolder structure

Always appear in Preview before execution

Route uncertain files to Review

Allow manual reassignment

Interaction Controls

Inside Preview:

For each file:

[ Change Category ] dropdown
User can override detected subtype.

At top of Preview:

“Disable Smart Categorization for this run” (secondary action)

Visual Tone

Must feel:

Calm

Controlled

macOS-native

Structured

Predictable

Avoid:

AI sparkle overload

Animated scanning graphics

Complex tagging systems

Auto-creation of dozens of folders

This should feel like:
“Finder, but more aware.”

Design Goal

When users see subfolders like:

Images
→ Screenshots
→ Photos

They should think:

“That makes sense.”

Not:

“Where did this new folder come from?”