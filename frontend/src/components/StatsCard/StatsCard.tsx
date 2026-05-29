import "./StatsCard.css"

type StatsCardProps = {
  readonly title: string;
  readonly value: string;
  readonly percentage: string;
};

function StatsCard({ title, value, percentage }: Readonly<StatsCardProps>) {
  return (
    <div className="stats-card">
      <div className="card-top">
        <h3>{title}</h3>
        <select>
          <option key="year">Year</option>
          <option key="month">Month</option>
          <option key="week">Week</option>
          <option key="day">Day</option>
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
