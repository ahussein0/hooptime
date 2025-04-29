import { neon } from "@neondatabase/serverless"

// Create a SQL client with the Neon connection string
export const sql = neon(process.env.DATABASE_URL!)

// Define types based on our database schema
export type Participant = {
  id: number
  name: string
  phone_number: string
  payment_amount: string | number // Updated to handle both string and number
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
}

export type EventParticipant = {
  id: number
  event_id: number
  participant_id: number
  status: "in" | "out"
  created_at: string
  name: string
  phone_number: string
  payment_amount: string | number // Updated to handle both string and number
}

