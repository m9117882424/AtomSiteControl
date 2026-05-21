import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CircleGauge,
  Construction,
  Fuel,
  MapPinned,
  ShieldCheck,
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
  color: string;
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
  { id: 7, name: 'Автобетоносмеситель #3', type: 'Бетон', status: 'trip', fuel: 55, efficiency: 82 },
];

const initialTasks: Task[] = [
  { id: 1, title: 'Бетонные работы', target: 300, done: 225, unit: 'м³', color: 'blue' },
  { id: 2, title: 'Вывоз грунта', target: 40, done: 28, unit: 'рейсов', color: 'amber' },
  { id: 3, title: 'Арматура', target: 25, done: 18, unit: 'т', color: 'cyan' },
  { id: 4, title: 'Работа кранов', target: 90, done: 90, unit: '%', color: 'green' },
];

const baseTrips: Trip[] = [
  { vehicle: 'Самосвал #1', from: 'Котлован', to: 'Отвал', cargo: 'Грунт', progress: 60 },
  { vehicle: 'Самосвал #2', from: 'Котлован', to: 'Отвал', cargo: 'Грунт', progress: 30 },
  { vehicle: 'Автобетоносмеситель #3', from: 'Бетонный узел', to: 'Энергоблок №1', cargo: 'Бетон', progress: 80 },
  { vehicle: 'Погрузчик #1', from: 'Склад арматуры', to: 'Котлован', cargo: 'Арматура', progress: 50 },
];

const fuelChart = [
  { hour: '08', fuel: 390 },
  { hour: '09', fuel: 520 },
  { hour: '10', fuel: 480 },
  { hour: '11', fuel: 610 },
  { hour: '12', fuel: 560 },
  { hour: '13', fuel: 690 },
];

const idleChart = [
  { zone: 'КПП', idle: 36 },
  { zone: 'Бетон', idle: 18 },
  { zone: 'Склад', idle: 22 },
  { zone: 'Ремонт', idle: 44 },
];

function statusLabel(status: VehicleStatus) {
  const labels: Record<VehicleStatus, string> = {
    free: 'Свободен',
    trip: 'В рейсе',
    working: 'Работает',
    repair: 'В ремонте',
  };

  return labels[status];
}

function App() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [tasks, setTasks] = useState(initialTasks);
  const [trips, setTrips] = useState(baseTrips);
  const [events, setEvents] = useState([
    '11:20 Пошёл дождь: скорость техники -20%',
    '11:05 На КПП очередь: задержка доставки',
    '10:47 Самосвал #7 сломался: требуется ремонт',
  ]);

  const planPercent = useMemo(() => {
    const total = tasks.reduce((sum, task) => sum + task.done / task.target, 0);
    return Math.round((total / tasks.length) * 100);
  }, [tasks]);

  const assignTrip = () => {
    const freeVehicle = vehicles.find((vehicle) => vehicle.status === 'free');

    if (!freeVehicle) {
      setEvents((current) => ['Диспетчер: нет свободной техники для нового рейса', ...current]);
      return;
    }

    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === freeVehicle.id ? { ...vehicle, status: 'trip', fuel: Math.max(vehicle.fuel - 8, 0) } : vehicle,
      ),
    );

    setTasks((current) =>
      current.map((task) =>
        task.title === 'Вывоз грунта' ? { ...task, done: Math.min(task.done + 1, task.target) } : task,
      ),
    );

    setTrips((current) => [
      { vehicle: freeVehicle.name, from: 'Котлован', to: 'Отвал', cargo: 'Грунт', progress: 5 },
      ...current,
    ]);

    setEvents((current) => [`Диспетчер: ${freeVehicle.name} назначен на вывоз грунта`, ...current]);
  };

  const repairVehicle = () => {
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.status === 'repair' ? { ...vehicle, status: 'free', fuel: 55, efficiency: 70 } : vehicle,
      ),
    );
    setEvents((current) => ['Ремонтная зона: Самосвал #7 возвращён в строй', ...current]);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Building2 size={32} />
          <div>
            <h1>AtomSiteControl</h1>
            <span>Симулятор диспетчера строительной техники</span>
          </div>
        </div>
        <div className="topbar-card">
          <span>Смена</span>
          <strong>2 / День</strong>
        </div>
        <div className="topbar-card">
          <span>План смены</span>
          <strong>{planPercent}%</strong>
        </div>
        <div className="topbar-card">
          <span>Бюджет</span>
          <strong>12.4 млн ₽</strong>
        </div>
        <div className="topbar-card">
          <span>Топливо</span>
          <strong>32 780 л</strong>
        </div>
        <div className="topbar-card success">
          <span>Безопасность</span>
          <strong>92/100</strong>
        </div>
      </header>

      <section className="workspace">
        <aside className="left-column">
          <Panel title="Задания смены">
            <div className="task-list">
              {tasks.map((task) => (
                <div className="task" key={task.id}>
                  <div className="task-title">
                    <Construction size={18} />
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

          <Panel title="События">
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
            <button>Карта</button>
            <button>Техника</button>
            <button>Задания</button>
            <button>Аналитика</button>
          </div>
          <div className="site-map">
            <Zone className="zone concrete" icon={<Fuel size={22} />} title="Бетонный узел" subtitle="Готовность 82%" />
            <Zone className="zone storage" icon={<Construction size={22} />} title="Склад арматуры" subtitle="Запас 180 т" />
            <Zone className="zone block-one" icon={<Building2 size={22} />} title="Энергоблок №1" subtitle="Строительство" />
            <Zone className="zone pit" icon={<MapPinned size={22} />} title="Котлован" subtitle="Вывоз грунта 28/40" />
            <Zone className="zone crane" icon={<Construction size={22} />} title="Башенный кран #2" subtitle="Загрузка 85%" />
            <Zone className="zone gate" icon={<Truck size={22} />} title="КПП" subtitle="Очередь: 6 машин" danger />
            <Zone className="zone repair" icon={<Wrench size={22} />} title="Ремонтная зона" subtitle="1 машина" />
            <div className="road road-one" />
            <div className="road road-two" />
            <div className="truck-dot dot-one" />
            <div className="truck-dot dot-two" />
            <div className="truck-dot dot-three" />
          </div>
        </section>
      </section>

      <section className="bottom-grid">
        <Panel title={`Техника (${vehicles.length})`}>
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
            <button onClick={assignTrip}>Назначить рейс</button>
            <button onClick={repairVehicle}>Завершить ремонт</button>
          </div>
        </Panel>

        <Panel title="Рейсы">
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

        <Panel title="Дашборд смены">
          <div className="dashboard-grid">
            <Metric icon={<CircleGauge />} label="Выполнение" value={`${planPercent}%`} />
            <Metric icon={<Wrench />} label="Простой" value="2 ч 35 мин" />
            <Metric icon={<Fuel />} label="Расход" value="3 240 л" />
            <Metric icon={<ShieldCheck />} label="Безопасность" value="92/100" />
          </div>
          <div className="charts">
            <div className="chart-card">
              <span>Топливо по часам</span>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={fuelChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="fuel" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <span>Простои по зонам</span>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={idleChart}>
                  <XAxis dataKey="zone" />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="idle" radius={[8, 8, 0, 0]} />
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
