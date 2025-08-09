"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getAllEvents } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteEvent } from "@/lib/actions"
import { Trash2, Calendar, MapPin, Users, Phone } from "lucide-react"
import type { Event } from "@/lib/db"

export default function RecentEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userPhoneNumber, setUserPhoneNumber] = useState("") // State for user's phone number
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedEvents = await getAllEvents()
        // Show only the next 5 events (active and upcoming)
        const filteredEvents = fetchedEvents
          .filter((event) => new Date(event.event_date) >= new Date(Date.now() - 24 * 60 * 60 * 1000)) // Include events from yesterday onwards
          .slice(0, 5)
        setEvents(filteredEvents)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events.")
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const handleDelete = async (eventId: number) => {
    setDeleteSuccess(null)
    setError(null)
    if (!userPhoneNumber) {
      setError("Please enter your phone number to authorize deletion.")
      return
    }

    // Normalize the user's phone number for comparison
    const normalizedUserPhoneNumber = userPhoneNumber.replace(/\D/g, "")
    if (normalizedUserPhoneNumber.length === 0) {
      setError("Please enter a valid phone number to authorize deletion.")
      return
    }

    try {
      await deleteEvent(eventId, userPhoneNumber)
      setDeleteSuccess("Event deleted successfully!")
      // Re-fetch events to update the list
      const fetchedEvents = await getAllEvents()
      const filteredEvents = fetchedEvents
        .filter((event) => new Date(event.event_date) >= new Date(Date.now() - 24 * 60 * 60 * 1000))
        .slice(0, 5)
      setEvents(filteredEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event.")
    }
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setUserPhoneNumber(formattedValue)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-neutral-400">Loading events...</div>
      </div>
    )
  }

  if (error && !deleteSuccess) {
    // Only show general error if no delete success message
    return (
      <div className="bg-red-50 border border-red-100 rounded-md p-4 text-red-600">
        <p className="font-medium">Error loading events:</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  const normalizedUserPhoneNumber = userPhoneNumber.replace(/\D/g, "")

  return (
    <div className="space-y-4">
      <div className="space-y-3 mb-6">
        <Label htmlFor="deleteAuthPhone" className="text-neutral-500 font-normal flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Your Phone Number (to enable delete)
        </Label>
        <Input
          id="deleteAuthPhone"
          value={userPhoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="(123) 456-7890"
          maxLength={14} // (XXX) XXX-XXXX format
          className="rounded-lg border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400 py-3 px-4 text-base"
        />
        <p className="text-xs text-neutral-400">Enter the phone number you used to create the event to delete it.</p>
      </div>

      {deleteSuccess && (
        <div className="bg-green-50 border border-green-100 rounded-md p-4 text-green-600">
          <p className="font-medium">Success!</p>
          <p className="text-sm">{deleteSuccess}</p>
        </div>
      )}

      {error && ( // Show error specific to deletion attempts
        <div className="bg-red-50 border border-red-100 rounded-md p-4 text-red-600">
          <p className="font-medium">Deletion Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-400">No recent events to manage</p>
        </div>
      ) : (
        events.map((event) => {
          const normalizedCreatorPhoneNumber = event.creator_phone_number?.replace(/\D/g, "")
          const canDelete =
            normalizedUserPhoneNumber === normalizedCreatorPhoneNumber && normalizedUserPhoneNumber.length > 0

          return (
            <div
              key={event.id}
              className={`p-4 rounded-lg border transition-colors ${
                event.is_active ? "bg-green-50 border-green-200" : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1 text-sm text-neutral-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {" at "}
                      {new Date(event.event_date).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    {event.is_active && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.max_participants} players
                    </div>
                  </div>
                </div>

                {canDelete && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault() // Prevent default form submission
                      handleDelete(event.id) // Call the client-side handler
                    }}
                  >
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
