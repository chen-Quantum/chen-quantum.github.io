# Chen Quantum — Academic Website

A premium static academic personal website built with Astro, Tailwind CSS, and MDX. Deployed to GitHub Pages.

---

## Maintenance Guide

### 1. Where to Put the Logo

```
public/brand/logo.png
```
It appears automatically in the navbar and homepage hero.

---

### 2. Where to Put the CV PDF

```
public/docs/cv.pdf
```
The CV page (`/cv`) links to and embeds this file automatically.

---

### 3. Where to Put Tutorial PDFs

```
public/materials/<filename>.pdf
```
Example: `public/materials/dirac-notation-primer.pdf`

Then reference the filename in the corresponding content file — see step 5.

---

### 4. How to Add a New Course

Create a new Markdown file:
```
src/content/courses/<slug>.md
```

Minimum frontmatter:
```yaml
---
title: "Course Title"
shortDescription: "One or two sentence summary."
semester: "Fall 2025"
tags: ["Mathematics", "Tag2"]
featured: false
---

Course overview goes here as body text.
```

Optional fields:
```yaml
featured: true
youtubeLinks:
  - title: "Lecture 1"
    url: "https://www.youtube.com/watch?v=..."
tutorials:
  - title: "Practice Sheet 1"
    url: "https://example.com/sheet.pdf"
    type: "practice"   # tutorial | practice | worksheet | notes
assignments:
  - title: "Assignment 1"
    url: "https://example.com/a1.pdf"   # optional
    dueDate: "October 10, 2025"         # optional
resources:
  - title: "Textbook"
    url: "https://example.com"
```

The course appears at `/courses/<slug>`.

---

### 5. How to Add a New Tutorial / Practice Material

Create a new Markdown file:
```
src/content/materials/<slug>.md
```

Minimum frontmatter:
```yaml
---
title: "Tutorial Title"
description: "What this material covers."
subject: "Linear Algebra"
type: "tutorial"   # tutorial | practice | worksheet | notes | exam-prep
date: 2025-10-01
---

Body text explaining the material.
```

To link to a PDF in `public/materials/`:
```yaml
pdfFile: "my-tutorial.pdf"
```

To link to an external PDF:
```yaml
pdfUrl: "https://example.com/doc.pdf"
```

For a password-protected PDF (shows a note to students):
```yaml
passwordProtected: true
```

The material appears at `/materials/<slug>` with the PDF viewer.

---

### 6. How to Add YouTube Links to a Course

Edit the course Markdown file and add to `youtubeLinks`:
```yaml
youtubeLinks:
  - title: "Descriptive title"
    url: "https://www.youtube.com/watch?v=VIDEO_ID"
```

---

### 7. How to Edit Contact Details

Open `src/pages/contact.astro` and update at the top of the frontmatter:
```javascript
const EMAIL = "your.email@university.ac.il";
const WHATSAPP_NUMBER = "972501234567"; // international format, no +
```

---

### 8. How to Add a Quantum Community Event

Create a new Markdown file:
```
src/content/communityEvents/<slug>.md
```

Frontmatter example:
```yaml
---
title: "Event Title"
description: "Short description."
date: 2026-03-15
eventType: "workshop"   # conference | workshop | lecture | meetup | community-event | symposium
venue: "Tel Aviv University — Room 101"
collaborators:
  - "TAU Quantum Information Center"
speakers:
  - "Your Name"
registrationUrl: "https://example.com/register"   # optional
featured: true
status: "upcoming"   # upcoming | past
---

Full event description here.
```

The event appears at `/quantum-community/events/<slug>` and in the events listing.

---

### 9. How to Add Gallery Photos

1. Place image files in:
   ```
   public/community/gallery/<event-folder>/
   ```
   Example: `public/community/gallery/workshop-2025/photo-01.jpg`

2. Create or edit a gallery album:
   ```
   src/content/communityGallery/<album-slug>.md
   ```

3. Update the `photos` array:
   ```yaml
   ---
   title: "Workshop 2025"
   description: "Photos from our Qiskit workshop."
   eventDate: 2025-11-08
   coverPhoto: "workshop-2025/photo-01.jpg"
   photos:
     - file: "workshop-2025/photo-01.jpg"
       caption: "Opening session"
     - file: "workshop-2025/photo-02.jpg"
       caption: "Hands-on coding"
   ---
   ```

Photos appear in the gallery at `/quantum-community/gallery`.

---

### 10. How to Run Locally

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:4321`.

---

### 11. How to Build and Deploy

**Check build locally:**
```bash
pnpm install
pnpm astro build
```

**Deploy:** Push to the `main` branch. The GitHub Actions workflow at `.github/workflows/deploy.yml` builds and deploys to GitHub Pages automatically.

---

## Site Structure

| Route | File | Description |
|---|---|---|
| `/` | `src/pages/index.astro` | Homepage |
| `/courses` | `src/pages/courses/index.astro` | All courses |
| `/courses/[slug]` | `src/pages/courses/[slug].astro` | Individual course |
| `/materials` | `src/pages/materials/index.astro` | All tutorial materials |
| `/materials/[slug]` | `src/pages/materials/[slug].astro` | Material with PDF viewer |
| `/cv` | `src/pages/cv.astro` | Curriculum Vitae |
| `/digital-courses` | `src/pages/digital-courses.astro` | Digital courses (coming soon) |
| `/contact` | `src/pages/contact.astro` | Contact / private lessons |
| `/research` | `src/pages/research.astro` | Research |
| `/projects` | `src/pages/projects.astro` | Projects |
| `/about` | `src/pages/about.astro` | About |
| `/quantum-community` | `src/pages/quantum-community/index.astro` | Quantum community main |
| `/quantum-community/events` | `src/pages/quantum-community/events/index.astro` | Events listing |
| `/quantum-community/events/[slug]` | `src/pages/quantum-community/events/[slug].astro` | Individual event |
| `/quantum-community/gallery` | `src/pages/quantum-community/gallery.astro` | Photo gallery |

## Content Collections

| Collection | Folder | Purpose |
|---|---|---|
| `courses` | `src/content/courses/` | Course materials |
| `materials` | `src/content/materials/` | Tutorial PDFs and worksheets |
| `communityEvents` | `src/content/communityEvents/` | Quantum community events |
| `communityGallery` | `src/content/communityGallery/` | Gallery albums |
| `research` | `src/content/research/` | Research papers |
| `projects` | `src/content/projects/` | Projects |
| `library` | `src/content/library/` | Library items |

## Public Assets

```
public/
  brand/logo.png            ← Site logo
  docs/cv.pdf               ← CV document
  materials/                ← Tutorial PDFs
  community/gallery/        ← Event photos
  favicon.svg
  favicon.ico
```

## Tech Stack

- [Astro](https://astro.build) v6
- [Tailwind CSS](https://tailwindcss.com) v4 via `@tailwindcss/vite`
- MDX via `@astrojs/mdx`
- GitHub Pages (static)
- pnpm
