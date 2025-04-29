import { Suspense } from "react"
import BasketballSignup from "@/components/basketball-signup"
import ParticipantsList from "@/components/participants-list"
import { getActiveEvent } from "@/lib/data"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { ContentCard } from "@/components/ui/content-card"
import { ShoppingBasketIcon as Basketball } from "lucide-react"

export default async function Home() {
  const event = await getActiveEvent()

  return (
    <main className="min-h-screen bg-neutral-50">
      <Section className="py-16">
        <Container size="lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Basketball className="w-8 h-8 text-neutral-900" />
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Pickup Hoops</h1>
          </div>
          <p className="text-center text-neutral-500 mb-12">Join the next basketball run</p>

          {event ? (
            <div className="space-y-10">
              <ContentCard>
                <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
                  <div>
                    <p className="text-neutral-400 text-sm uppercase tracking-wider mb-1">Date</p>
                    <p className="font-medium text-xl">
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm uppercase tracking-wider mb-1">Location</p>
                    <p className="font-medium text-xl">{event.location}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm uppercase tracking-wider mb-1">Capacity</p>
                    <p className="font-medium text-xl">{event.max_participants} players</p>
                  </div>
                </div>

                <BasketballSignup eventId={event.id} />
              </ContentCard>

              <ContentCard>
                <h2 className="text-2xl font-medium mb-6 text-neutral-900">Players</h2>
                <Suspense
                  fallback={
                    <div className="flex justify-center py-8">
                      <div className="animate-pulse">Loading players...</div>
                    </div>
                  }
                >
                  <ParticipantsList eventId={event.id} />
                </Suspense>
              </ContentCard>
            </div>
          ) : (
            <ContentCard className="text-center py-16">
              <p className="text-xl text-neutral-500">No active basketball events found.</p>
            </ContentCard>
          )}
        </Container>
      </Section>
    </main>
  )
}

