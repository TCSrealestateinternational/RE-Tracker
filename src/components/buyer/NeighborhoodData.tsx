import { useState, useEffect } from "react";
import { Icon } from "@/components/shared/Icon";
import { t } from "@/styles/theme";
import type { NeighborhoodScores, SchoolRating } from "@/types";

interface NeighborhoodDataProps {
  address: string;
}

// Deterministic mock data based on address string
function generateMockData(address: string): NeighborhoodScores {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash + address.charCodeAt(i)) | 0;
  }
  const seed = (n: number) => Math.abs((hash * (n + 1)) % 100);

  const schools: SchoolRating[] = [
    { name: "Lincoln Elementary", type: "elementary", rating: 5 + (seed(1) % 5), distance: `${(0.3 + seed(2) * 0.02).toFixed(1)} mi` },
    { name: "Washington Middle", type: "middle", rating: 4 + (seed(3) % 6), distance: `${(0.8 + seed(4) * 0.03).toFixed(1)} mi` },
    { name: "Jefferson High", type: "high", rating: 4 + (seed(5) % 6), distance: `${(1.0 + seed(6) * 0.04).toFixed(1)} mi` },
  ];

  return {
    walkScore: 30 + (seed(7) % 60),
    transitScore: 15 + (seed(8) % 70),
    bikeScore: 20 + (seed(9) % 65),
    schools,
    crimeIndex: 10 + (seed(10) % 80),
    commuteMinutes: 12 + (seed(11) % 35),
  };
}

function ScoreCard({ label, score, icon, color }: { label: string; score: number; icon: string; color: string }) {
  const barColor = score >= 70 ? t.success : score >= 40 ? t.gold : t.rust;
  return (
    <div style={{ background: t.bg, borderRadius: "8px", padding: "12px", textAlign: "center" }}>
      <Icon name={icon} size={20} color={color} />
      <div style={{ fontSize: "24px", fontWeight: 700, color: t.text, margin: "4px 0", fontFamily: t.fontHeadline, fontStyle: "italic" }}>
        {score}
      </div>
      <div style={{ ...t.caption, color: t.textTertiary, marginBottom: "6px" }}>{label}</div>
      <div style={{ height: "4px", background: t.border, borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: barColor, borderRadius: "2px", transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function StarRating({ rating, max = 10 }: { rating: number; max?: number }) {
  const stars = Math.round((rating / max) * 5);
  return (
    <span style={{ display: "inline-flex", gap: "1px" }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name={i < stars ? "star" : "star_border"} size={14} color={i < stars ? t.gold : t.borderMedium} />
      ))}
    </span>
  );
}

export function NeighborhoodData({ address }: NeighborhoodDataProps) {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<NeighborhoodScores | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setScores(generateMockData(address));
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [address]);

  if (loading) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Icon name="location_city" size={20} color={t.teal} />
          <span style={{ ...t.sectionHeader, color: t.text }}>Neighborhood Data</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: t.bg, borderRadius: "8px", height: "90px", opacity: 0.6 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!scores) return null;

  const crimeLabel = scores.crimeIndex <= 30 ? "Low" : scores.crimeIndex <= 60 ? "Moderate" : "High";
  const crimeColor = scores.crimeIndex <= 30 ? t.success : scores.crimeIndex <= 60 ? t.gold : t.rust;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
        <Icon name="location_city" size={20} color={t.teal} />
        <span style={{ ...t.sectionHeader, color: t.text }}>Neighborhood Data</span>
      </div>
      <p style={{ ...t.caption, color: t.textTertiary, marginBottom: "16px" }}>{address}</p>

      {/* Score Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        <ScoreCard label="Walk Score" score={scores.walkScore} icon="directions_walk" color={t.teal} />
        <ScoreCard label="Transit Score" score={scores.transitScore} icon="directions_bus" color={t.teal} />
        <ScoreCard label="Bike Score" score={scores.bikeScore} icon="directions_bike" color={t.teal} />
      </div>

      {/* Schools */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Icon name="school" size={16} color={t.teal} />
          <span style={{ ...t.label, color: t.textSecondary }}>Nearby Schools</span>
        </div>
        {scores.schools.map((school, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 0", borderBottom: i < scores.schools.length - 1 ? `1px solid ${t.border}` : undefined,
          }}>
            <div>
              <div style={{ ...t.body, color: t.text, fontWeight: 500 }}>{school.name}</div>
              <div style={{ ...t.caption, color: t.textTertiary }}>{school.type} &middot; {school.distance}</div>
            </div>
            <StarRating rating={school.rating} />
          </div>
        ))}
      </div>

      {/* Crime & Commute */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div style={{ background: t.bg, borderRadius: "8px", padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Icon name="shield" size={16} color={crimeColor} />
            <span style={{ ...t.label, color: t.textSecondary }}>Safety</span>
          </div>
          <div style={{ ...t.body, fontWeight: 600, color: crimeColor, marginBottom: "6px" }}>{crimeLabel}</div>
          <div style={{ height: "4px", background: t.border, borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${scores.crimeIndex}%`, background: crimeColor, borderRadius: "2px" }} />
          </div>
        </div>
        <div style={{ background: t.bg, borderRadius: "8px", padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Icon name="commute" size={16} color={t.teal} />
            <span style={{ ...t.label, color: t.textSecondary }}>Avg Commute</span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: t.text, fontFamily: t.fontHeadline, fontStyle: "italic" }}>
            {scores.commuteMinutes} <span style={{ fontSize: "12px", fontWeight: 400, fontStyle: "normal" }}>min</span>
          </div>
        </div>
      </div>

      <p style={{ ...t.caption, color: t.textTertiary, marginTop: "12px" }}>
        Data shown is estimated. Connect real APIs for live neighborhood data.
      </p>
    </div>
  );
}
