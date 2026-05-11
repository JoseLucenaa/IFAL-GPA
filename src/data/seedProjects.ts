import type { Project } from '../types/project';

export const seedProjects: Project[] = [
  {
    id: 'p1',
    title: 'Plataforma de monitoramento ambiental',
    subtitle: 'Coleta de dados com IoT no agreste alagoano',
    kind: 'Projeto Integrador',
    progress: 62,
    deadlineLabel: '12 de jun. de 2026',
    gitUrl: 'https://github.com/ifal-maceio/ambiental-io',
    members: [
      { id: 'm1', name: 'Ana Souza', initials: 'AS' },
      { id: 'm2', name: 'Bruno Lima', initials: 'BL' },
      { id: 'm3', name: 'Carla Dias', initials: 'CD' },
    ],
    tasks: [
      { id: 't1', title: 'Levantamento de requisitos', dueLabel: 'Concluído', column: 'done' },
      { id: 't2', title: 'Protótipo do app móvel', dueLabel: '18 mai', column: 'doing' },
      { id: 't3', title: 'Integração API + sensores', dueLabel: '02 jun', column: 'doing' },
      { id: 't4', title: 'Relatório técnico final', dueLabel: '10 jun', column: 'todo' },
    ],
    deliveries: [
      { id: 'd1', version: 'v0.1', label: 'Documento de visão', date: '12 mar. 2026' },
      { id: 'd2', version: 'v0.2', label: 'Backlog priorizado', date: '28 mar. 2026' },
      { id: 'd3', version: 'v0.3', label: 'Build de homologação', date: '22 abr. 2026', notes: 'APK + README' },
    ],
    lastReportSummary:
      'Resumo executivo: escopo estável, risco moderado na integração de hardware. Próximos passos sugeridos: testes em campo e revisão de segurança.',
  },
  {
    id: 'p2',
    title: 'TCC — Recomendação de trilhas de estudo',
    subtitle: 'Aprendizado de máquina aplicado ao ensino híbrido',
    kind: 'TCC',
    progress: 38,
    deadlineLabel: '30 de ago. de 2026',
    gitUrl: 'https://github.com/ifal-maceio/tcc-trilhas-ml',
    members: [
      { id: 'm4', name: 'Daniel Rocha', initials: 'DR' },
      { id: 'm5', name: 'Orientadora: Profa. Helena', initials: 'PH' },
    ],
    tasks: [
      { id: 't5', title: 'Revisão sistemática da literatura', dueLabel: 'Concluído', column: 'done' },
      { id: 't6', title: 'Dataset anonimizado', dueLabel: '25 mai', column: 'doing' },
      { id: 't7', title: 'Modelo baseline', dueLabel: '15 jun', column: 'todo' },
      { id: 't8', title: 'Defesa pública', dueLabel: '30 ago', column: 'todo' },
    ],
    deliveries: [
      { id: 'd4', version: 'v1.0', label: 'Pré-projeto aprovado', date: '10 fev. 2026' },
      { id: 'd5', version: 'v1.1', label: 'Capítulos 1–2', date: '05 abr. 2026' },
    ],
  },
];
