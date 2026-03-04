Add an optional “Natural Language Rule Builder” feature that allows users to describe file organization rules in plain English. This feature must feel advanced, controlled, and secondary to the main flow.

It should not dominate the interface.

Purpose

Power users often want more nuanced logic:

“Move screenshots older than 30 days to Archive.”

“Put all invoices into Finance.”

“Anything with ‘v2’ in the filename goes to Old Versions.”

“Move large video files over 2GB to External Drive.”

Instead of forcing manual rule configuration, allow users to describe the rule conversationally and convert it into structured logic.

This is an enhancement — not a replacement for the core rule system.

Entry Point

Do NOT place this on the main screen.

Add a subtle secondary button:

“Advanced Rules”
or
“Describe a Rule”

Placement options:

In Settings

Beneath File Rules section

Inside a collapsible Advanced panel

Tooltip:
“Create custom rules using plain language.”

UI Layout

When activated, open a centered modal or right-side panel:

Title:
Create Rule

Input Field:
A large single text input area with placeholder text:

“Describe what you’d like to organize…”

Example suggestions (faded beneath input):

Move screenshots older than 30 days to Archive

Put invoices into Finance

Group design exports into a Design folder

Below input:
[ Generate Rule ] button

AI Conversion Output

After clicking Generate Rule:

Display a structured rule preview:

Rule Summary:
Move files where:

File Type = Image

Subtype = Screenshot

Date Modified > 30 days

Destination:
Archive

User can edit conditions using dropdown controls.

Edit & Confirm Controls

Below rule preview:

[ Edit Conditions ]
[ Cancel ]
[ Save Rule ]

Saving adds it to the existing rule list.

Guardrails

Must include:

Preview before execution

No immediate action

User review of generated logic

Editable conditions

Ability to disable rule

Add microcopy:

“Rules are suggestions. Review before applying.”

Visual Tone

This feature should feel:

Calm

Structured

Controlled

Utility-focused

Avoid:

Chat bubbles

AI mascot

Conversational chat UI

Animated typing indicators

This is rule translation — not a chatbot.

Placement Strategy

Make this visually secondary:

Smaller button

Subtle color

Inside collapsible panel

It should signal:

“Advanced power feature.”

Not:

“This app is an AI chat tool.”

Design Goal

Users should feel:

“I can describe what I want without learning rule syntax.”

Not:

“I’m talking to an AI assistant.”