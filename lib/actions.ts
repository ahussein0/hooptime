"use server"

import { sql } from "./db"
import { revalidatePath } from "next/cache"

interface ParticipantData {
  eventId: number
  name: string
  phoneNumber: string
  status: "in" | "out"
}

export async function addParticipant(data: ParticipantData) {
  try {
    // Validate phone number length
    const phoneDigits = data.phoneNumber.replace(/\D/g, "")
    if (phoneDigits.length > 10) {
      throw new Error("Phone number should not exceed 10 digits")
    }

    // First, add the participant to the participants table (explicitly specify columns)
    const [participant] = await sql`
      INSERT INTO participants (name, phone_number, status)
      VALUES (${data.name}, ${data.phoneNumber}, ${data.status})
      RETURNING id
    `

    // Then, add the relationship to event_participants
    await sql`
      INSERT INTO event_participants (event_id, participant_id, status)
      VALUES (${data.eventId}, ${participant.id}, ${data.status})
    `

    // Revalidate the home page to show updated participants list
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error adding participant:", error)
    throw new Error("Failed to add participant")
  }
}

export async function backOut(phoneNumber: string, eventId: number) {
  try {
    // Normalize the phone number by removing all non-digit characters
    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, "")

    if (normalizedPhoneNumber.length === 0) {
      throw new Error("Please enter a valid phone number")
    }

    // Find the participant by phone number using a more flexible search
    // This will match phone numbers regardless of formatting
    const participants = await sql`
      SELECT p.id 
      FROM participants p
      JOIN event_participants ep ON p.id = ep.participant_id
      WHERE REGEXP_REPLACE(p.phone_number, '[^0-9]', '', 'g') = ${normalizedPhoneNumber}
      AND ep.event_id = ${eventId}
      AND p.status = 'in'
    `

    if (participants.length === 0) {
      // If the REGEXP_REPLACE approach doesn't work, try a simpler approach
      // with LIKE to find partial matches
      const participantsAlt = await sql`
        SELECT p.id 
        FROM participants p
        JOIN event_participants ep ON p.id = ep.participant_id
        WHERE p.phone_number LIKE ${"%" + normalizedPhoneNumber + "%"}
        AND ep.event_id = ${eventId}
        AND p.status = 'in'
      `

      if (participantsAlt.length === 0) {
        // Check if the phone number exists but is already marked as "out"
        const alreadyOut = await sql`
          SELECT p.id 
          FROM participants p
          JOIN event_participants ep ON p.id = ep.participant_id
          WHERE (REGEXP_REPLACE(p.phone_number, '[^0-9]', '', 'g') = ${normalizedPhoneNumber}
                OR p.phone_number LIKE ${"%" + normalizedPhoneNumber + "%"})
          AND ep.event_id = ${eventId}
          AND p.status = 'out'
        `

        if (alreadyOut.length > 0) {
          throw new Error("This phone number is already marked as 'out'. No need to back out again.")
        }

        // Check if the phone number exists in the database at all
        const anyParticipant = await sql`
          SELECT p.id 
          FROM participants p
          JOIN event_participants ep ON p.id = ep.participant_id
          WHERE (REGEXP_REPLACE(p.phone_number, '[^0-9]', '', 'g') = ${normalizedPhoneNumber}
                OR p.phone_number LIKE ${"%" + normalizedPhoneNumber + "%"})
          AND ep.event_id = ${eventId}
        `

        if (anyParticipant.length === 0) {
          throw new Error(
            "This phone number was not used to sign up for this event. Please check the number and try again.",
          )
        } else {
          throw new Error("No active registration found for this phone number. You may have already backed out.")
        }
      }

      // Use the alternative result
      const participantId = participantsAlt[0].id

      // Update the participant status to "out"
      await sql`
        UPDATE participants 
        SET status = 'out'
        WHERE id = ${participantId}
      `

      // Update the event_participant status to "out"
      await sql`
        UPDATE event_participants 
        SET status = 'out'
        WHERE participant_id = ${participantId}
        AND event_id = ${eventId}
      `
    } else {
      // Use the original result
      const participantId = participants[0].id

      // Update the participant status to "out"
      await sql`
        UPDATE participants 
        SET status = 'out'
        WHERE id = ${participantId}
      `

      // Update the event_participant status to "out"
      await sql`
        UPDATE event_participants 
        SET status = 'out'
        WHERE participant_id = ${participantId}
        AND event_id = ${eventId}
      `
    }

    // Revalidate the home page to show updated participants list
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error backing out:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to back out")
  }
}

interface CreateEventData {
  eventDate: string
  location: string
  maxParticipants: number
  creatorPhoneNumber: string // Added
}

interface CreateWeeklyEventsData {
  startDate: string
  location: string
  maxParticipants: number
  weeksToGenerate: number
  creatorPhoneNumber: string // Added
}

export async function createEvent(data: CreateEventData) {
  try {
    // Create the new event (no longer deactivating others)
    await sql`
      INSERT INTO events (event_date, location, max_participants, is_active, creator_phone_number)
      VALUES (${data.eventDate}, ${data.location}, ${data.maxParticipants}, true, ${data.creatorPhoneNumber})
    `

    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error creating event:", error)
    throw new Error("Failed to create event")
  }
}

export async function createWeeklyEvents(data: CreateWeeklyEventsData) {
  try {
    const startDate = new Date(data.startDate)

    // Create events for each week (all active now)
    for (let i = 0; i < data.weeksToGenerate; i++) {
      const eventDate = new Date(startDate)
      eventDate.setDate(startDate.getDate() + i * 7)

      await sql`
        INSERT INTO events (event_date, location, max_participants, is_active, creator_phone_number)
        VALUES (${eventDate.toISOString()}, ${data.location}, ${data.maxParticipants}, true, ${data.creatorPhoneNumber})
      `
    }

    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error creating weekly events:", error)
    throw new Error("Failed to create weekly events")
  }
}

export async function toggleEventStatus(formData: FormData) {
  const eventId = Number(formData.get("eventId"))
  const currentStatus = formData.get("currentStatus") === "true"
  const newStatus = !currentStatus

  try {
    await sql`
      UPDATE events
      SET is_active = ${newStatus}
      WHERE id = ${eventId}
    `
  } catch (error) {
    console.error("Error toggling event status:", error)
    throw new Error("Failed to toggle event status")
  }

  revalidatePath("/")
}

export async function deleteEvent(eventId: number, userPhoneNumber: string) {
  try {
    // Normalize the user's phone number for comparison
    const normalizedUserPhoneNumber = userPhoneNumber.replace(/\D/g, "")

    // Fetch the event to get its creator's phone number
    const [event] = await sql`
      SELECT creator_phone_number FROM events WHERE id = ${eventId}
    `

    if (!event) {
      throw new Error("Event not found.")
    }

    // Normalize the creator's phone number from the database
    const normalizedCreatorPhoneNumber = event.creator_phone_number?.replace(/\D/g, "")

    // Check if the provided phone number matches the creator's phone number
    if (normalizedUserPhoneNumber !== normalizedCreatorPhoneNumber) {
      throw new Error("You are not authorized to delete this event. Only the creator can delete it.")
    }

    // First, delete all participants for this event
    await sql`
      DELETE FROM event_participants 
      WHERE event_id = ${eventId}
    `

    // Then delete the event itself
    await sql`
      DELETE FROM events 
      WHERE id = ${eventId}
    `

    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error deleting event:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete event")
  }
}
