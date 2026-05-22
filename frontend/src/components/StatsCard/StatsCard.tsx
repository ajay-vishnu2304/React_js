import "./StatsCard.css"

type StatsCardProps = {
  title: string;
  value: string;
  percentage: string;
};

function StatsCard({ title, value, percentage }: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="card-top">
        <h3>{title}</h3>
        <select>
          <option>Year</option>
          <option>Month</option>
          <option>Week</option>
          <option>Day</option>
        </select>
      </div>
      <div className="card-content">
        <h1>{value}</h1>
        <p>{percentage}</p>
      </div>
    </div>
  );
}

export default StatsCard
