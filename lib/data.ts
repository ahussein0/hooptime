import { sql, type Event, type EventParticipant } from "./db"

// Get upcoming events (next few weeks)
export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const events = await sql<Event[]>`
      SELECT * FROM events 
      WHERE event_date >= NOW() - INTERVAL '1 day'
      ORDER BY event_date ASC 
      LIMIT 10
    `

    return events
  } catch (error) {
    console.error("Error fetching upcoming events:", error)
    return []
  }
}

// Get the active event (most recent one) - keeping for backward compatibility
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

// Get all events (for management)
export async function getAllEvents(): Promise<Event[]> {
  try {
    const events = await sql<Event[]>`
      SELECT * FROM events 
      ORDER BY event_date DESC
    `

    return events
  } catch (error) {
    console.error("Error fetching all events:", error)
    return []
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
        p.phone_number
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
