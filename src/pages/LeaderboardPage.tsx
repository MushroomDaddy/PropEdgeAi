import { useQuery } from "convex/react";
import { Flame, Medal, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "../../convex/_generated/api";

const TIER_STYLES: Record<
  string,
  { bg: string; text: string; border: string; icon: string }
> = {
  diamond: {
    bg: "bg-[#00D4FF]/10",
    text: "text-[#00D4FF]",
    border: "border-[#00D4FF]/20",
    icon: "💎",
  },
  platinum: {
    bg: "bg-[#C8D0E0]/10",
    text: "text-[#C8D0E0]",
    border: "border-[#C8D0E0]/20",
    icon: "⭐",
  },
  gold: {
    bg: "bg-[#FFB800]/10",
    text: "text-[#FFB800]",
    border: "border-[#FFB800]/20",
    icon: "🏅",
  },
  silver: {
    bg: "bg-[#7B8BA8]/10",
    text: "text-[#7B8BA8]",
    border: "border-[#7B8BA8]/20",
    icon: "🥈",
  },
  bronze: {
    bg: "bg-[#CD7F32]/10",
    text: "text-[#CD7F32]",
    border: "border-[#CD7F32]/20",
    icon: "🥉",
  },
};

export function LeaderboardPage() {
  const leaderboard = useQuery(api.leaderboard.list);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="size-6 text-[#FFB800]" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Top analysts and their performance (community mock data)
        </p>
      </div>

      {/* Top 3 Podium */}
      {leaderboard && leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {/* 2nd place */}
          <PodiumCard entry={leaderboard[1]} position={2} />
          {/* 1st place */}
          <PodiumCard entry={leaderboard[0]} position={1} />
          {/* 3rd place */}
          <PodiumCard entry={leaderboard[2]} position={3} />
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-[#111827] rounded-xl border border-[#1E293B] overflow-hidden">
        <div className="p-4 border-b border-[#1E293B]">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Medal className="size-4 text-[#FFB800]" />
            Full Rankings
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E293B] text-[#7B8BA8]">
                <th className="text-center p-3 font-medium w-14">#</th>
                <th className="text-left p-3 font-medium">Player</th>
                <th className="text-left p-3 font-medium">Tier</th>
                <th className="text-right p-3 font-medium">Win Rate</th>
                <th className="text-right p-3 font-medium">Picks</th>
                <th className="text-right p-3 font-medium">Profit</th>
                <th className="text-right p-3 font-medium">Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard?.map((entry: any) => {
                const tier = TIER_STYLES[entry.tier] || TIER_STYLES.bronze;
                return (
                  <tr
                    key={entry._id}
                    className={`border-b border-[#1E293B]/50 hover:bg-[#1A2236]/30 transition-colors ${
                      entry.rank <= 3 ? "bg-[#1A2236]/20" : ""
                    }`}
                  >
                    <td className="p-3 text-center">
                      {entry.rank <= 3 ? (
                        <span className="text-lg">
                          {entry.rank === 1
                            ? "🥇"
                            : entry.rank === 2
                              ? "🥈"
                              : "🥉"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-mono">
                          {entry.rank}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{entry.avatar}</span>
                        <span className="font-medium text-white">
                          {entry.username}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge
                        className={`text-[10px] font-bold ${tier.bg} ${tier.text} ${tier.border}`}
                      >
                        {tier.icon} {entry.tier.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-mono font-bold text-[#00FF88]">
                        {entry.winRate}%
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-[#C8D0E0]">
                      {entry.totalPicks.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-mono font-bold text-[#00FF88]">
                        +${entry.profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {entry.streak >= 5 && (
                          <Flame className="size-3 text-[#FFB800]" />
                        )}
                        <span className="font-mono text-white">
                          {entry.streak}W
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ entry, position }: { entry: any; position: number }) {
  const isFirst = position === 1;

  return (
    <div
      className={`rounded-xl border p-4 text-center ${
        isFirst
          ? "bg-[#FFB800]/5 border-[#FFB800]/20 glow-green"
          : "bg-[#111827] border-[#1E293B]"
      } ${isFirst ? "order-1 lg:-mt-4" : position === 2 ? "order-0" : "order-2"}`}
    >
      <div className="text-3xl mb-2">
        {position === 1 ? "👑" : position === 2 ? "🥈" : "🥉"}
      </div>
      <div className="text-2xl mb-1">{entry.avatar}</div>
      <div className="font-bold text-white text-sm">{entry.username}</div>
      <div className="text-2xl font-bold font-mono text-[#00FF88] mt-2">
        {entry.winRate}%
      </div>
      <div className="text-xs text-muted-foreground">Win Rate</div>
      <div className="text-sm font-mono text-[#00FF88] mt-1">
        +${entry.profit.toLocaleString()}
      </div>
    </div>
  );
}
