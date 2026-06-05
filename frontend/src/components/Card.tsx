interface CardProps {
  title: string;
  value: number | string;
}

const Card = ({ title, value }: CardProps) => {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
  );
};

export default Card;
