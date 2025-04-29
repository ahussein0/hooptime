import { sql, type Event, type EventParticipant } from "./db"

// Get the active event (most recent one)
export async function getActiveEvent(): Promise<Event | null> {
  try {
    const events = await sql<Event[]>`
      SELECT * FROM events 
      WHERE is_active = true 
      ORDER BY event_date ASC 
      LIMIT 1
    `

    return events.length > 0 ? events[0] : null
  } catch (error) {
    console.error("Error fetching active event:", error)
    return null
  }
}

// Get all participants for a specific event
export async function getEventParticipants(eventId: number): Promise<EventParticipant[]> {
  try {
    const participants = await sql<EventParticipant[]>`
      SELECT 
        ep.id, 
        ep.event_id, 
        ep.participant_id, 
        ep.status, 
        ep.created_at,
        p.name,
        p.phone_number,
        p.payment_amount
      FROM 
        event_participants ep
      JOIN 
        participants p ON ep.participant_id = p.id
      WHERE 
        ep.event_id = ${eventId}
      ORDER BY 
        ep.created_at DESC
    `

    return participants
  } catch (error) {
    console.error("Error fetching event participants:", error)
    return []
  }
}

