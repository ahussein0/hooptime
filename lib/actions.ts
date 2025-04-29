"use server"

import { sql } from "./db"
import { revalidatePath } from "next/cache"

interface ParticipantData {
  eventId: number
  name: string
  phoneNumber: string
  paymentAmount?: number
  status: "in" | "out"
}

export async function addParticipant(data: ParticipantData) {
  try {
    // Validate phone number length
    const phoneDigits = data.phoneNumber.replace(/\D/g, "")
    if (phoneDigits.length > 10) {
      throw new Error("Phone number should not exceed 10 digits")
    }

    // First, add the participant to the participants table
    const [participant] = await sql`
      INSERT INTO participants (name, phone_number, payment_amount, status)
      VALUES (${data.name}, ${data.phoneNumber}, ${data.paymentAmount || 0}, ${data.status})
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

