# Database Schema Documentation

This document provides a detailed overview of the database schema.

**Note:** Row Level Security (RLS) is disabled for all tables.

---

## Tables

### `achievement_definitions`

Stores the definitions for all available achievements.

| Column          | Type                        | Constraints                               | Description                                 |
| --------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`            | `text`                      | `NOT NULL`, `PRIMARY KEY`                 | Unique identifier for the achievement.      |
| `name`          | `text`                      | `NOT NULL`                                | Name of the achievement.                    |
| `description`   | `text`                      | `NULL`                                    | Description of the achievement.             |
| `points_reward` | `integer`                   | `DEFAULT 10`                              | Points awarded for completing the achievement. |
| `category`      | `text`                      | `DEFAULT 'milestone'::text`               | Category of the achievement.                |
| `target`        | `integer`                   | `DEFAULT 1`                               | The target value to complete the achievement. |
| `icon`          | `text`                      | `NULL`                                    | URL or identifier for an icon.              |
| `created_at`    | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |

---

### `activities`

Tracks user activities or tasks.

| Column         | Type                        | Constraints                               | Description                                 |
| -------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`           | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the activity.         |
| `user_id`      | `uuid`                      | `FOREIGN KEY` -> `users(id)`              | The user associated with the activity.      |
| `title`        | `text`                      | `NOT NULL`                                | Title of the activity.                      |
| `description`  | `text`                      | `NULL`                                    | Detailed description of the activity.       |
| `status`       | `text`                      | `DEFAULT 'pending'::text`, `CHECK`        | Status: `pending`, `completed`, `cancelled`. |
| `priority`     | `integer`                   | `DEFAULT 1`, `CHECK`                      | Priority: 1, 2, or 3.                       |
| `due_date`     | `date`                      | `NULL`                                    | Due date for the activity.                  |
| `completed_at` | `timestamp with time zone`  | `NULL`                                    | Timestamp when the activity was completed.  |
| `created_at`   | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`   | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |

**Indexes:**
- `idx_activities_user_id` on `(user_id)`
- `idx_activities_status` on `(status)`
- `idx_activities_due_date` on `(due_date)`
- `idx_activities_priority` on `(priority)`

**Triggers:**
- `update_activities_updated_at`: Updates `updated_at` on row modification.

---

### `anti_todo_items`

Represents items in a user's "anti-todo" list, which are tasks to avoid.

| Column         | Type                        | Constraints                               | Description                                 |
| -------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`           | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the item.             |
| `list_id`      | `uuid`                      | `FOREIGN KEY` -> `anti_todo_lists(id)`    | The list this item belongs to.              |
| `user_id`      | `uuid`                      | `FOREIGN KEY` -> `users(id)`              | The user who owns this item.                |
| `content`      | `text`                      | `NOT NULL`                                | The content of the anti-todo item.          |
| `is_completed` | `boolean`                   | `DEFAULT false`                           | Whether the user succeeded in avoiding the task. |
| `completed_at` | `timestamp with time zone`  | `NULL`                                    | Timestamp of completion.                    |
| `created_at`   | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`   | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |
| `status`       | `text`                      | `DEFAULT 'not started'::text`, `CHECK`    | Status: `not started`, `ongoing`, `completed`, `stopped`. |
| `source`       | `text`                      | `DEFAULT 'user'::text`                    | Source of the item (e.g., 'user', 'ai').    |

**Indexes:**
- `idx_anti_todo_items_list_id` on `(list_id)`
- `idx_anti_todo_items_user_id` on `(user_id)`
- `idx_anti_todo_items_completed` on `(is_completed)`
- `idx_anti_todo_items_user_status` on `(user_id, status, created_at DESC)`
- `idx_anti_todo_items_source_status` on `(user_id, source, status)`
- `idx_anti_todo_items_status` on `(status)`

**Triggers:**
- `update_anti_todo_items_updated_at`: Updates `updated_at` on row modification.

---

### `anti_todo_lists`

Represents a collection of "anti-todo" items for a user.

| Column        | Type                        | Constraints                               | Description                                 |
| ------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`          | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the list.             |
| `user_id`     | `uuid`                      | `FOREIGN KEY` -> `users(id)`              | The user who owns this list.                |
| `title`       | `text`                      | `NOT NULL`                                | The title of the list.                      |
| `description` | `text`                      | `NULL`                                    | A description of the list.                  |
| `category`    | `text`                      | `NULL`                                    | Category for the list.                      |
| `is_archived` | `boolean`                   | `DEFAULT false`                           | Whether the list is archived.               |
| `created_at`  | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`  | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |

**Indexes:**
- `idx_anti_todo_lists_user_id` on `(user_id)`
- `idx_anti_todo_lists_archived` on `(is_archived)`

**Triggers:**
- `update_anti_todo_lists_updated_at`: Updates `updated_at` on row modification.

---

### `checkins`

Stores daily user check-ins, including mood and other metrics.

| Column            | Type                        | Constraints                               | Description                                 |
| ----------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`              | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the check-in.         |
| `user_id`         | `uuid`                      | `FOREIGN KEY` -> `users(id)`              | The user performing the check-in.           |
| `mood_score`      | `integer`                   | `NOT NULL`, `CHECK`                       | Mood score from 1 to 10.                    |
| `mood_text`       | `text`                      | `NULL`                                    | User's description of their mood.           |
| `mood_emoji`      | `text`                      | `DEFAULT ''::text`                        | Emoji representing the mood.                |
| `hashtags`        | `text`                      | `NULL`                                    | Hashtags associated with the check-in.      |
| `ai_score`        | `real`                      | `DEFAULT 0`                               | AI-calculated score for the check-in.       |
| `sentiment_score` | `real`                      | `DEFAULT 0`                               | Sentiment analysis score.                   |
| `checkin_date`    | `date`                      | `DEFAULT CURRENT_DATE`                    | The date of the check-in.                   |
| `checkin_time`    | `time without time zone`    | `DEFAULT CURRENT_TIME`                    | The time of the check-in.                   |
| `created_at`      | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`      | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |

**Indexes:**
- `idx_checkins_user_id` on `(user_id)`
- `idx_checkins_date` on `(checkin_date)`
- `idx_checkins_user_date` on `(user_id, checkin_date)`
- `idx_checkins_created_at` on `(created_at)`
- `idx_checkins_mood_score` on `(mood_score)`

**Triggers:**
- `ensure_user_before_checkin`: Ensures a user exists before inserting a check-in.
- `trigger_update_analytics_after_checkin`: Updates user analytics after a check-in.
- `update_checkins_updated_at`: Updates `updated_at` on row modification.

---

### `community_likes`

Tracks likes on community posts.

| Column       | Type                        | Constraints                               | Description                                 |
| ------------ | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`         | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the like.             |
| `user_id`    | `uuid`                      | `NOT NULL`, `FOREIGN KEY` -> `users(id)`  | The user who liked the post.                |
| `post_id`    | `uuid`                      | `NOT NULL`, `FOREIGN KEY` -> `community_posts(id)` | The post that was liked.                    |
| `created_at` | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of when the like occurred.        |

