-- ============================================================================
-- GIIS India — Database Schema (Phase 1)
-- MySQL 5.7+ / MariaDB 10.3+ · InnoDB · utf8mb4
--
-- See docs/ARCHITECTURE.md section E for the ERD rationale, including why
-- `knowledge_relationships` and `seo_metadata` are polymorphic.
--
-- Load order matters (FK dependencies): run this file top to bottom.
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- RBAC
-- ----------------------------------------------------------------------------

CREATE TABLE roles (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  description   VARCHAR(255) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  slug          VARCHAR(150) NOT NULL UNIQUE,   -- e.g. 'courses.publish'
  description   VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
  role_id       INT UNSIGNED NOT NULL,
  permission_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  email          VARCHAR(190) NOT NULL UNIQUE,
  username       VARCHAR(100) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role_id        INT UNSIGNED NOT NULL,
  active         TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at  DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  INDEX idx_users_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Media
-- ----------------------------------------------------------------------------

CREATE TABLE media (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename           VARCHAR(255) NOT NULL,       -- stored, regenerated safe filename
  original_filename  VARCHAR(255) NOT NULL,
  path               VARCHAR(500) NOT NULL,
  mime_type          VARCHAR(100) NOT NULL,
  file_size          INT UNSIGNED NOT NULL,       -- bytes
  width              INT UNSIGNED NULL,
  height             INT UNSIGNED NULL,
  alt_text           VARCHAR(255) NULL,
  caption            VARCHAR(500) NULL,
  category           VARCHAR(100) NULL,
  uploaded_by        INT UNSIGNED NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_media_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Courses
-- ----------------------------------------------------------------------------

CREATE TABLE course_categories (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  slug          VARCHAR(150) NOT NULL UNIQUE,
  description   VARCHAR(500) NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courses (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title                VARCHAR(200) NOT NULL,
  slug                 VARCHAR(200) NOT NULL UNIQUE,
  short_description    VARCHAR(500) NULL,
  long_description     MEDIUMTEXT NULL,
  category_id          INT UNSIGNED NULL,
  level                ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  duration_text        VARCHAR(100) NULL,          -- e.g. "12 weeks" — free text, placeholder-friendly
  mode                 ENUM('classroom','hybrid') NOT NULL DEFAULT 'classroom',
  certification_name   VARCHAR(200) NULL,
  eligibility          VARCHAR(500) NULL,
  is_featured          TINYINT(1) NOT NULL DEFAULT 0,
  is_best_seller       TINYINT(1) NOT NULL DEFAULT 0,
  is_new               TINYINT(1) NOT NULL DEFAULT 0,
  is_duplicate_suspect TINYINT(1) NOT NULL DEFAULT 0,  -- flags e.g. the two ISO 27001 LA listings
  display_order        INT NOT NULL DEFAULT 0,
  featured_image_id    INT UNSIGNED NULL,
  publish_status       ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at         DATETIME NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (featured_image_id) REFERENCES media(id) ON DELETE SET NULL,
  INDEX idx_courses_category (category_id),
  INDEX idx_courses_publish (publish_status),
  INDEX idx_courses_flags (is_featured, is_best_seller, is_new),
  INDEX idx_courses_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_curriculum (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id       INT UNSIGNED NOT NULL,
  module_title    VARCHAR(200) NOT NULL,
  module_description TEXT NULL,
  display_order   INT NOT NULL DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_curriculum_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_skills (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id     INT UNSIGNED NOT NULL,
  skill_name    VARCHAR(150) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_skills_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_tools (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id     INT UNSIGNED NOT NULL,
  tool_name     VARCHAR(150) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_tools_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_learning_outcomes (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id     INT UNSIGNED NOT NULL,
  outcome       VARCHAR(300) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_outcomes_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_faqs (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id     INT UNSIGNED NOT NULL,
  question      VARCHAR(300) NOT NULL,
  answer        TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course_faqs_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Certifications
-- ----------------------------------------------------------------------------

CREATE TABLE certifications (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name               VARCHAR(200) NOT NULL,
  slug               VARCHAR(200) NOT NULL UNIQUE,
  short_description  VARCHAR(500) NULL,
  body               MEDIUMTEXT NULL,             -- what it is / who it's for / prerequisites / skills
  level              ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  domain             VARCHAR(150) NULL,           -- e.g. "Governance, Risk & Compliance"
  prerequisites      TEXT NULL,
  skills             TEXT NULL,
  career_relevance   TEXT NULL,
  related_course_id  INT UNSIGNED NULL,
  publish_status     ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (related_course_id) REFERENCES courses(id) ON DELETE SET NULL,
  INDEX idx_certifications_level (level),
  INDEX idx_certifications_publish (publish_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Careers
-- ----------------------------------------------------------------------------

CREATE TABLE careers (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title               VARCHAR(200) NOT NULL,       -- e.g. "SOC Analyst"
  slug                VARCHAR(200) NOT NULL UNIQUE,
  description         TEXT NULL,                   -- "what does this role do?"
  beginner_skills     TEXT NULL,
  intermediate_skills TEXT NULL,
  advanced_skills     TEXT NULL,
  tools               TEXT NULL,
  roadmap_summary     TEXT NULL,
  career_progression  TEXT NULL,
  publish_status      ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_careers_publish (publish_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE career_certification_links (
  career_id        INT UNSIGNED NOT NULL,
  certification_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (career_id, certification_id),
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
  FOREIGN KEY (certification_id) REFERENCES certifications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_career_links (
  course_id  INT UNSIGNED NOT NULL,
  career_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (course_id, career_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Learning paths
-- ----------------------------------------------------------------------------

CREATE TABLE learning_paths (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,          -- e.g. "SOC Analyst Learning Path"
  slug            VARCHAR(200) NOT NULL UNIQUE,
  description     TEXT NULL,
  target_audience VARCHAR(300) NULL,
  publish_status  ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_learning_paths_publish (publish_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE learning_path_steps (
  id                          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  learning_path_id            INT UNSIGNED NOT NULL,
  step_title                  VARCHAR(200) NOT NULL,
  step_description            TEXT NULL,
  step_type                   ENUM('fundamentals','networking','linux','security_fundamentals',
                                    'specialization','certification','practical_experience',
                                    'career','custom') NOT NULL DEFAULT 'custom',
  related_course_id           INT UNSIGNED NULL,
  related_knowledge_content_id INT UNSIGNED NULL,  -- FK added after knowledge_content table below
  display_order               INT NOT NULL DEFAULT 0,
  FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
  FOREIGN KEY (related_course_id) REFERENCES courses(id) ON DELETE SET NULL,
  INDEX idx_lp_steps_path (learning_path_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Knowledge Center
-- ----------------------------------------------------------------------------

CREATE TABLE knowledge_categories (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,            -- topic grouping, e.g. "Network Security"
  slug          VARCHAR(150) NOT NULL UNIQUE,
  description   VARCHAR(500) NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE knowledge_content (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title             VARCHAR(250) NOT NULL,
  slug              VARCHAR(250) NOT NULL UNIQUE,
  content_type      ENUM('fundamental','domain','technology','guide','resource') NOT NULL,
  -- career/learning-path/certification/glossary content types live in their own
  -- dedicated tables (careers, learning_paths, certifications, glossary_terms)
  -- per docs/ARCHITECTURE.md §E; this ENUM covers the remaining five §17 content types.
  category_id       INT UNSIGNED NULL,
  short_description VARCHAR(500) NULL,
  body              MEDIUMTEXT NULL,
  featured_image_id INT UNSIGNED NULL,
  author_id         INT UNSIGNED NULL,
  reviewer_id       INT UNSIGNED NULL,
  difficulty        ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  publish_date      DATE NULL,
  last_updated       DATE NULL,
  publish_status    ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES knowledge_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (featured_image_id) REFERENCES media(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_knowledge_type (content_type),
  INDEX idx_knowledge_category (category_id),
  INDEX idx_knowledge_difficulty (difficulty),
  INDEX idx_knowledge_publish (publish_status),
  FULLTEXT INDEX ftx_knowledge_search (title, short_description, body)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE learning_path_steps
  ADD FOREIGN KEY (related_knowledge_content_id) REFERENCES knowledge_content(id) ON DELETE SET NULL;

CREATE TABLE knowledge_tags (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  slug  VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE knowledge_content_tags (
  knowledge_content_id INT UNSIGNED NOT NULL,
  tag_id                INT UNSIGNED NOT NULL,
  PRIMARY KEY (knowledge_content_id, tag_id),
  FOREIGN KEY (knowledge_content_id) REFERENCES knowledge_content(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES knowledge_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_knowledge_links (
  course_id             INT UNSIGNED NOT NULL,
  knowledge_content_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (course_id, knowledge_content_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (knowledge_content_id) REFERENCES knowledge_content(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE glossary_terms (
  id                            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  term                          VARCHAR(150) NOT NULL,
  slug                          VARCHAR(150) NOT NULL UNIQUE,
  definition                    TEXT NOT NULL,
  display_letter                CHAR(1) NOT NULL,   -- derived from `term` on save, indexed for A-Z nav
  related_knowledge_content_id  INT UNSIGNED NULL,
  publish_status                ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (related_knowledge_content_id) REFERENCES knowledge_content(id) ON DELETE SET NULL,
  INDEX idx_glossary_letter (display_letter),
  FULLTEXT INDEX ftx_glossary_search (term, definition)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Polymorphic internal-linking graph (see docs/ARCHITECTURE.md §E point 1).
-- Integrity across the polymorphic pair is enforced at the API layer, not by FK.
CREATE TABLE knowledge_relationships (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  from_type         ENUM('knowledge_content','career','learning_path','certification','course','glossary_term') NOT NULL,
  from_id           INT UNSIGNED NOT NULL,
  to_type           ENUM('knowledge_content','career','learning_path','certification','course','glossary_term') NOT NULL,
  to_id             INT UNSIGNED NOT NULL,
  relationship_label VARCHAR(100) NULL,   -- e.g. "Related concept", "Related career path"
  display_order     INT NOT NULL DEFAULT 0,
  UNIQUE KEY uniq_relationship (from_type, from_id, to_type, to_id),
  INDEX idx_rel_from (from_type, from_id),
  INDEX idx_rel_to (to_type, to_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Homepage / marketing
-- ----------------------------------------------------------------------------

CREATE TABLE hero_slides (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slide_order    INT NOT NULL DEFAULT 0,
  eyebrow        VARCHAR(100) NULL,       -- e.g. "CYBERSECURITY EDUCATION"
  heading        VARCHAR(200) NOT NULL,
  description    VARCHAR(500) NULL,
  cta_label      VARCHAR(100) NULL,
  cta_url        VARCHAR(300) NULL,
  svg_asset_key  ENUM('radar_defense','student_terminal','learn_certify_career') NOT NULL,
  publish_status ENUM('draft','published') NOT NULL DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homepage_sections (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_key       VARCHAR(100) NOT NULL UNIQUE,  -- e.g. 'why_giis', 'top_courses'
  is_visible        TINYINT(1) NOT NULL DEFAULT 1,
  custom_heading    VARCHAR(200) NULL,
  custom_description VARCHAR(500) NULL,
  display_order     INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE testimonials (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote          TEXT NOT NULL,
  student_name   VARCHAR(150) NOT NULL,
  course_id      INT UNSIGNED NULL,
  batch_year     VARCHAR(20) NULL,
  designation    VARCHAR(150) NULL,
  photo_media_id INT UNSIGNED NULL,
  display_order  INT NOT NULL DEFAULT 0,
  publish_status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (photo_media_id) REFERENCES media(id) ON DELETE SET NULL,
  INDEX idx_testimonials_publish (publish_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE team_members (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  designation      VARCHAR(150) NOT NULL,
  category         ENUM('leadership','faculty','industry_mentor') NOT NULL,
  photo_media_id   INT UNSIGNED NULL,
  biography        TEXT NULL,
  expertise        VARCHAR(500) NULL,
  certifications   VARCHAR(500) NULL,
  experience_years SMALLINT UNSIGNED NULL,
  social_link      VARCHAR(300) NULL,
  display_order    INT NOT NULL DEFAULT 0,
  publish_status   ENUM('draft','published') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (photo_media_id) REFERENCES media(id) ON DELETE SET NULL,
  INDEX idx_team_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE statistics (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  label         VARCHAR(150) NOT NULL,     -- e.g. "Students Trained"
  value         VARCHAR(50) NOT NULL,      -- text so "[UPDATE BEFORE LAUNCH]" is valid until real
  suffix        VARCHAR(20) NULL,          -- e.g. "+"
  icon          VARCHAR(100) NULL,
  display_order INT NOT NULL DEFAULT 0,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Events / resources
-- ----------------------------------------------------------------------------

CREATE TABLE events (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title              VARCHAR(200) NOT NULL,
  slug               VARCHAR(200) NOT NULL UNIQUE,
  type               ENUM('event','workshop','webinar') NOT NULL DEFAULT 'event',
  description        TEXT NULL,
  start_date         DATETIME NULL,
  end_date           DATETIME NULL,
  location           VARCHAR(300) NULL,
  is_online          TINYINT(1) NOT NULL DEFAULT 0,
  registration_link  VARCHAR(300) NULL,
  featured_image_id  INT UNSIGNED NULL,
  publish_status     ENUM('draft','published') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (featured_image_id) REFERENCES media(id) ON DELETE SET NULL,
  INDEX idx_events_type (type),
  INDEX idx_events_publish (publish_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE resources (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  type            VARCHAR(100) NULL,        -- e.g. "Whitepaper", "Checklist"
  description     TEXT NULL,
  file_media_id   INT UNSIGNED NULL,
  external_link   VARCHAR(300) NULL,
  publish_status  ENUM('draft','published') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (file_media_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- FAQs
-- ----------------------------------------------------------------------------

CREATE TABLE faqs (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question       VARCHAR(300) NOT NULL,
  answer         TEXT NOT NULL,
  category       ENUM('courses','admissions','classroom_training','certifications',
                       'careers','placements','knowledge_center') NOT NULL,
  display_order  INT NOT NULL DEFAULT 0,
  publish_status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  INDEX idx_faqs_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Enquiries
-- ----------------------------------------------------------------------------

CREATE TABLE enquiries (
  id                       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                     VARCHAR(150) NOT NULL,
  phone                    VARCHAR(30) NOT NULL,
  email                    VARCHAR(190) NULL,
  course_id                INT UNSIGNED NULL,
  city                     VARCHAR(100) NULL,
  preferred_contact_method ENUM('phone','email','whatsapp') NOT NULL DEFAULT 'phone',
  message                  TEXT NULL,
  source_page              VARCHAR(300) NULL,
  status                   ENUM('new','contacted','follow_up','converted','closed') NOT NULL DEFAULT 'new',
  created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  INDEX idx_enquiries_status (status),
  INDEX idx_enquiries_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- SEO / platform
-- ----------------------------------------------------------------------------

CREATE TABLE seo_metadata (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type      ENUM('course','knowledge_content','career','learning_path',
                        'certification','glossary_term','event','page') NOT NULL,
  entity_id        INT UNSIGNED NOT NULL,       -- for entity_type='page', a static page key mapped in app config
  seo_title        VARCHAR(200) NULL,
  meta_description VARCHAR(300) NULL,
  canonical_url    VARCHAR(300) NULL,
  robots_directive VARCHAR(100) NULL DEFAULT 'index,follow',
  og_title         VARCHAR(200) NULL,
  og_description   VARCHAR(300) NULL,
  og_image_id      INT UNSIGNED NULL,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_seo_entity (entity_type, entity_id),
  FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE redirects (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  from_path    VARCHAR(300) NOT NULL UNIQUE,
  to_path      VARCHAR(300) NOT NULL,
  status_code  SMALLINT UNSIGNED NOT NULL DEFAULT 301,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_by   INT UNSIGNED NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_redirects_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE site_settings (
  `key`        VARCHAR(150) NOT NULL PRIMARY KEY,
  value        TEXT NULL,
  type         ENUM('text','textarea','number','boolean','json','media') NOT NULL DEFAULT 'text',
  `group`      VARCHAR(100) NULL,   -- e.g. 'contact', 'social', 'integrations'
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NULL,
  action      VARCHAR(100) NOT NULL,      -- e.g. 'course.publish', 'user.create'
  entity_type VARCHAR(100) NULL,
  entity_id   INT UNSIGNED NULL,
  meta_json   JSON NULL,
  ip_address  VARCHAR(45) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- Seed: roles, permissions, and default Super Admin (placeholder credentials —
-- MUST be changed immediately after first login; see README.md).
-- Course/content seed data lives in database/seed.sql (Phase 8).
-- ============================================================================

INSERT INTO roles (id, name, slug, description) VALUES
  (1, 'Super Admin', 'super_admin', 'Full system access'),
  (2, 'Editor', 'editor', 'Content management access, no user/system administration');

INSERT INTO permissions (name, slug) VALUES
  ('Manage Courses', 'courses.manage'),
  ('Publish Courses', 'courses.publish'),
  ('Delete Courses', 'courses.delete'),
  ('Manage Knowledge Center', 'knowledge.manage'),
  ('Delete Knowledge Content', 'knowledge.delete'),
  ('Manage Testimonials', 'testimonials.manage'),
  ('Manage Events', 'events.manage'),
  ('Manage FAQs', 'faqs.manage'),
  ('Upload Media', 'media.upload'),
  ('Edit Basic SEO', 'seo.edit_basic'),
  ('Edit Advanced SEO', 'seo.edit_advanced'),
  ('Manage Redirects', 'redirects.manage'),
  ('Manage Users', 'users.manage'),
  ('Manage Roles', 'roles.manage'),
  ('Manage Settings', 'settings.manage'),
  ('View Audit Log', 'audit_log.view'),
  ('View Enquiries', 'enquiries.view'),
  ('Update Enquiry Status', 'enquiries.update_status');

-- Super Admin: all permissions
INSERT INTO role_permissions (role_id, permission_id)
  SELECT 1, id FROM permissions;

-- Editor: everything except user/role/settings/advanced-SEO/delete/audit-log
INSERT INTO role_permissions (role_id, permission_id)
  SELECT 2, id FROM permissions
  WHERE slug NOT IN ('users.manage','roles.manage','settings.manage',
                      'seo.edit_advanced','courses.delete','knowledge.delete',
                      'audit_log.view','redirects.manage');

-- Placeholder homepage sections (visibility/order control only — see docs/ARCHITECTURE.md §F)
INSERT INTO homepage_sections (section_key, display_order) VALUES
  ('sticky_nav', 1), ('hero', 2), ('trust_strip', 3), ('introduction', 4),
  ('numbers', 5), ('why_giis', 6), ('top_courses', 7), ('courses_by_category', 8),
  ('learning_experience', 9), ('practical_labs', 10), ('industry_ecosystem', 11),
  ('certifications', 12), ('testimonials', 13), ('career_placement', 14),
  ('leadership_preview', 15), ('knowledge_center_preview', 16),
  ('events_resources', 17), ('faq', 18), ('final_cta', 19), ('footer', 20);

-- Placeholder statistics (spec §13 — must show as obviously placeholder, not fact)
INSERT INTO statistics (label, value, suffix, display_order) VALUES
  ('Students Trained', '[UPDATE BEFORE LAUNCH]', '', 1),
  ('Students Placed', '[UPDATE BEFORE LAUNCH]', '', 2),
  ('Certifications Offered', '[UPDATE BEFORE LAUNCH]', '', 3),
  ('Industry Partners', '[UPDATE BEFORE LAUNCH]', '', 4),
  ('Programs', '[UPDATE BEFORE LAUNCH]', '', 5),
  ('Years of Experience', '[UPDATE BEFORE LAUNCH]', '', 6);
