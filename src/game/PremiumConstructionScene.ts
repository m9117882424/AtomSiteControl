import Phaser from 'phaser';

type SiteNode = { key: string; label: string; x: number; y: number; color: number; accent: number; icon: string };

const nodes: SiteNode[] = [
  { key: 'gate', label: 'КПП', x: 150, y: 430, color: 0xdff5ff, accent: 0x22a8ff, icon: 'K' },
  { key: 'concrete', label: 'Бетонный узел', x: 380, y: 250, color: 0xf1fbff, accent: 0x0b7ce7, icon: 'B' },
  { key: 'storage', label: 'Склад', x: 650, y: 275, color: 0xf1fbff, accent: 0x22c5ff, icon: 'S' },
  { key: 'object', label: 'Главный объект', x: 820, y: 470, color: 0xfffbdf, accent: 0xffc533, icon: 'A' },
  { key: 'pit', label: 'Котлован', x: 285, y: 620, color: 0xfff3df, accent: 0xffa326, icon: 'G' },
  { key: 'service', label: 'Пит-стоп', x: 610, y: 655, color: 0xe4fff5, accent: 0x14c984, icon: 'R' },
];

const routes = [
  ['gate', 'concrete', 0x2f4777],
  ['concrete', 'storage', 0x2f4777],
  ['storage', 'object', 0x2f4777],
  ['pit', 'object', 0x2f4777],
  ['service', 'object', 0x2b6f9e],
  ['gate', 'pit', 0x2b4577],
] as const;

export class PremiumConstructionScene extends Phaser.Scene {
  private nodeMap = new Map<string, SiteNode>();

  constructor() {
    super('PremiumConstructionScene');
  }

  create() {
    nodes.forEach((node) => this.nodeMap.set(node.key, node));
    this.cameras.main.setBackgroundColor('#78d5ff');
    this.createBackground();
    this.createGround();
    this.createRoads();
    this.createBuildings();
    this.createCrane();
    this.createVehicles();
    this.createAmbientDetails();
  }

  private createBackground() {
    const { width } = this.scale;
    this.add.circle(width - 130, 86, 42, 0xffdf5d).setAlpha(0.95);
    this.add.circle(width - 130, 86, 62, 0xffdf5d, 0.18);
    this.createCloud(120, 96, 0.85);
    this.createCloud(520, 122, 0.65);
    this.createCloud(835, 145, 0.5);
  }

  private createCloud(x: number, y: number, alpha: number) {
    const cloud = this.add.container(x, y).setAlpha(alpha);
    cloud.add(this.add.ellipse(0, 12, 80, 34, 0xffffff));
    cloud.add(this.add.circle(-28, 2, 24, 0xffffff));
    cloud.add(this.add.circle(12, -8, 32, 0xffffff));
    cloud.add(this.add.circle(46, 10, 20, 0xffffff));
  }

  private createGround() {
    const ground = this.add.graphics();
    ground.fillStyle(0x4ebd65, 1);
    ground.fillRoundedRect(-30, 210, this.scale.width + 60, this.scale.height - 160, 42);

    const island = this.add.graphics();
    island.lineStyle(2, 0x8ee29a, 0.5);
    const cx = this.scale.width / 2;
    const cy = 470;
    const tileW = 86;
    const tileH = 44;

    for (let row = -4; row <= 5; row += 1) {
      for (let col = -5; col <= 5; col += 1) {
        const x = cx + (col - row) * (tileW / 2);
        const y = cy + (col + row) * (tileH / 2);
        const shade = (row + col) % 2 === 0 ? 0x63c96d : 0x58bf63;
        island.fillStyle(shade, 0.92);
        island.beginPath();
        island.moveTo(x, y - tileH / 2);
        island.lineTo(x + tileW / 2, y);
        island.lineTo(x, y + tileH / 2);
        island.lineTo(x - tileW / 2, y);
        island.closePath();
        island.fillPath();
        island.strokePath();
      }
    }
  }

  private createRoads() {
    routes.forEach(([fromKey, toKey, color]) => {
      const from = this.nodeMap.get(fromKey);
      const to = this.nodeMap.get(toKey);
      if (!from || !to) return;
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const path = new Phaser.Curves.Path(from.x, from.y);
      path.quadraticBezierTo(midX, midY + 24, to.x, to.y);

      const road = this.add.graphics();
      road.lineStyle(42, color, 1);
      path.draw(road, 64);

      const edge = this.add.graphics();
      edge.lineStyle(7, 0x6c88c6, 1);
      path.draw(edge, 64);

      const marking = this.add.graphics();
      marking.lineStyle(4, 0xffffff, 0.82);
      const points = path.getSpacedPoints(90);
      points.forEach((point, index) => {
        if (index % 4 < 2 && index > 0) {
          const prev = points[index - 1];
          marking.lineBetween(prev.x, prev.y, point.x, point.y);
        }
      });
    });
  }

