import { Suspense } from "react"
import { getUpcomingEvents } from "@/lib/data"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { ContentCard } from "@/components/ui/content-card"
import { ShoppingBasketIcon as Basketball } from "lucide-react"
import CreateEventForm from "@/components/create-event-form"
import EventCard from "@/components/event-card"
import RecentEvents from "@/components/recent-events"

export default async function Home() {
  const upcomingEvents = await getUpcomingEvents()

  return (
    <main className="min-h-screen bg-neutral-50">
      <Section className="py-16">
        <Container size="xl">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Basketball className="w-8 h-8 text-neutral-900" />
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Pickup Hoops</h1>
          </div>
          <p className="text-center text-neutral-500 mb-12">Choose your basketball session</p>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-12">
              {/* Upcoming Events Grid */}
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">Upcoming Games</h2>
                  <p className="text-neutral-500">Pick the session that works for you</p>
                </div>

                {/* Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>

              {/* Event Management */}
              <ContentCard>
                <h2 className="text-2xl font-medium mb-6 text-neutral-900">Manage Events</h2>
                <p className="text-neutral-500 mb-6">Recent and upcoming events</p>
                <Suspense
                  fallback={
                    <div className="flex justify-center py-8">
                      <div className="animate-pulse">Loading events...</div>
                    </div>
                  }
                >
                  <RecentEvents />
                </Suspense>
              </ContentCard>

              {/* Create New Event */}
              <ContentCard>
                <h2 className="text-2xl font-medium mb-6 text-neutral-900">Create New Event</h2>
                <p className="text-neutral-500 mb-6">Set up another basketball session</p>
                <CreateEventForm />
              </ContentCard>
            </div>
          ) : (
            <ContentCard className="text-center py-16">
              <div className="mb-8">
                <p className="text-xl text-neutral-500 mb-4">No upcoming basketball events found.</p>
                <p className="text-neutral-400">Create the first event to get started!</p>
              </div>
              <div className="max-w-2xl mx-auto">
                <CreateEventForm />
              </div>
            </ContentCard>
          )}
        </Container>
      </Section>
    </main>
  )
}
