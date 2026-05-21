import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Building2,
  CircleGauge,
  Construction,
  Fuel,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
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
  { vehicle: 'Самосвал #1', from: 'Котлован', to: 'Отвал', cargo: 'Грунт', progress: 60 },
  { vehicle: 'Самосвал #2', from: 'Котлован', to: 'Отвал', cargo: 'Грунт', progress: 30 },
  { vehicle: 'Бетономиксер #3', from: 'Бетонный узел', to: 'Энергоблок', cargo: 'Бетон', progress: 80 },
  { vehicle: 'Погрузчик #1', from: 'Склад', to: 'Площадка', cargo: 'Арматура', progress: 50 },
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
      { vehicle: freeVehicle.name, from: 'Котлован', to: 'Отвал', cargo: 'Грунт', progress: 5 },
      ...current,
    ]);

    setScore((current) => current + 75);
    setTeamMood((current) => Math.min(current + 1, 100));
    setEvents((current) => [`${freeVehicle.name} получил миссию. Грунт сам себя не вывезет. +75 очков`, ...current]);
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
            <span>Корпоративная стройка-игра в синих тонах TSM Enerji</span>
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
          <h2>Помоги команде построить объект и набрать максимум очков</h2>
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
          <div className="site-map">
            <Zone className="zone concrete" icon={<Fuel size={22} />} title="Бетонный узел" subtitle="Бетон готовит победу" />
            <Zone className="zone storage" icon={<Construction size={22} />} title="Склад арматуры" subtitle="Запас: ещё строить и строить" />
            <Zone className="zone block-one" icon={<Building2 size={22} />} title="Главный объект" subtitle="Строительство идёт" />
            <Zone className="zone pit" icon={<MapPinned size={22} />} title="Котлован" subtitle="Грунт не сдаётся" />
            <Zone className="zone crane" icon={<Construction size={22} />} title="Кран-босс" subtitle="Поднимает настроение и грузы" />
            <Zone className="zone gate" icon={<Truck size={22} />} title="КПП" subtitle="Мини-босс: очередь" danger />
            <Zone className="zone repair" icon={<Wrench size={22} />} title="Пит-стоп" subtitle="Механики колдуют" />
            <div className="road road-one" />
            <div className="road road-two" />
            <div className="truck-dot dot-one" />
            <div className="truck-dot dot-two" />
            <div className="truck-dot dot-three" />
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

function Zone({
  className,
  icon,
  title,
  subtitle,
  danger,
}: {
  className: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  danger?: boolean;
}) {
  return (
    <div className={`${className} ${danger ? 'danger' : ''}`}>
      {icon}
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
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

export default App;
