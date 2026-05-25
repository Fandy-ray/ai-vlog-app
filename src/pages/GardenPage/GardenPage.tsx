import { useMemo, useState } from 'react';
import { MemoryCard } from '../../components/MemoryCard/MemoryCard';
import { memoryVlogs, type MemoryVlog } from '../../data/memories';

type SortMode = 'time-desc' | 'time-asc' | 'location';

const sortLabels: Record<SortMode, string> = {
  'time-desc': '时间倒序',
  'time-asc': '时间正序',
  location: '地点排序',
};

export const GardenPage = () => {
  const [sortMode, setSortMode] = useState<SortMode>('time-desc');
  const [activeVlog, setActiveVlog] = useState<MemoryVlog>(memoryVlogs[0]);

  const sortedVlogs = useMemo(() => {
    const items = [...memoryVlogs];
    if (sortMode === 'location') {
      return items.sort((a, b) => a.location.localeCompare(b.location, 'zh-CN'));
    }

    return items.sort((a, b) => {
      const diff = new Date(a.time).getTime() - new Date(b.time).getTime();
      return sortMode === 'time-desc' ? -diff : diff;
    });
  }, [sortMode]);

  return (
    <div className="garden-page">
      <section className="garden-hero">
        <div>
          <p className="garden-kicker">记忆花园</p>
          <h1>把剪辑好的 vlog 像花朵一样陈列起来</h1>
          <p className="garden-summary">
            进入后即可浏览已完成的 vlog，支持按时间、地点快速排序，轻松回到每一段值得收藏的回忆。
          </p>
        </div>

        <div className="garden-hero__panel">
          <span className="garden-hero__label">当前排序</span>
          <strong>{sortLabels[sortMode]}</strong>
          <p>点击卡片即可打开预览，查看对应 vlog 的封面、地点和时间信息。</p>
        </div>
      </section>

      <section className="garden-toolbar">
        <div className="garden-toolbar__group">
          {Object.entries(sortLabels).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              className={`garden-sort-button ${sortMode === mode ? 'is-active' : ''}`}
              onClick={() => setSortMode(mode as SortMode)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="garden-toolbar__count">共 {sortedVlogs.length} 支 vlog</span>
      </section>

      <section className="garden-layout">
        <div className="garden-grid">
          {sortedVlogs.map((vlog) => (
            <MemoryCard key={vlog.id} vlog={vlog} onOpen={setActiveVlog} />
          ))}
        </div>

        <aside className="garden-preview">
          <div className="garden-preview__cover">
            <img src={activeVlog.cover} alt={activeVlog.title} />
            <span className="garden-preview__duration">{activeVlog.duration}</span>
          </div>
          <div className="garden-preview__body">
            <p className="garden-preview__label">打开预览</p>
            <h2>{activeVlog.title}</h2>
            <p>{activeVlog.description}</p>
            <div className="garden-preview__detail">
              <span>时间：{activeVlog.time}</span>
              <span>地点：{activeVlog.location}</span>
            </div>
            <div className="garden-preview__tags">
              {activeVlog.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};
