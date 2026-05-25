# 🖋️ Inkwell

**Inkwell** is a modern, long-form reading and publishing platform tailored for thoughtful writers and curious minds. With its "Modern Heritage" aesthetic, Inkwell combines the clarity of print typography with the power of modern web technology to create an unparalleled writing and reading experience.

---

## ✨ Features

- **Rich Text Editing:** A distraction-free, professional-grade rich text editor built with Tiptap. Supports inline styles, headings, dynamic embedded images, and seamless drafting.
- **Social Discovery:** Personalized algorithmic and chronological feeds, dynamic global search, user profiles, and topic taxonomy.
- **Interactive Engagement:** Claps, comments, saves, and reading history for readers to curate and engage with content.
- **Creator Analytics:** Beautiful visual dashboards using Recharts to track your article views, read ratios, and audience engagement over time.
- **Seamless Authentication:** Passwordless magic links and OAuth (Google) authentication powered by NextAuth.js (Auth.js v5).
- **SEO & Social Sharing:** Fully dynamic metadata generation, OpenGraph tags, and Twitter Cards to ensure your publishing looks phenomenal anywhere you share it on the web.
- **Media Management:** Cloud-synced image uploads and persistence powered by UploadThing.
- **Modern Heritage UI:** A beautiful, responsive UI crafted with Tailwind CSS and Framer Motion, utilizing glassmorphism, careful spacing, and premium typography (Inter/Georgia styles).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (hosted on [Supabase](https://supabase.com/))
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [Auth.js v5 (NextAuth)](https://authjs.dev/)
- **Media Uploads:** [UploadThing](https://uploadthing.com/)
- **Icons:** [Lucide-React](https://lucide.dev/)
- **Data Visualization:** [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- [Bun](https://bun.sh/) (Optional but recommended for optimal package resolving)
- A PostgreSQL database (e.g., Supabase, Neon)
- A Google Cloud Console project (for OAuth)

### 1. Clone the repository
```bash
git clone https://github.com/ibrahim-116/inkwell-ai.git
cd inkwell-ai
```

### 2. Install dependencies
```bash
bun install
# or npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the project and populate it with the appropriate values. See `.env.example` if available.

```env
# Database (Prisma)
DATABASE_URL="postgresql://postgres:password@localhost:5432/inkwell?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/inkwell?schema=public"

# Next Auth (Auth.js)
AUTH_SECRET="your-generated-secret-key"
AUTH_URL="http://localhost:3000"

# Google Auth
AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

# Email / Resend
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="onboarding@resend.dev"

# UploadThing
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

*(Note: You can generate a random `AUTH_SECRET` by running `npx auth secret`)*

### 4. Setup the Database
Migrate the Prisma schema to your PostgreSQL database.
```bash
bunx prisma generate
bunx prisma db push
```

### 5. Start the Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

---

## 📄 License

This project is licensed under the MIT License.