**Constraints:**
- `community_likes_user_post_unique` on `(user_id, post_id)`

**Indexes:**
- `idx_community_likes_user_id` on `(user_id)`
- `idx_community_likes_post_id` on `(post_id)`
- `idx_community_likes_created_at` on `(created_at)`

---

### `community_posts`

Stores posts made by users in the community feed.

| Column         | Type                        | Constraints                               | Description                                 |
| -------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`           | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the post.             |
| `user_id`      | `uuid`                      | `NOT NULL`, `FOREIGN KEY` -> `users(id)`  | The user who created the post.              |
| `content_type` | `text`                      | `NOT NULL`, `DEFAULT 'text'::text`, `CHECK` | Type: `text`, `image`, `anti_todo`, `checkin`. |
| `title`        | `text`                      | `NULL`                                    | Title of the post.                          |
| `content`      | `text`                      | `NOT NULL`                                | The main content of the post.               |
| `media_url`    | `text`                      | `NULL`                                    | URL for associated media (e.g., images).    |
| `source_type`  | `text`                      | `NULL`, `CHECK`                           | Source: `anti_todo`, `checkin`, `manual`.   |
| `source_id`    | `uuid`                      | `NULL`                                    | ID of the source item (e.g., a check-in ID). |
| `hashtags`     | `text[]`                    | `NULL`                                    | Array of hashtags for the post.             |
| `is_public`    | `boolean`                   | `DEFAULT true`                            | Whether the post is public.                 |
| `created_at`   | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`   | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |

