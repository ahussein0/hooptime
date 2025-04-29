import { getEventParticipants } from "@/lib/data"

interface ParticipantsListProps {
  eventId: number
}

export default async function ParticipantsList({ eventId }: ParticipantsListProps) {
  const participants = await getEventParticipants(eventId)

  // Filter participants who are "in"
  const confirmedParticipants = participants.filter((p) => p.status === "in")

  if (confirmedParticipants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">No players have signed up yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto -mx-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left py-3 px-8 text-neutral-400 font-normal text-sm uppercase tracking-wider">
                Name
              </th>
              <th className="text-left py-3 px-8 text-neutral-400 font-normal text-sm uppercase tracking-wider">
                Phone
              </th>
            </tr>
          </thead>
          <tbody>
            {confirmedParticipants.map((participant, index) => (
              <tr
                key={participant.id}
                className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                  index % 2 === 0 ? "bg-neutral-50/50" : ""
                }`}
              >
                <td className="py-4 px-8 font-medium">{participant.name}</td>
                <td className="py-4 px-8 text-neutral-500">{participant.phone_number}</td>
              </tr>
            ))}
            <tr className="font-medium bg-neutral-50">
              <td className="py-4 px-8">Total Players</td>
              <td className="py-4 px-8">{confirmedParticipants.length}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

