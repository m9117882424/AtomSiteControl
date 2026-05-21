import { useMemo, useState, type ReactNode } from 'react';
import { BadgeCheck, HardHat, ShieldCheck, Sparkles, Trophy, Truck, Wrench } from 'lucide-react';

type MachineStatus = 'ready' | 'moving' | 'working' | 'repair';

type Mission = {
  id: number;
  title: string;
  description: string;
  progress: number;
  reward: number;
  icon: string;
};

type Machine = {
  id: number;
  name: string;
  type: string;
  status: MachineStatus;
};

const initialMissions: Mission[] = [
  { id: 1, title: 'Привезти бетон', description: 'Бетономиксер едет к главному объекту', progress: 74, reward: 120, icon: '🧱' },
  { id: 2, title: 'Вывезти грунт', description: 'Самосвалы освобождают котлован', progress: 61, reward: 90, icon: '🚚' },
  { id: 3, title: 'Доставить материалы', description: 'Склад отправляет арматуру на стройку', progress: 48, reward: 80, icon: '🏗️' },
  { id: 4, title: 'Вернуть технику', description: 'Пит-стоп чинит самосвал #7', progress: 35, reward: 110, icon: '🔧' },
];

const initialMachines: Machine[] = [
  { id: 1, name: 'Самосвал #1', type: 'Грунт', status: 'moving' },
  { id: 2, name: 'Бетономиксер #3', type: 'Бетон', status: 'moving' },
  { id: 3, name: 'Экскаватор #1', type: 'Котлован', status: 'working' },
  { id: 4, name: 'Погрузчик #2', type: 'Склад', status: 'ready' },
  { id: 5, name: 'Самосвал #7', type: 'Ремонт', status: 'repair' },
];

const baseEvents = [
  'Крановщик поймал идеальный ритм: +40 очков к темпу',
  'КПП пропустило колонну без очереди. Редкое достижение.',
  'Пит-стоп обещает вернуть самосвал до конца смены',
];