**Indexes:**
- `idx_community_posts_user_id` on `(user_id)`
- `idx_community_posts_created_at` on `(created_at DESC)`
- `idx_community_posts_public` on `(is_public)`
- `idx_community_posts_source` on `(source_type, source_id)`
- `idx_community_posts_hashtags` on `(hashtags)` (GIN)
- `idx_community_posts_user_public_created` on `(user_id, is_public, created_at DESC)`
- `idx_community_posts_created_at_desc` on `(created_at DESC)`

**Triggers:**
- `update_community_posts_updated_at`: Updates `updated_at` on row modification.

---

### `landing_page_views`

Tracks views of the landing page for analytics.

| Column       | Type                        | Constraints                               | Description                                 |
| ------------ | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`         | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the view.             |
| `page_path`  | `text`                      | `NULL`                                    | The path of the page viewed.                |
| `user_agent` | `text`                      | `NULL`                                    | The user agent of the visitor.              |
| `referrer`   | `text`                      | `NULL`                                    | The referrer URL.                           |
| `ip_address` | `inet`                      | `NULL`                                    | The IP address of the visitor.              |
| `country`    | `text`                      | `NULL`                                    | The country of the visitor.                 |
| `created_at` | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the view.                      |

**Indexes:**
- `idx_landing_page_views_created_at` on `(created_at)`

---

### `notifications`

Stores notifications for users.

| Column      | Type                        | Constraints                               | Description                                 |
| ----------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`        | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the notification.     |
| `user_id`   | `uuid`                      | `FOREIGN KEY` -> `users(id)`              | The user receiving the notification.        |
| `title`     | `text`                      | `NOT NULL`                                | The title of the notification.              |
| `message`   | `text`                      | `NOT NULL`                                | The message content.                        |
| `type`      | `text`                      | `DEFAULT 'info'::text`, `CHECK`           | Type: `info`, `success`, `warning`, `error`, `daily_nudge`, `weekly_insights`, `achievement`, `missed_checkin`. |
| `priority`  | `text`                      | `DEFAULT 'normal'::text`, `CHECK`         | Priority: `low`, `normal`, `high`.          |
| `read`      | `boolean`                   | `DEFAULT false`                           | Whether the notification has been read.     |
| `dismissed` | `boolean`                   | `DEFAULT false`                           | Whether the notification has been dismissed. |
| `data`      | `jsonb`                     | `NULL`                                    | Additional data associated with the notification. |
| `expires_at`| `timestamp with time zone`  | `NULL`                                    | When the notification expires.              |
| `created_at`| `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`| `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |

**Indexes:**
- `idx_notifications_user_id` on `(user_id)`
- `idx_notifications_read` on `(read)`
- `idx_notifications_type` on `(type)`
- `idx_notifications_expires_at` on `(expires_at)`

**Triggers:**
- `update_notifications_updated_at`: Updates `updated_at` on row modification.

---

### `plant_care_actions`

Logs care actions performed by users on their plants.

| Column      | Type                        | Constraints                               | Description                                 |
| ----------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`        | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the action.           |
| `user_id`   | `uuid`                      | `NOT NULL`, `FOREIGN KEY` -> `users(id)`  | The user who performed the action.          |
| `plant_id`  | `uuid`                      | `NOT NULL`, `FOREIGN KEY` -> `user_plants(id)` | The plant that received care.               |
| `action_type`| `text`                     | `NOT NULL`, `CHECK`                       | Type: `water`, `fertilize`, `super_fertilize`. |
| `created_at`| `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the action.                    |

**Indexes:**
- `idx_plant_care_actions_user_id` on `(user_id)`
- `idx_plant_care_actions_action_type` on `(action_type)`

---

### `plant_history`

Stores a history of users' fully grown plants.

| Column               | Type                        | Constraints                               | Description                                 |
| -------------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`                 | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the history entry.    |
| `user_id`            | `uuid`                      | `NOT NULL`, `FOREIGN KEY` -> `users(id)`  | The user who grew the plant.                |
| `plant_name`         | `text`                      | `NOT NULL`                                | The name of the plant.                      |
| `plant_type`         | `text`                      | `NOT NULL`                                | The type of the plant.                      |
| `final_growth_level` | `integer`                   | `NOT NULL`                                | The final growth level achieved.            |
| `final_decorations`  | `jsonb`                     | `DEFAULT '[]'::jsonb`                     | Final decorations applied to the plant.     |
| `completion_date`    | `timestamp with time zone`  | `DEFAULT now()`                           | The date the plant was completed.           |
| `growth_duration`    | `interval`                  | `NULL`                                    | The total time it took to grow the plant.   |
| `total_care_actions` | `integer`                   | `DEFAULT 0`                               | Total number of care actions performed.     |
| `plant_image_url`    | `text`                      | `NULL`                                    | URL of the final plant image.               |
| `created_at`         | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |

