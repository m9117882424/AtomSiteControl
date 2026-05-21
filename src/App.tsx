import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CircleGauge,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type VehicleStatus = 'free' | 'trip' | 'working' | 'repair';

type Vehicle = {
  id: number;
  name: string;
  type: string;
  status: VehicleStatus;
  fuel: number;
  efficiency: number;
};

type Task = {
  id: number;
  title: string;
  target: number;
  done: number;
  unit: string;
  emoji: string;
};

type Trip = {
  vehicle: string;
  from: string;
  to: string;
  cargo: string;
  progress: number;
};

type BoardZone = {
  key: string;
  className: string;
  x: number;
  y: number;
  emoji: string;
  title: string;
  subtitle: string;
  badge: string;
};

const initialVehicles: Vehicle[] = [
  { id: 1, name: 'Самосвал #1', type: 'Самосвал', status: 'trip', fuel: 72, efficiency: 84 },
  { id: 2, name: 'Самосвал #2', type: 'Самосвал', status: 'trip', fuel: 61, efficiency: 79 },
  { id: 3, name: 'Самосвал #7', type: 'Самосвал', status: 'repair', fuel: 18, efficiency: 21 },
  { id: 4, name: 'Экскаватор #1', type: 'Экскаватор', status: 'working', fuel: 48, efficiency: 91 },
  { id: 5, name: 'Экскаватор #2', type: 'Экскаватор', status: 'free', fuel: 66, efficiency: 76 },
  { id: 6, name: 'АТЗ #1', type: 'Топливозаправщик', status: 'free', fuel: 93, efficiency: 88 },
  { id: 7, name: 'Бетономиксер #3', type: 'Бетон', status: 'trip', fuel: 55, efficiency: 82 },
];

const initialTasks: Task[] = [
  { id: 1, title: 'Залить бетон', target: 300, done: 225, unit: 'м³', emoji: '🧱' },
  { id: 2, title: 'Вывезти грунт', target: 40, done: 28, unit: 'рейсов', emoji: '🚚' },
  { id: 3, title: 'Доставить арматуру', target: 25, done: 18, unit: 'т', emoji: '🏗️' },
  { id: 4, title: 'Поднять настроение команды', target: 100, done: 87, unit: '%', emoji: '💙' },
];

const baseTrips: Trip[] = [
  { vehicle: 'Самосвал #1', from: 'Котлован', to: 'Главный объект', cargo: 'Грунт', progress: 60 },
  { vehicle: 'Самосвал #2', from: 'КПП', to: 'Бетонный узел', cargo: 'Материалы', progress: 30 },
  { vehicle: 'Бетономиксер #3', from: 'Бетонный узел', to: 'Главный объект', cargo: 'Бетон', progress: 80 },
  { vehicle: 'Погрузчик #1', from: 'Склад', to: 'Главный объект', cargo: 'Арматура', progress: 50 },
];

const scoreChart = [
  { hour: '08', score: 120 },
  { hour: '09', score: 260 },
  { hour: '10', score: 420 },
  { hour: '11', score: 620 },
  { hour: '12', score: 840 },
  { hour: '13', score: 1240 },
];

const funChart = [
  { zone: 'КПП', points: 36 },
  { zone: 'Бетон', points: 58 },
  { zone: 'Склад', points: 44 },
  { zone: 'Кран', points: 72 },
];

const boardZones: BoardZone[] = [
  { key: 'gate', className: 'gate-zone', x: 70, y: 220, emoji: '🚧', title: 'КПП', subtitle: 'старт техники', badge: 'Вход' },
  { key: 'concrete', className: 'concrete-zone', x: 300, y: 130, emoji: '🧱', title: 'Бетонный узел', subtitle: 'делает бетон', badge: 'Ресурсы' },
  { key: 'storage', className: 'storage-zone', x: 555, y: 130, emoji: '🏗️', title: 'Склад', subtitle: 'материалы', badge: 'Запасы' },
  { key: 'object', className: 'object-zone', x: 790, y: 245, emoji: '🏢', title: 'Главный объект', subtitle: 'цель уровня', badge: 'Цель' },
  { key: 'pit', className: 'pit-zone', x: 300, y: 400, emoji: '⛏️', title: 'Котлован', subtitle: 'грунт', badge: 'Работы' },
  { key: 'repair', className: 'repair-zone', x: 555, y: 400, emoji: '🔧', title: 'Пит-стоп', subtitle: 'ремонт', badge: 'Сервис' },
];

function statusLabel(status: VehicleStatus) {
  const labels: Record<VehicleStatus, string> = {
    free: 'Готов ехать',
    trip: 'В пути',
    working: 'В деле',
    repair: 'На пит-стопе',
  };

  return labels[status];
}