  private createBuildings() {
    nodes.forEach((node) => {
      const card = this.add.container(node.x, node.y).setDepth(node.y + 100);
      const shadow = this.add.graphics();
      shadow.fillStyle(0x06306e, 0.22);
      shadow.fillEllipse(0, 56, 170, 42);
      card.add(shadow);

      const body = this.add.graphics();
      body.fillStyle(node.color, 1);
      body.lineStyle(5, node.accent, 0.82);
      body.fillRoundedRect(-82, -54, 164, 110, 22);
      body.strokeRoundedRect(-82, -54, 164, 110, 22);
      card.add(body);

      const iconBubble = this.add.graphics();
      iconBubble.fillStyle(node.accent, 0.18);
      iconBubble.fillRoundedRect(-28, -44, 56, 48, 16);
      card.add(iconBubble);
      card.add(this.add.text(0, -20, node.icon, { fontFamily: 'Arial', fontSize: '24px', fontStyle: '900', color: '#0b469d' }).setOrigin(0.5));
      card.add(this.add.text(0, 18, node.label, { fontFamily: 'Arial', fontSize: '17px', fontStyle: '700', color: '#0b469d', align: 'center' }).setOrigin(0.5));

      const progress = this.add.graphics();
      progress.fillStyle(0xd7ebf8, 1);
      progress.fillRoundedRect(-54, 40, 108, 10, 6);
      progress.fillStyle(node.accent, 1);
      progress.fillRoundedRect(-54, 40, 72, 10, 6);
      card.add(progress);

      this.tweens.add({ targets: card, y: node.y - 5, duration: 2200 + node.x, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
  }

  private createCrane() {
    const crane = this.add.container(740, 380).setDepth(1000);
    const mast = this.add.rectangle(0, 80, 18, 180, 0xffc533);
    const mastStripe = this.add.rectangle(0, 80, 8, 180, 0xff8f1f).setAlpha(0.45);
    const arm = this.add.rectangle(-32, -18, 230, 16, 0xffc533).setRotation(-0.15);
    const cable = this.add.rectangle(64, 38, 4, 92, 0x25345a);
    const hook = this.add.rectangle(64, 92, 28, 18, 0x25345a);
    crane.add([mast, mastStripe, arm, cable, hook]);
    this.tweens.add({ targets: [cable, hook], y: '+=12', duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private createVehicles() {
    this.spawnVehicle('gate', 'concrete', 0x168ce8, 0);
    this.spawnVehicle('concrete', 'object', 0xffffff, 800);
    this.spawnVehicle('pit', 'object', 0xffa326, 1400);
    this.spawnVehicle('service', 'object', 0x14c984, 2100);
  }

  private spawnVehicle(fromKey: string, toKey: string, color: number, delay: number) {
    const from = this.nodeMap.get(fromKey);
    const to = this.nodeMap.get(toKey);
    if (!from || !to) return;
    const vehicle = this.add.container(from.x, from.y).setDepth(2000);
    vehicle.add(this.add.rectangle(0, 0, 52, 28, color, 1).setStrokeStyle(3, 0x153160, 0.55));
    vehicle.add(this.add.rectangle(16, -4, 18, 14, 0x9de3ff, 1));
    vehicle.add(this.add.circle(-15, 15, 6, 0x172543));
    vehicle.add(this.add.circle(16, 15, 6, 0x172543));
    this.tweens.add({ targets: vehicle, x: to.x, y: to.y, delay, duration: 4400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onUpdate: () => vehicle.setDepth(vehicle.y + 2000) });
  }

  private createAmbientDetails() {
    for (let i = 0; i < 18; i += 1) {
      const x = Phaser.Math.Between(40, this.scale.width - 40);
      const y = Phaser.Math.Between(245, this.scale.height - 40);
      const tree = this.add.container(x, y).setDepth(y - 20);
      tree.add(this.add.rectangle(0, 18, 10, 26, 0x8d5a25));
      tree.add(this.add.circle(0, 0, Phaser.Math.Between(16, 24), 0x237a3a));
    }
  }
}