**Indexes:**
- `idx_plant_history_user_id` on `(user_id)`

---

### `plant_store_items`

Defines items available for purchase in the plant store.

| Column      | Type                        | Constraints                               | Description                                 |
| ----------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`        | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the store item.       |
| `name`      | `text`                      | `NOT NULL`, `UNIQUE`                      | The name of the item.                       |
| `description`| `text`                     | `NULL`                                    | A description of the item.                  |
| `price`     | `integer`                   | `NOT NULL`                                | The price of the item in points.            |
| `item_type` | `text`                      | `NULL`, `CHECK`                           | Type: `water`, `fertilizer`, `super_fertilizer`. |
| `xp_gain`   | `integer`                   | `NOT NULL`                                | XP gained by the user upon purchase/use.    |
| `created_at`| `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `rarity`    | `text`                      | `DEFAULT 'common'::text`                  | The rarity of the item.                     |
| `xp_bonus`  | `integer`                   | `DEFAULT 0`                               | Bonus XP provided by the item.              |

---

### `point_transactions`

Logs all point transactions (earned and spent) for users.

| Column           | Type                        | Constraints                               | Description                                 |
| ---------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`             | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the transaction.      |
| `user_id`        | `uuid`                      | `FOREIGN KEY` -> `users(id)`              | The user involved in the transaction.       |
| `points`         | `integer`                   | `NOT NULL`                                | The number of points in the transaction.    |
| `transaction_type`| `text`                     | `NULL`, `CHECK`                           | Type: `earned`, `spent`.                    |
| `source_type`    | `text`                      | `NULL`                                    | The source of the transaction (e.g., 'achievement'). |
| `source_id`      | `uuid`                      | `NULL`                                    | The ID of the source item.                  |
| `description`    | `text`                      | `NULL`                                    | A description of the transaction.           |
| `created_at`     | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the transaction.               |
| `balance_after`  | `integer`                   | `NULL`                                    | The user's point balance after the transaction. |

**Indexes:**
- `idx_point_transactions_user_id` on `(user_id)`
- `idx_point_transactions_type` on `(transaction_type)`
- `idx_point_transactions_source` on `(source_type, source_id)`
- `idx_point_transactions_created_at` on `(created_at DESC)`

---

### `user_achievements`

Tracks the progress of users towards completing achievements.

| Column          | Type                        | Constraints                               | Description                                 |
| --------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`            | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the entry.            |
| `user_id`       | `uuid`                      | `FOREIGN KEY` -> `auth.users(id)`         | The user.                                   |
| `achievement_id`| `text`                      | `FOREIGN KEY` -> `achievement_definitions(id)` | The achievement being tracked.              |
| `progress`      | `integer`                   | `DEFAULT 0`                               | The user's current progress.                |
| `target`        | `integer`                   | `DEFAULT 1`                               | The target for completion.                  |
| `is_completed`  | `boolean`                   | `DEFAULT false`                           | Whether the achievement is completed.       |
| `completed_at`  | `timestamp with time zone`  | `NULL`                                    | Timestamp of completion.                    |
| `points_earned` | `integer`                   | `DEFAULT 0`                               | Points earned from this achievement.        |
| `created_at`    | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`    | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |

**Constraints:**
- `user_achievements_user_id_achievement_id_key` on `(user_id, achievement_id)`

**Indexes:**
- `idx_user_achievements_user_id` on `(user_id)`
- `idx_user_achievements_achievement_id` on `(achievement_id)`
- `idx_user_achievements_completed` on `(is_completed)`

---

### `user_analytics`

Stores aggregated analytics and metrics for each user.

| Column                      | Type                        | Constraints                               | Description                                 |
| --------------------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`                        | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the analytics entry.  |
| `user_id`                   | `uuid`                      | `UNIQUE`, `FOREIGN KEY` -> `users(id)`    | The user.                                   |
| `username`                  | `text`                      | `NULL`                                    | The user's username.                        |
| `daily_checkin_counter`     | `integer`                   | `DEFAULT 0`                               | Counter for daily check-ins.                |
| `total_checkins`            | `integer`                   | `DEFAULT 0`                               | Total number of check-ins.                  |
| `current_ai_score`          | `real`                      | `DEFAULT 0`                               | The user's current AI score.                |
| `today_average_sentiment`   | `real`                      | `DEFAULT 0`                               | Average sentiment for the current day.      |
| `overall_average_sentiment` | `real`                      | `DEFAULT 0`                               | Overall average sentiment score.            |
| `average_mood_score`        | `real`                      | `DEFAULT 0`                               | Average mood score from check-ins.          |
| `current_streak`            | `integer`                   | `DEFAULT 0`                               | Current check-in streak in days.            |
| `last_checkin_date`         | `date`                      | `NULL`                                    | The date of the last check-in.              |
| `created_at`                | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`                | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |
| `weekly_unique_checkin_days`| `integer`                   | `DEFAULT 0`                               | Number of unique check-in days in the week. |
| `completedantitodos`        | `integer`                   | `DEFAULT 0`                               | Total completed anti-todo items.            |
| `weeklyantitodos`           | `integer`                   | `DEFAULT 0`                               | Completed anti-todo items in the week.      |
| `weekly_score`              | `integer`                   | `DEFAULT 0`                               | User's score for the week.                  |
| `xp`                        | `integer`                   | `DEFAULT 0`                               | User's experience points.                   |

**Indexes:**
- `idx_user_analytics_user_id` on `(user_id)`
- `idx_user_analytics_streak` on `(current_streak)`
- `idx_user_analytics_last_checkin` on `(last_checkin_date)`

**Triggers:**
- `update_user_analytics_updated_at`: Updates `updated_at` on row modification.

---

### `user_plants`

Stores information about the plants users are currently growing.

| Column               | Type                        | Constraints                               | Description                                 |
| -------------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`                 | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the user plant.       |
| `user_id`            | `uuid`                      | `FOREIGN KEY` -> `users(id)`              | The user growing the plant.                 |
| `growth_level`       | `integer`                   | `DEFAULT 1`, `CHECK`                      | Current growth level (1-4).                 |
| `growth_xp`          | `integer`                   | `DEFAULT 0`                               | Current XP towards the next level.          |
| `growth_xp_required` | `integer`                   | `DEFAULT 100`                             | XP required for the next level.             |
| `is_active`          | `boolean`                   | `DEFAULT true`                            | Whether this is the user's active plant.    |
| `created_at`         | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`         | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |
| `plant_name`         | `text`                      | `NULL`                                    | The name given to the plant by the user.    |
| `plant_type`         | `text`                      | `NULL`                                    | The type of the plant.                      |

**Constraints:**
- `user_plants_user_id_is_active_key` on `(user_id, is_active)`

---

### `user_points`

Stores the summary of a user's points.

| Column         | Type                        | Constraints                               | Description                                 |
| -------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`           | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the entry.            |
| `user_id`      | `uuid`                      | `UNIQUE`, `FOREIGN KEY` -> `users(id)`    | The user.                                   |
| `total_earned` | `integer`                   | `DEFAULT 0`                               | Total points earned by the user.            |
| `total_spent`  | `integer`                   | `DEFAULT 0`                               | Total points spent by the user.             |
| `created_at`   | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`   | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |

**Indexes:**
- `idx_user_points_user_id` on `(user_id)`

**Triggers:**
- `update_user_points_updated_at`: Updates `updated_at` on row modification.

---

### `user_preferences`

Stores user-specific preferences for the application.

| Column                    | Type                        | Constraints                               | Description                                 |
| ------------------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`                      | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the preferences entry. |
| `user_id`                 | `uuid`                      | `NOT NULL`, `UNIQUE`, `FOREIGN KEY` -> `users(id)` | The user.                                   |
| `preferred_content_types` | `text[]`                    | `DEFAULT array['text', 'anti_todo', 'checkin']` | Preferred types of content in the feed.     |
| `preferred_hashtags`      | `text[]`                    | `NULL`                                    | Preferred hashtags to follow.               |
| `blocked_users`           | `uuid[]`                    | `NULL`                                    | A list of blocked user IDs.                 |
| `feed_algorithm`          | `text`                      | `DEFAULT 'recent'::text`, `CHECK`         | Algorithm for the feed: `recent`, `popular`, `personalized`. |
| `created_at`              | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`              | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |

**Indexes:**
- `idx_user_preferences_user_id` on `(user_id)`

**Triggers:**
- `update_user_preferences_updated_at`: Updates `updated_at` on row modification.

---

### `user_relationships`

Manages relationships between users (e.g., following, blocking).

| Column         | Type                        | Constraints                               | Description                                 |
| -------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`           | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the relationship.     |
| `follower_id`  | `uuid`                      | `NOT NULL`, `FOREIGN KEY` -> `users(id)`  | The user who is following.                  |
| `following_id` | `uuid`                      | `NOT NULL`, `FOREIGN KEY` -> `users(id)`  | The user who is being followed.             |
| `status`       | `text`                      | `DEFAULT 'pending'::text`, `CHECK`        | Status: `pending`, `accepted`, `blocked`.   |
| `created_at`   | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at`   | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |

**Constraints:**
- `user_relationships_unique` on `(follower_id, following_id)`
- `user_relationships_no_self_follow` check `(follower_id <> following_id)`

**Indexes:**
- `idx_user_relationships_follower_id` on `(follower_id)`
- `idx_user_relationships_following_id` on `(following_id)`
- `idx_user_relationships_status` on `(status)`

**Triggers:**
- `update_user_relationships_updated_at`: Updates `updated_at` on row modification.

---

### `user_store_purchases`

Logs items purchased by users from the store.

| Column          | Type                        | Constraints                               | Description                                 |
| --------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`            | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the purchase.         |
| `user_id`       | `uuid`                      | `FOREIGN KEY` -> `users(id)`              | The user who made the purchase.             |
| `item_id`       | `uuid`                      | `FOREIGN KEY` -> `plant_store_items(id)`  | The item that was purchased.                |
| `purchased_at`  | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the purchase.                  |
| `used_at`       | `timestamp with time zone`  | `NULL`                                    | Timestamp when the item was used.           |
| `is_used`       | `boolean`                   | `DEFAULT false`                           | Whether the item has been used.             |
| `total_cost`    | `integer`                   | `NULL`                                    | The total cost of the purchase.             |
| `quantity`      | `integer`                   | `DEFAULT 1`                               | The quantity of items purchased.            |
| `used_quantity` | `integer`                   | `DEFAULT 0`                               | The quantity of items used.                 |

