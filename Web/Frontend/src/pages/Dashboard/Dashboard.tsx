import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
Activity,
Monitor,
Server,
Wifi,
WifiOff,
CircleAlert,
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import './Dashboard.css';

interface Maquina {
id: number;
nome: string;
sistema_operacional: string;
ip: string;
status: string;
usuario_id: number;
}

interface DashboardResumo {
totalMaquinas: number;
online: number;
offline: number;
outros: number;
}

interface DashboardResponse {
resumo: DashboardResumo;
maquinas: Maquina[];
}

interface EventoMaquinaStatus {
id: number;
nome: string;
status: string;
}

export const Dashboard: React.FC = () => {
const [dados, setDados] = useState<DashboardResponse | null>(null);
const [loading, setLoading] = useState(true);
const [erro, setErro] = useState('');

useEffect(() => {
const carregarDashboard = async () => {
try {
setLoading(true);
setErro('');


    const data = await apiFetch<DashboardResponse>('/dashboard');

    setDados(data);
  } catch (error) {
    setErro(
      error instanceof Error
        ? error.message
        : 'Não foi possível carregar o dashboard.'
    );
  } finally {
    setLoading(false);
  }
};

carregarDashboard();

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Conectado ao WebSocket:', socket.id);
});

socket.on(
  'maquina:status',
  (evento: EventoMaquinaStatus) => {
    console.log('Evento recebido:', evento);

    setDados((dadosAtuais) => {
      if (!dadosAtuais) {
        return dadosAtuais;
      }

      const maquinasAtualizadas = dadosAtuais.maquinas.map(
        (maquina) =>
          maquina.id === evento.id
            ? {
                ...maquina,
                status: evento.status,
              }
            : maquina
      );

      const online = maquinasAtualizadas.filter(
        (maquina) => maquina.status === 'online'
      ).length;

      const offline = maquinasAtualizadas.filter(
        (maquina) => maquina.status === 'offline'
      ).length;

      const outros =
        maquinasAtualizadas.length - online - offline;

      return {
        ...dadosAtuais,
        maquinas: maquinasAtualizadas,
        resumo: {
          ...dadosAtuais.resumo,
          online,
          offline,
          outros,
        },
      };
    });
  }
);

socket.on('disconnect', () => {
  console.log('Desconectado do WebSocket.');
});

return () => {
  socket.disconnect();
};


}, []);

if (loading) {
return ( <section className="dashboard-page"> <div className="dashboard-loading"> <Activity size={22} /> <span>Carregando dados do ambiente...</span> </div> </section>
);
}

if (erro) {
return ( <section className="dashboard-page"> <div className="dashboard-header"> <span className="dashboard-eyebrow"> <i />
MONITORAMENTO ARGUS </span>


      <h1>Dashboard</h1>
      <p>Visão geral do ambiente ARGUS.</p>
    </div>

    <div className="dashboard-error">
      <CircleAlert size={22} />
      <div>
        <strong>Não foi possível carregar os dados.</strong>
        <span>{erro}</span>
      </div>
    </div>
  </section>
);


}

if (!dados) {
return ( <section className="dashboard-page"> <div className="dashboard-header"> <span className="dashboard-eyebrow"> <i />
MONITORAMENTO ARGUS </span>


      <h1>Dashboard</h1>
      <p>Nenhum dado encontrado.</p>
    </div>
  </section>
);


}

return ( <section className="dashboard-page"> <header className="dashboard-header"> <div> <span className="dashboard-eyebrow"> <i />
MONITORAMENTO ARGUS </span>


      <h1>Dashboard</h1>

      <p>
        Acompanhe em tempo real o estado dos computadores
        monitorados.
      </p>
    </div>

    <div className="dashboard-live">
      <i />
      WebSocket conectado
    </div>
  </header>

  <div className="dashboard-stats">
    <article className="dashboard-stat-card">
      <div className="dashboard-stat-icon">
        <Monitor size={19} />
      </div>

      <div>
        <span>Computadores</span>
        <strong>{dados.resumo.totalMaquinas}</strong>
        <small>Total monitorado</small>
      </div>
    </article>

    <article className="dashboard-stat-card dashboard-stat-online">
      <div className="dashboard-stat-icon">
        <Wifi size={19} />
      </div>

      <div>
        <span>Online</span>
        <strong>{dados.resumo.online}</strong>
        <small>Conectados agora</small>
      </div>
    </article>

    <article className="dashboard-stat-card dashboard-stat-offline">
      <div className="dashboard-stat-icon">
        <WifiOff size={19} />
      </div>

      <div>
        <span>Offline</span>
        <strong>{dados.resumo.offline}</strong>
        <small>Sem conexão</small>
      </div>
    </article>

    <article className="dashboard-stat-card dashboard-stat-other">
      <div className="dashboard-stat-icon">
        <Server size={19} />
      </div>

      <div>
        <span>Outros</span>
        <strong>{dados.resumo.outros}</strong>
        <small>Outros estados</small>
      </div>
    </article>
  </div>

  <section className="dashboard-machines">
    <div className="dashboard-section-header">
      <div>
        <span>STATUS DO AMBIENTE</span>
        <h2>Máquinas monitoradas</h2>
      </div>

      <div className="dashboard-machine-count">
        {dados.maquinas.length} máquina
        {dados.maquinas.length !== 1 ? 's' : ''}
      </div>
    </div>

    {dados.maquinas.length === 0 ? (
      <div className="dashboard-empty">
        <Monitor size={28} />
        <strong>Nenhuma máquina monitorada</strong>
        <span>
          Cadastre uma máquina para começar o monitoramento.
        </span>
      </div>
    ) : (
      <div className="dashboard-machine-grid">
        {dados.maquinas.map((maquina) => {
          const online = maquina.status === 'online';

          return (
            <article
              className={`dashboard-machine-card ${
                online ? 'is-online' : 'is-offline'
              }`}
              key={maquina.id}
            >
              <div className="dashboard-machine-top">
                <div className="dashboard-machine-icon">
                  <Monitor size={19} />
                </div>

                <span
                  className={`dashboard-status ${
                    online ? 'is-online' : 'is-offline'
                  }`}
                >
                  <i />
                  {maquina.status}
                </span>
              </div>

              <div className="dashboard-machine-info">
                <h3>{maquina.nome}</h3>

                <p>
                  <span>Sistema</span>
                  {maquina.sistema_operacional ||
                    'Não informado'}
                </p>

                <p>
                  <span>IP</span>
                  {maquina.ip || 'Não informado'}
                </p>
              </div>

              <div className="dashboard-machine-footer">
                <span>ID #{maquina.id}</span>

                <span className="dashboard-realtime">
                  <i />
                  Tempo real
                </span>
              </div>
            </article>
          );
        })}
      </div>
    )}
  </section>
</section>


);
};
