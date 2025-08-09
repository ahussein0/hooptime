import { Suspense } from "react"
import BasketballSignup from "@/components/basketball-signup"
import ParticipantsList from "@/components/participants-list"
import { ContentCard } from "@/components/ui/content-card"
import { Clock, MapPin, Users } from "lucide-react"
import type { Event } from "@/lib/db"

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.event_date)
  const isToday = eventDate.toDateString() === new Date().toDateString()
  const isPast = eventDate < new Date()

  return (
    <ContentCard
      className={`h-full flex flex-col ${isPast ? "opacity-75" : ""} ${
        isToday ? "ring-2 ring-green-200 bg-green-50/30" : ""
      }`}
    >
      {/* Event Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              {eventDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </h3>
            <div className="flex items-center gap-1 text-sm text-neutral-600 mb-2">
              <Clock className="w-3 h-3" />
              {eventDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {isToday && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Today
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Past
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span>{event.max_participants} players max</span>
          </div>
        </div>
      </div>

      {/* Signup Section */}
      {!isPast && (
        <div className="mb-6 flex-shrink-0">
          <BasketballSignup eventId={event.id} />
        </div>
      )}

      {/* Participants List */}
      <div className="flex-1 min-h-0">
        <h4 className="text-sm font-medium mb-3 text-neutral-700">{isPast ? "Attended" : "Signed Up"}</h4>
        <div className="max-h-48 overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex justify-center py-4">
                <div className="animate-pulse text-neutral-400 text-sm">Loading...</div>
              </div>
            }
          >
            <ParticipantsList eventId={event.id} compact />
          </Suspense>
        </div>
      </div>
    </ContentCard>
  )
}
