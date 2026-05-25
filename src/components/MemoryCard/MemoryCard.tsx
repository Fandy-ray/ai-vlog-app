import type { MemoryVlog } from '../../data/memories';

type MemoryCardProps = {
  vlog: MemoryVlog;
  onOpen: (vlog: MemoryVlog) => void;
};

export const MemoryCard = ({ vlog, onOpen }: MemoryCardProps) => {
  return (
    <button className="memory-card" type="button" onClick={() => onOpen(vlog)}>
      <div className="memory-card__cover">
        <img src={vlog.cover} alt={vlog.title} className="memory-card__image" />
        <div className="memory-card__badge">{vlog.duration}</div>
      </div>
      <div className="memory-card__body">
        <div className="memory-card__meta">
          <span>{vlog.time}</span>
          <span>{vlog.location}</span>
        </div>
        <h3 className="memory-card__title">{vlog.title}</h3>
        <p className="memory-card__description">{vlog.description}</p>
        <div className="memory-card__tags">
          {vlog.tags.map((tag) => (
            <span key={tag} className="memory-card__tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};