function App() {
  const [missions, setMissions] = useState(initialMissions);
  const [machines, setMachines] = useState(initialMachines);
  const [score, setScore] = useState(1480);
  const [events, setEvents] = useState(baseEvents);

  const buildProgress = useMemo(() => {
    const total = missions.reduce((sum, mission) => sum + mission.progress, 0);
    return Math.round(total / missions.length);
  }, [missions]);

  const activeMachines = machines.filter((machine) => machine.status !== 'repair').length;

  const completeMiniAction = () => {
    setMissions((current) =>
      current.map((mission, index) =>
        index === 0 ? { ...mission, progress: Math.min(mission.progress + 8, 100) } : mission,
      ),
    );
    setScore((current) => current + 85);
    setEvents((current) => ['Бетон доставлен ближе к объекту: +85 очков', ...current.slice(0, 3)]);
  };

  const fixMachine = () => {
    setMachines((current) =>
      current.map((machine) => (machine.status === 'repair' ? { ...machine, status: 'ready' } : machine)),
    );
    setScore((current) => current + 140);
    setEvents((current) => ['Самосвал #7 вернулся из пит-стопа: +140 очков', ...current.slice(0, 3)]);
  };

  return (
    <main className="app-shell">
      <header className="game-header">
        <div className="brand-card">
          <div className="brand-mark">TSM</div>
          <div>
            <h1>AtomSiteControl</h1>
            <span>Корпоративная стройка-игра · isometric design branch</span>
          </div>
        </div>

        <StatusCard icon={<Trophy />} label="Очки" value={score.toString()} />
        <StatusCard icon={<HardHat />} label="Стройка" value={`${buildProgress}%`} />
        <StatusCard icon={<Truck />} label="Техника" value={`${activeMachines}/${machines.length}`} />
        <StatusCard icon={<ShieldCheck />} label="Безопасность" value="OK" />
      </header>

      <section className="game-layout">
        <section className="game-stage-card">
          <div className="stage-headline">
            <div>
              <span className="eyebrow">Уровень 1</span>
              <h2>Построй площадку без пробок, поломок и уныния</h2>
            </div>
            <button onClick={completeMiniAction} className="primary-action">
              <Sparkles size={18} /> Выполнить ход
            </button>
          </div>

          <div className="isometric-scene" aria-label="Игровая сцена стройки">
            <div className="sky-decoration sun" />
            <div className="sky-decoration cloud cloud-one" />
            <div className="sky-decoration cloud cloud-two" />

            <RouteLane className="route-gate-storage" vehicle="truck-blue" />
            <RouteLane className="route-storage-object" vehicle="truck-white" />
            <RouteLane className="route-pit-object" vehicle="truck-orange" />
            <RouteLane className="route-repair-object" vehicle="truck-green" />

            <StageZone className="zone-gate" emoji="🚧" label="КПП" sublabel="старт" variant="blue" />
            <StageZone className="zone-storage" emoji="🏗️" label="Склад" sublabel="материалы" variant="cyan" />
            <StageZone className="zone-concrete" emoji="🧱" label="Бетон" sublabel="ресурс" variant="blue" />
            <StageZone className="zone-pit" emoji="⛏️" label="Котлован" sublabel="работы" variant="orange" />
            <StageZone className="zone-repair" emoji="🔧" label="Пит-стоп" sublabel="сервис" variant="green" />
            <StageZone className="zone-object" emoji="🏢" label="Главный объект" sublabel="цель" variant="gold" />

            <div className="crane-tower">
              <div className="crane-mast" />
              <div className="crane-arm" />
              <div className="crane-cable" />
            </div>

            <div className="worker worker-one">👷</div>
            <div className="worker worker-two">👷‍♂️</div>
          </div>
        </section>

        <aside className="side-panel">
          <Panel title="Миссии">
            <div className="mission-list">
              {missions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </Panel>

          <Panel title="Техника">
            <div className="machine-list">
              {machines.map((machine) => (
                <MachineRow key={machine.id} machine={machine} />
              ))}
            </div>
            <button onClick={fixMachine} className="secondary-action">
              <Wrench size={18} /> Завершить пит-стоп
            </button>
          </Panel>

          <Panel title="События">
            <div className="event-list">
              {events.map((event) => (
                <div className="event-row" key={event}>
                  <BadgeCheck size={16} />
                  <span>{event}</span>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </section>
    </main>
  );
}

function StatusCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="status-card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function MissionCard({ mission }: { mission: Mission }) {
  return (
    <div className="mission-card">
      <div className="mission-icon">{mission.icon}</div>
      <div className="mission-content">
        <div className="mission-title-line">
          <strong>{mission.title}</strong>
          <span>+{mission.reward}</span>
        </div>
        <p>{mission.description}</p>
        <div className="progress-track">
          <span style={{ width: `${mission.progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function MachineRow({ machine }: { machine: Machine }) {
  return (
    <div className={`machine-row ${machine.status}`}>
      <Truck size={18} />
      <div>
        <strong>{machine.name}</strong>
        <span>{machine.type}</span>
      </div>
      <em>{machineStatusText(machine.status)}</em>
    </div>
  );
}

function machineStatusText(status: MachineStatus) {
  const labels: Record<MachineStatus, string> = {
    ready: 'готов',
    moving: 'едет',
    working: 'работает',
    repair: 'ремонт',
  };

  return labels[status];
}

function StageZone({
  className,
  emoji,
  label,
  sublabel,
  variant,
}: {
  className: string;
  emoji: string;
  label: string;
  sublabel: string;
  variant: 'blue' | 'cyan' | 'orange' | 'green' | 'gold';
}) {
  return (
    <div className={`stage-zone ${className} ${variant}`}>
      <span className="stage-zone-emoji">{emoji}</span>
      <strong>{label}</strong>
      <small>{sublabel}</small>
    </div>
  );
}

function RouteLane({ className, vehicle }: { className: string; vehicle: string }) {
  return (
    <div className={`route-lane ${className}`}>
      <span className={`mini-vehicle ${vehicle}`} />
    </div>
  );
}

export default App;
