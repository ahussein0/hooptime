import { neon } from "@neondatabase/serverless"

// Create a SQL client with the Neon connection string
const databaseUrl = process.env.MY_DB_CONNECTION_STRING

if (!databaseUrl) {
  // This error indicates that the MY_DB_CONNECTION_STRING environment variable is missing.
  // In a Vercel deployment, this should be configured in your project settings.
  // In the v0 preview, this should be automatically provided by the Neon integration.
  // If you see this error, please ensure your Neon integration is correctly set up.
  throw new Error(
    "MY_DB_CONNECTION_STRING environment variable is not set. Please ensure it's configured in your Vercel project settings or .env.local file for local development.",
  )
}

export const sql = neon(databaseUrl)

// Define types based on our database schema
export type Participant = {
  id: number
  name: string
  phone_number: string
  status: "in" | "out"
  created_at: string
}

export type Event = {
  id: number
  event_date: string
  location: string
  max_participants: number
  is_active: boolean
  created_at: string
  creator_phone_number: string | null // Added for event ownership
}

export type EventParticipant = {
  id: number
  event_id: number
  participant_id: number
  status: "in" | "out"
  created_at: string
  name: string
  phone_number: string
}