---

### `users`

Stores public user profile information.

| Column       | Type                        | Constraints                               | Description                                 |
| ------------ | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`         | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `FOREIGN KEY` -> `auth.users(id)` | References the `id` in `auth.users`.        |
| `username`   | `text`                      | `UNIQUE`                                  | The user's unique username.                 |
| `email`      | `text`                      | `NULL`                                    | The user's email address.                   |
| `full_name`  | `text`                      | `NULL`                                    | The user's full name.                       |
| `avatar_url` | `text`                      | `NULL`                                    | URL for the user's avatar image.            |
| `created_at` | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of creation.                      |
| `updated_at` | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of the last update.               |
| `hobbies`    | `text[]`                    | `NULL`                                    | An array of the user's hobbies.             |
| `bio`        | `text`                      | `NULL`                                    | The user's biography.                       |
| `points`     | `integer`                   | `NOT NULL`, `DEFAULT 0`, `CHECK (>= 0)`   | The user's points balance.                  |

**Indexes:**
- `idx_users_email` on `(email)`
- `idx_users_username` on `(username)`

**Triggers:**
- `on_new_user`: Handles setup for a new user.
- `update_users_updated_at`: Updates `updated_at` on row modification.

---

### `waitlist`

Stores information for users who have signed up for the waitlist.

| Column                | Type                        | Constraints                               | Description                                 |
| --------------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| `id`                  | `uuid`                      | `NOT NULL`, `PRIMARY KEY`, `DEFAULT uuid_generate_v4()` | Unique identifier for the waitlist entry.   |
| `email`               | `text`                      | `NOT NULL`, `UNIQUE`                      | The user's email address.                   |
| `name`                | `text`                      | `NULL`                                    | The user's name.                            |
| `referral_source`     | `text`                      | `NULL`                                    | How the user heard about the service.       |
| `interested_features` | `text[]`                    | `NULL`                                    | Features the user is interested in.         |
| `created_at`          | `timestamp with time zone`  | `DEFAULT now()`                           | Timestamp of when the user joined the waitlist. |

**Indexes:**
- `idx_waitlist_email` on `(email)`

---

## Views

### `community_post_stats`

Provides aggregated statistics for community posts, including like counts and user information.

### `user_achievements_with_details`

Joins `user_achievements` with `achievement_definitions` to provide detailed information about each user's achievements.

### `user_points_summary`

Calculates the total point balance for each user by subtracting `total_spent` from `total_earned` in the `user_points` table.
