# Credovia - Credibility Score System

A modern full-stack application to calculate and display user credibility based on their online presence.

## Tech Stack
- **Frontend**: Next.js 15+, Tailwind CSS 4, Framer Motion
- **Backend**: Appwrite (Auth, Database, Functions)
- **Icons**: Lucide React

## Getting Started

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Appwrite**:
   - Create a new project at [Appwrite Cloud](https://cloud.appwrite.io)
   - Create a Database named `Credovia`
   - Create two Collections:
     - **Users**:
       - `userId` (String, required)
       - `name` (String, required)
       - `email` (String, required)
       - `bio` (String)
       - `github` (String)
       - `linkedin` (String)
       - `portfolio` (String)
       - `score` (Integer)
     - **Reviews**:
       - `reviewerId` (String, required)
       - `targetUserId` (String, required)
       - `rating` (Integer, required)
       - `comment` (String, required)
       - `reviewerName` (String)

4. **Environment Variables**:
   Copy `.env.local.example` to `.env.local` and fill in your Appwrite project details.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

## Key Features
- **Reputation Scoring**: Algorithmically calculated score (0-100) based on professional profile completeness and links.
- **Peer Verification**: Community review system where users can vouch for each other.
- **Modern Dashboard**: Manage your digital identity and see your trust rank.
- **Directory Search**: Look up anyone to see their credibility before doing business or collaborating.
