# Database Schema for JustDoTheThing

This document outlines the database schema for the productivity app, detailing the tables, their fields, and relationships. The schema is designed to support user management, activity tracking, AI-driven insights, and task management while prioritizing privacy and data normalization.

## Users
Stores minimal user information, with user authentication managed by Supabase Auth.

| Field       | Type    | Description                                                                 |
|-------------|---------|-----------------------------------------------------------------------------|
| `id`        | UUID    | Primary key, synced with Supabase Auth.                                     |
| `settings`  | JSON    | User preferences (e.g., `{"yell_style": "stern"}`).                         |

---

## Screenshots
Stores metadata from screenshots for activity classification and clustering.

| Field           | Type       | Description                                                                 |
|-----------------|------------|-----------------------------------------------------------------------------|
| `id`            | Integer    | Primary key, auto-incrementing.                                             |
| `user_id`       | UUID       | Foreign key linking to `users.id`.                                          |
| `timestamp`     | Datetime   | Date and time the screenshot was captured.                                  |
| `hash`          | Varchar    | Perceptual hash for similarity checks.                                      |
| `classification`| Varchar    | Label from AI model (e.g., "work", "non-work").                             |
| `confidence`    | Float      | Confidence score from the AI model (e.g., 0.85).                            |

**Relationships**:
- `user_id` → `users.id`

---

## Yells
Records yelling events triggered by inactivity or non-work behavior.

| Field           | Type       | Description                                                                 |
|-----------------|------------|-----------------------------------------------------------------------------|
| `id`            | Integer    | Primary key, auto-incrementing.                                             |
| `user_id`       | UUID       | Foreign key linking to `users.id`.                                          |
| `screenshot_id` | Integer    | Foreign key linking to `screenshots.id` (nullable).                         |
| `timestamp`     | Datetime   | Date and time the yell was triggered.                                       |
| `style`         | Varchar    | Yelling style (e.g., "cheerful", "stern").                                  |
| `audio_file`    | Varchar    | Reference to the audio file (nullable).                                     |

**Relationships**:
- `user_id` → `users.id`
- `screenshot_id` → `screenshots.id` (if tied to a screenshot)

---

## Transcriptions
Stores transcribed speech from Yap Mode.

| Field       | Type       | Description                                                                 |
|-------------|------------|-----------------------------------------------------------------------------|
| `id`        | Integer    | Primary key, auto-incrementing.                                             |
| `user_id`   | UUID       | Foreign key linking to `users.id`.                                          |
| `timestamp` | Datetime   | Date and time the transcription was created.                                |
| `text`      | Text       | Transcribed speech content.                                                 |

**Relationships**:
- `user_id` → `users.id`

---

## Tasks
Stores tasks extracted from transcriptions in Yap Mode.

| Field             | Type       | Description                                                                 |
|-------------------|------------|-----------------------------------------------------------------------------|
| `id`              | Integer    | Primary key, auto-incrementing.                                             |
| `transcription_id`| Integer    | Foreign key linking to `transcriptions.id`.                                 |
| `title`           | Varchar    | Short title of the task.                                                    |
| `description`     | Text       | Detailed description of the task.                                           |
| `priority`        | Varchar    | Priority level (e.g., "high", "medium", "low").                             |
| `category`        | Varchar    | Category (e.g., "work", "personal").                                        |

**Relationships**:
- `transcription_id` → `transcriptions.id`

---

## Summaries
Stores summaries generated from transcriptions when no tasks are extracted.

| Field             | Type       | Description                                                                 |
|-------------------|------------|-----------------------------------------------------------------------------|
| `id`              | Integer    | Primary key, auto-incrementing.                                             |
| `transcription_id`| Integer    | Foreign key linking to `transcriptions.id`.                                 |
| `summary_text`    | Text       | Condensed summary of the transcription.                                     |

**Relationships**:
- `transcription_id` → `transcriptions.id`

---

## Suggestions
Stores AI-generated suggestions (e.g., tools, resources) linked to tasks or transcriptions.

| Field              | Type       | Description                                                                 |
|--------------------|------------|-----------------------------------------------------------------------------|
| `id`               | Integer    | Primary key, auto-incrementing.                                             |
| `type`             | Varchar    | Type of suggestion (e.g., "tool", "resource").                              |
| `task_id`          | Integer    | Foreign key linking to `tasks.id` (nullable).                               |
| `transcription_id` | Integer    | Foreign key linking to `transcriptions.id` (nullable).                      |
| `suggestion_text`  | Text       | Text of the suggestion (e.g., "Try Trello for task management").            |

**Relationships**:
- `task_id` → `tasks.id` (if tied to a task)
- `transcription_id` → `transcriptions.id` (if tied to a transcription)

---

## Insights
Stores derived productivity insights with a flexible structure for future expansion.

| Field       | Type       | Description                                                                 |
|-------------|------------|-----------------------------------------------------------------------------|
| `id`        | Integer    | Primary key, auto-incrementing.                                             |
| `user_id`   | UUID       | Foreign key linking to `users.id`.                                          |
| `type`      | Varchar    | Type of insight (e.g., "focus_hours", "distraction_patterns").              |
| `data`      | JSON       | Structured data for the insight (e.g., `{"focus_hours": 3.5}`).             |

**Relationships**:
- `user_id` → `users.id`

---

## Clusters
Groups related screenshots for productivity analysis in Flow Mode.

| Field         | Type       | Description                                                                 |
|---------------|------------|-----------------------------------------------------------------------------|
| `id`          | Integer    | Primary key, auto-incrementing.                                             |
| `user_id`     | UUID       | Foreign key linking to `users.id`.                                          |
| `cluster_id`  | Integer    | Identifier for the cluster group.                                           |
| `screenshot_id`| Integer   | Foreign key linking to `screenshots.id`.                                    |

**Relationships**:
- `user_id` → `users.id`
- `screenshot_id` → `screenshots.id`

---

This schema is normalized and optimized for the app’s needs, ensuring no duplication of data through the use of foreign keys. Each table serves a clear purpose, supporting the app’s modes while prioritizing user privacy by storing only metadata. Let me know if you’d like further adjustments or clarifications!