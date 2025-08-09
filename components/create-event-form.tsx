"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createEvent, createWeeklyEvents } from "@/lib/actions"
import { ContentCardFooter } from "@/components/ui/content-card"
import { CalendarDays, Clock, MapPin, Users, Repeat, Phone } from "lucide-react"

export default function CreateEventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [creatorPhoneNumber, setCreatorPhoneNumber] = useState("") // New state for creator's phone

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const eventDate = formData.get("eventDate") as string
    const eventTime = formData.get("eventTime") as string
    const location = formData.get("location") as string
    const maxParticipants = Number.parseInt(formData.get("maxParticipants") as string)
    const weeksToGenerate = Number.parseInt(formData.get("weeksToGenerate") as string) || 1

    if (!eventDate || !eventTime || !location || !maxParticipants || !creatorPhoneNumber) {
      setError("Please fill out all required fields, including your phone number.")
      setIsSubmitting(false)
      return
    }

    // Validate phone number length
    const phoneDigits = creatorPhoneNumber.replace(/\D/g, "")
    if (phoneDigits.length > 10) {
      setError("Your phone number should not exceed 10 digits")
      setIsSubmitting(false)
      return
    }

    // Combine date and time
    const fullDateTime = `${eventDate}T${eventTime}:00`

    try {
      if (isRecurring && weeksToGenerate > 1) {
        await createWeeklyEvents({
          startDate: fullDateTime,
          location,
          maxParticipants,
          weeksToGenerate,
          creatorPhoneNumber, // Pass creator's phone number
        })
        setSuccess(`Successfully created ${weeksToGenerate} weekly events! The first one is now active.`)
      } else {
        await createEvent({
          eventDate: fullDateTime,
          location,
          maxParticipants,
          creatorPhoneNumber, // Pass creator's phone number
        })
        setSuccess("Event created successfully! Players can now sign up.")
      }

      // Reset form
      e.currentTarget.reset()
      setIsRecurring(false)
      setCreatorPhoneNumber("") // Reset creator phone number
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get today's date for the min attribute
  const today = new Date().toISOString().split("T")[0]

  const handleCreatorPhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10)
    let formattedValue = ""
    if (value.length > 0) {
      formattedValue =
        value.length > 6
          ? `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`
          : value.length > 3
            ? `(${value.slice(0, 3)}) ${value.slice(3)}`
            : `(${value}`
    }
    setCreatorPhoneNumber(formattedValue)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="eventDate" className="text-neutral-500 font-normal flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Date
          </Label>
          <Input
            id="eventDate"
            name="eventDate"
            type="date"
            min={today}
            required
            className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="eventTime" className="text-neutral-500 font-normal flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time
          </Label>
          <Input
            id="eventTime"
            name="eventTime"
            type="time"
            required
            className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="location" className="text-neutral-500 font-normal flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </Label>
        <Input
          id="location"
          name="location"
          placeholder="e.g., Just Play, Downtown Court, Local Gym..."
          required
          className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="maxParticipants" className="text-neutral-500 font-normal flex items-center gap-2">
          <Users className="w-4 h-4" />
          How many players?
        </Label>
        <Input
          id="maxParticipants"
          name="maxParticipants"
          type="number"
          min="2"
          max="50"
          placeholder="10"
          required
          className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="creatorPhoneNumber" className="text-neutral-500 font-normal flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Your Phone Number (for managing this event)
        </Label>
        <Input
          id="creatorPhoneNumber"
          name="creatorPhoneNumber"
          value={creatorPhoneNumber}
          onChange={handleCreatorPhoneNumberChange}
          placeholder="(123) 456-7890"
          required
          maxLength={14} // (XXX) XXX-XXXX format
          className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-6 px-4 text-lg"
        />
        <p className="text-xs text-neutral-400">You'll need this number to delete or manage this event later.</p>
      </div>

      <div className="space-y-4 p-6 bg-neutral-50 rounded-lg border border-neutral-100">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="recurring"
            checked={isRecurring}
            onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
          />
          <Label htmlFor="recurring" className="text-neutral-700 font-normal flex items-center gap-2">
            <Repeat className="w-4 h-4" />
            Make this a weekly thing
          </Label>
        </div>

        {isRecurring && (
          <div className="space-y-3 ml-7">
            <Label htmlFor="weeksToGenerate" className="text-neutral-500 font-normal">
              How many weeks?
            </Label>
            <Input
              id="weeksToGenerate"
              name="weeksToGenerate"
              type="number"
              min="2"
              max="12"
              defaultValue="4"
              className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-3 px-4 w-24"
            />
            <p className="text-xs text-neutral-400">This will create the same event for the next few weeks</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-md p-4 text-red-600">
          <p className="font-medium">Oops!</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-100 rounded-md p-4 text-green-600">
          <p className="font-medium">Nice!</p>
          <p className="text-sm">{success}</p>
        </div>
      )}

      <ContentCardFooter>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-black hover:bg-neutral-800 text-white rounded-full px-8 py-6 h-auto text-base transition-all w-full md:w-auto"
        >
          {isSubmitting ? "Creating..." : isRecurring ? "Create Weekly Events" : "Create Event"}
        </Button>
      </ContentCardFooter>
    </form>
  )
}
