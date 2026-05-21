import { Award, BadgeCheck, Building2, HardHat, ShieldCheck, Sparkles, Truck, Wrench } from 'lucide-react';
import GameCanvas from './components/GameCanvas';

const missions = [
  { title: 'Привезти бетон', text: 'Доставить бетон на главный объект', reward: '+120', progress: 78 },
  { title: 'Вывезти грунт', text: 'Освободить котлован для следующего этапа', reward: '+90', progress: 62 },
  { title: 'Пополнить склад', text: 'Доставить арматуру и материалы', reward: '+80', progress: 54 },
  { title: 'Вернуть технику', text: 'Провести самосвал через пит-стоп', reward: '+110', progress: 36 },
];

const machines = [
  { name: 'Самосвал #1', type: 'Грунт', status: 'едет' },
  { name: 'Бетономиксер #3', type: 'Бетон', status: 'едет' },
  { name: 'Экскаватор #1', type: 'Котлован', status: 'работает' },
  { name: 'Погрузчик #2', type: 'Склад', status: 'готов' },
  { name: 'Самосвал #7', type: 'Ремонт', status: 'ремонт' },
];

const events = [
  'Крановщик поймал идеальный ритм: +40 очков к темпу',
  'КПП пропустило колонну без очереди. Редкое достижение.',
  'Пит-стоп обещает вернуть самосвал до конца смены',
  'Поступил срочный заказ на бетон. Успеем — получим бонус.',
];

function App() {
  return (
    <main className="app-shell premium-shell">
      <header className="premium-header">
        <div className="premium-brand">
          <div className="brand-orb">TSM</div>
          <div>
            <h1>AtomSiteControl</h1>
            <span>Premium construction game showcase</span>
          </div>
        </div>

        <Metric icon={<Award />} label="Очки" value="1 480" />
        <Metric icon={<Building2 />} label="Стройка" value="55%" />
        <Metric icon={<Truck />} label="Техника" value="4/5" />
        <Metric icon={<ShieldCheck />} label="Безопасность" value="OK" positive />
      </header>

      <section className="premium-hero">
        <div className="hero-main-card">
          <div className="hero-copy">
            <span className="eyebrow">Уровень 1 · Подготовка площадки</span>
            <h2>Построй объект без пробок, простоев и аварий</h2>
            <p>Управляй техникой, выполняй миссии и собирай очки команды на интерактивной строительной карте.</p>
          </div>
          <button className="primary-action">
            <Sparkles size={18} /> Выполнить ход
          </button>
        </div>

        <div className="team-card">
          <div>
            <span>Настроение команды</span>
            <strong>85%</strong>
          </div>
          <div className="team-faces">
            <span>👷</span>
            <span>👷‍♂️</span>
            <span>👷‍♀️</span>
            <span>👷</span>
          </div>
        </div>
      </section>

      <section className="premium-layout">
        <section className="canvas-card">
          <GameCanvas />
        </section>

        <aside className="premium-side">
          <Panel title="Миссии" action="Все миссии">
            <div className="mission-list">
              {missions.map((mission) => (
                <div className="mission-card" key={mission.title}>
                  <div className="mission-icon"><HardHat size={20} /></div>
                  <div className="mission-body">
                    <div className="row-between">
                      <strong>{mission.title}</strong>
                      <em>{mission.reward}</em>
                    </div>
                    <p>{mission.text}</p>
                    <div className="progress-track"><span style={{ width: `${mission.progress}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Техника" action="Вся техника">
            <div className="machine-list">
              {machines.map((machine) => (
                <div className={`machine-row status-${machine.status}`} key={machine.name}>
                  <Truck size={18} />
                  <div>
                    <strong>{machine.name}</strong>
                    <span>{machine.type}</span>
                  </div>
                  <em>{machine.status}</em>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="События" action="Журнал">
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

      <nav className="bottom-nav">
        <button className="active">Карта</button>
        <button>Миссии</button>
        <button>Техника</button>
        <button>События</button>
        <button>Профиль</button>
      </nav>
    </main>
  );
}

function Metric({ icon, label, value, positive }: { icon: React.ReactNode; label: string; value: string; positive?: boolean }) {
  return (
    <div className={`premium-metric ${positive ? 'positive' : ''}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action: string; children: React.ReactNode }) {
  return (
    <section className="premium-panel">
      <div className="panel-heading">
        <h3>{title}</h3>
        <button>{action}</button>
      </div>
      {children}
    </section>
  );
}

export default App;