function App() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [tasks, setTasks] = useState(initialTasks);
  const [trips, setTrips] = useState(baseTrips);
  const [score, setScore] = useState(1240);
  const [teamMood, setTeamMood] = useState(87);
  const [events, setEvents] = useState([
    'КПП снова решило стать финальным боссом — очередь +5 машин',
    'Дождь включил режим “грязевой DLC” — дороги стали сложнее',
    'Самосвал #7 ушёл на пит-стоп: механики уже в деле',
  ]);

  const buildPercent = useMemo(() => {
    const total = tasks.reduce((sum, task) => sum + task.done / task.target, 0);
    return Math.round((total / tasks.length) * 100);
  }, [tasks]);

  const assignTrip = () => {
    const freeVehicle = vehicles.find((vehicle) => vehicle.status === 'free');

    if (!freeVehicle) {
      setEvents((current) => ['Все заняты. Стройка кипит, диспетчер держится.', ...current]);
      return;
    }

    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === freeVehicle.id ? { ...vehicle, status: 'trip', fuel: Math.max(vehicle.fuel - 8, 0) } : vehicle,
      ),
    );

    setTasks((current) =>
      current.map((task) =>
        task.title === 'Вывезти грунт' ? { ...task, done: Math.min(task.done + 1, task.target) } : task,
      ),
    );

    setTrips((current) => [
      { vehicle: freeVehicle.name, from: 'Котлован', to: 'Главный объект', cargo: 'Материалы', progress: 5 },
      ...current,
    ]);

    setScore((current) => current + 75);
    setTeamMood((current) => Math.min(current + 1, 100));
    setEvents((current) => [`${freeVehicle.name} получил миссию. Техника поехала — очки пошли. +75`, ...current]);
  };

  const repairVehicle = () => {
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.status === 'repair' ? { ...vehicle, status: 'free', fuel: 55, efficiency: 70 } : vehicle,
      ),
    );
    setScore((current) => current + 120);
    setTeamMood((current) => Math.min(current + 3, 100));
    setEvents((current) => ['Пит-стоп завершён: техника снова в строю. +120 очков', ...current]);
  };

  const boostBuild = () => {
    setTasks((current) =>
      current.map((task) => ({ ...task, done: Math.min(task.done + Math.ceil(task.target * 0.03), task.target) })),
    );
    setScore((current) => current + 180);
    setTeamMood((current) => Math.min(current + 2, 100));
    setEvents((current) => ['Команда включила турборежим: стройка заметно продвинулась. +180 очков', ...current]);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">TSM</div>
          <div>
            <h1>AtomSiteControl</h1>
            <span>Design branch: SVG-карта с нормальными маршрутами</span>
          </div>
        </div>
        <div className="topbar-card level">
          <span>Уровень</span>
          <strong>1 · Площадка</strong>
        </div>
        <div className="topbar-card">
          <span>Прогресс стройки</span>
          <strong>{buildPercent}%</strong>
        </div>
        <div className="topbar-card">
          <span>Очки</span>
          <strong>{score}</strong>
        </div>
        <div className="topbar-card">
          <span>Настроение</span>
          <strong>{teamMood}%</strong>
        </div>
        <div className="topbar-card success">
          <span>Безопасность</span>
          <strong>Отлично</strong>
        </div>
      </header>

      <section className="hero-strip">
        <div>
          <span className="eyebrow">Цель уровня</span>
          <h2>Техника теперь движется по SVG-дорогам, а не съезжает с маршрута</h2>
        </div>
        <button onClick={boostBuild} className="primary-action">
          <Sparkles size={18} /> Ускорить стройку
        </button>
      </section>

      <section className="workspace">
        <aside className="left-column">
          <Panel title="Миссии уровня">
            <div className="task-list">
              {tasks.map((task) => (
                <div className="task" key={task.id}>
                  <div className="task-title">
                    <span className="task-emoji">{task.emoji}</span>
                    <strong>{task.title}</strong>
                  </div>
                  <div className="progress-line">
                    <span style={{ width: `${Math.min((task.done / task.target) * 100, 100)}%` }} />
                  </div>
                  <small>
                    {task.done} / {task.target} {task.unit}
                  </small>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Весёлые события">
            <div className="events">
              {events.slice(0, 5).map((event) => (
                <div className="event" key={event}>
                  <AlertTriangle size={16} />
                  <span>{event}</span>
                </div>
              ))}
            </div>
          </Panel>
        </aside>

        <section className="map-card">
          <div className="map-toolbar">
            <button>Стройка</button>
            <button>Техника</button>
            <button>Миссии</button>
            <button>Рейтинг</button>
          </div>

          <div className="map-info-bar">
            <div className="map-title-block">
              <strong>SVG board-map · design v2</strong>
              <span>Дороги, зоны и техника в одной координатной сетке</span>
            </div>
            <div className="map-legend">
              <LegendItem colorClass="goal" label="Главная цель" />
              <LegendItem colorClass="resource" label="Ресурсы" />
              <LegendItem colorClass="service" label="Сервис" />
            </div>
          </div>

          <div className="site-map svg-board-map">
            <svg className="board-svg" viewBox="0 0 1000 600" role="img" aria-label="Карта стройплощадки">
              <defs>
                <filter id="roadShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#06306e" floodOpacity="0.28" />
                </filter>
              </defs>

              <rect x="0" y="0" width="1000" height="600" rx="30" className="sky-bg" />
              <path d="M 0 210 C 160 170 310 185 475 212 C 650 240 810 210 1000 170 L 1000 600 L 0 600 Z" className="grass-bg" />
              <circle cx="120" cy="86" r="34" className="sun" />
              <path d="M 64 116 C 120 74 196 80 232 124" className="cloud" />
              <path d="M 760 92 C 815 56 895 65 928 110" className="cloud cloud-two" />

              <path id="route-resources" d="M 180 272 C 260 230 340 210 410 210 C 500 210 590 215 670 245 C 725 265 770 288 820 310" className="road-main" />
              <path d="M 180 272 C 260 230 340 210 410 210 C 500 210 590 215 670 245 C 725 265 770 288 820 310" className="road-marking" />

              <path id="route-pit" d="M 385 455 C 470 430 570 405 655 372 C 720 347 770 328 820 310" className="road-main" />
              <path d="M 385 455 C 470 430 570 405 655 372 C 720 347 770 328 820 310" className="road-marking" />

              <path id="route-service" d="M 620 455 C 650 420 670 380 690 340 C 710 300 745 290 820 310" className="road-main service-road" />
              <path d="M 620 455 C 650 420 670 380 690 340 C 710 300 745 290 820 310" className="road-marking" />

              <path id="route-loop" d="M 180 272 C 165 350 210 425 310 455 C 445 496 635 505 820 310" className="road-main loop-road" />
              <path d="M 180 272 C 165 350 210 425 310 455 C 445 496 635 505 820 310" className="road-marking" />
            </svg>

            <div className="moving-vehicle truck-resource">🚚</div>
            <div className="moving-vehicle truck-pit">🚛</div>
            <div className="moving-vehicle truck-service">🚜</div>
            <div className="moving-vehicle truck-loop">🚌</div>

            {boardZones.map((zone) => (
              <ZoneCard key={zone.key} zone={zone} />
            ))}
          </div>
        </section>
      </section>

      <section className="bottom-grid">
        <Panel title={`Команда техники (${vehicles.length})`}>
          <div className="vehicle-list">
            {vehicles.map((vehicle) => (
              <div className={`vehicle ${vehicle.status}`} key={vehicle.id}>
                <Truck size={18} />
                <span>{vehicle.name}</span>
                <strong>{statusLabel(vehicle.status)}</strong>
              </div>
            ))}
          </div>
          <div className="actions">
            <button onClick={assignTrip}>Отправить на миссию</button>
            <button onClick={repairVehicle}>Завершить пит-стоп</button>
          </div>
        </Panel>

        <Panel title="Кто куда поехал">
          <div className="trip-table">
            {trips.slice(0, 5).map((trip) => (
              <div className="trip-row" key={`${trip.vehicle}-${trip.progress}-${trip.to}`}>
                <span>{trip.vehicle}</span>
                <span>{trip.from}</span>
                <span>{trip.to}</span>
                <span>{trip.cargo}</span>
                <div className="progress-line small">
                  <span style={{ width: `${trip.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Итоги игры">
          <div className="dashboard-grid">
            <Metric icon={<Award />} label="Очки" value={`${score}`} />
            <Metric icon={<CircleGauge />} label="Темп стройки" value={`${buildPercent}%`} />
            <Metric icon={<HeartHandshake />} label="Команда" value={`${teamMood}%`} />
            <Metric icon={<ShieldCheck />} label="Безопасность" value="Отлично" />
          </div>
          <div className="charts">
            <div className="chart-card">
              <span>Очки по ходу смены</span>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={scoreChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <span>Где набрали очки</span>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={funChart}>
                  <XAxis dataKey="zone" />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="points" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ZoneCard({ zone }: { zone: BoardZone }) {
  return (
    <div className={`board-zone ${zone.className}`} style={{ left: zone.x, top: zone.y }}>
      <div className="zone-emoji">{zone.emoji}</div>
      <div className="zone-content">
        <span className="zone-badge">{zone.badge}</span>
        <strong>{zone.title}</strong>
        <span>{zone.subtitle}</span>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LegendItem({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="legend-item">
      <span className={`legend-dot ${colorClass}`} />
      <span>{label}</span>
    </div>
  );
}

export default App;
