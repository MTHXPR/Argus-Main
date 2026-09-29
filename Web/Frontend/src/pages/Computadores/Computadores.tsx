import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { apiFetch } from '../../services/api';
import './Computadores.css';

interface Maquina {
  id: number;
  nome: string;
  sistema_operacional: string | null;
  ip: string | null;
  status: string;
  usuario_id: number | null;
}

interface MaquinasResponse {
  maquinas: Maquina[];
}

interface EventoMaquina {
  id: number;
  nome: string;
  status: string;
}

interface FormularioMaquina {
  nome: string;
  sistema_operacional: string;
  ip: string;
  status: string;
}

const formularioInicial: FormularioMaquina = {
  nome: '',
  sistema_operacional: '',
  ip: '',
  status: 'offline',
};

export const Computadores: React.FC = () => {
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [feedback, setFeedback] = useState('');
  const [editando, setEditando] = useState<Maquina | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioMaquina>(formularioInicial);
  const [salvando, setSalvando] = useState(false);

  const carregarMaquinas = async () => {
    try {
      setLoading(true);
      setErro('');

      const data = await apiFetch<MaquinasResponse>('/maquinas');

      setMaquinas(data.maquinas);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os computadores.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMaquinas();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log(
        'Computadores conectado ao WebSocket:',
        socket.id
      );
    });

    socket.on('maquina:status', (evento: EventoMaquina) => {
      console.log('Status da máquina atualizado:', evento);

      setMaquinas((maquinasAtuais) =>
        maquinasAtuais.map((maquina) =>
          maquina.id === evento.id
            ? {
                ...maquina,
                nome: evento.nome,
                status: evento.status,
              }
            : maquina
        )
      );
    });

    socket.on('disconnect', () => {
      console.log(
        'Computadores desconectado do WebSocket.'
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const atualizarCampo = (
    campo: keyof FormularioMaquina,
    valor: string
  ) => {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  };

  const abrirCadastro = () => {
    setEditando(null);
    setFormulario(formularioInicial);
    setFeedback('');
  };

  const abrirEdicao = (maquina: Maquina) => {
    setEditando(maquina);

    setFormulario({
      nome: maquina.nome,
      sistema_operacional:
        maquina.sistema_operacional || '',
      ip: maquina.ip || '',
      status: maquina.status || 'offline',
    });

    setFeedback('');
  };

  const cancelarFormulario = () => {
    setEditando(null);
    setFormulario(formularioInicial);
    setFeedback('');
  };

  const salvarMaquina = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!formulario.nome.trim()) {
      setFeedback('Informe o nome da máquina.');
      return;
    }

    try {
      setSalvando(true);
      setFeedback('');

      if (editando) {
        const data = await apiFetch<{ message: string }>(
          `/maquinas/${editando.id}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              nome: formulario.nome.trim(),
              sistema_operacional:
                formulario.sistema_operacional.trim() || null,
              ip: formulario.ip.trim() || null,
              status: formulario.status,
              usuario_id: editando.usuario_id,
            }),
          }
        );

        setFeedback(data.message);
      } else {
        const data = await apiFetch<{
          message: string;
          maquina: Maquina;
        }>('/maquinas', {
          method: 'POST',
          body: JSON.stringify({
            nome: formulario.nome.trim(),
            sistema_operacional:
              formulario.sistema_operacional.trim() || null,
            ip: formulario.ip.trim() || null,
            status: formulario.status,
            usuario_id: null,
          }),
        });

        setMaquinas((atual) => [
          data.maquina,
          ...atual,
        ]);

        setFeedback(data.message);
      }

      setFormulario(formularioInicial);
      setEditando(null);

      await carregarMaquinas();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a máquina.'
      );
    } finally {
      setSalvando(false);
    }
  };

  const excluirMaquina = async (maquina: Maquina) => {
    const confirmar = window.confirm(
      `Deseja realmente excluir a máquina "${maquina.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setFeedback('');

      const data = await apiFetch<{ message: string }>(
        `/maquinas/${maquina.id}`,
        {
          method: 'DELETE',
        }
      );

      setMaquinas((atual) =>
        atual.filter((item) => item.id !== maquina.id)
      );

      setFeedback(data.message);

      if (editando?.id === maquina.id) {
        cancelarFormulario();
      }
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir a máquina.'
      );
    }
  };

  if (loading) {
    return (
      <section className="computadores-page">
        <h1>Computadores</h1>
        <p>Carregando computadores...</p>
      </section>
    );
  }

  if (erro) {
    return (
      <section className="computadores-page">
        <h1>Computadores</h1>
        <p>{erro}</p>

        <button
          type="button"
          className="computadores-button"
          onClick={carregarMaquinas}
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  return (
    <section className="computadores-page">
      <div className="computadores-header">
        <div>
          <span className="computadores-kicker">
            MONITORAMENTO
          </span>

          <h1>Computadores</h1>

          <p>
            Gerencie as máquinas monitoradas pelo ARGUS.
          </p>
        </div>

        <button
          type="button"
          className="computadores-button"
          onClick={abrirCadastro}
        >
          + Nova máquina
        </button>
      </div>

      {feedback && (
        <div className="computadores-feedback">
          {feedback}
        </div>
      )}

      <form
        className="computadores-form"
        onSubmit={salvarMaquina}
      >
        <div className="computadores-form-header">
          <div>
            <span>
              {editando ? 'EDITAR MÁQUINA' : 'NOVA MÁQUINA'}
            </span>

            <h2>
              {editando
                ? 'Atualizar computador'
                : 'Cadastrar computador'}
            </h2>
          </div>

          {editando && (
            <button
              type="button"
              onClick={cancelarFormulario}
            >
              Cancelar
            </button>
          )}
        </div>

        <div className="computadores-form-grid">
          <label>
            Nome

            <input
              type="text"
              value={formulario.nome}
              onChange={(event) =>
                atualizarCampo(
                  'nome',
                  event.target.value
                )
              }
              placeholder="Ex.: DEV-DESKTOP-01"
              required
            />
          </label>

          <label>
            Sistema operacional

            <input
              type="text"
              value={formulario.sistema_operacional}
              onChange={(event) =>
                atualizarCampo(
                  'sistema_operacional',
                  event.target.value
                )
              }
              placeholder="Ex.: Windows 11"
            />
          </label>

          <label>
            IP

            <input
              type="text"
              value={formulario.ip}
              onChange={(event) =>
                atualizarCampo(
                  'ip',
                  event.target.value
                )
              }
              placeholder="Ex.: 192.168.0.10"
            />
          </label>

          <label>
            Status

            <select
              value={formulario.status}
              onChange={(event) =>
                atualizarCampo(
                  'status',
                  event.target.value
                )
              }
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="computadores-button"
          disabled={salvando}
        >
          {salvando
            ? 'Salvando...'
            : editando
              ? 'Salvar alterações'
              : 'Cadastrar máquina'}
        </button>
      </form>

      <div className="computadores-list">
        <div className="computadores-list-header">
          <div>
            <span>AMBIENTE</span>
            <h2>Máquinas monitoradas</h2>
          </div>

          <strong>
            {maquinas.length} máquina
            {maquinas.length !== 1 ? 's' : ''}
          </strong>
        </div>

        {maquinas.length === 0 ? (
          <div className="computadores-empty">
            <h3>Nenhum computador monitorado</h3>

            <p>
              Cadastre sua primeira máquina para começar o
              monitoramento.
            </p>
          </div>
        ) : (
          <div className="computadores-grid">
            {maquinas.map((maquina) => (
              <article
                key={maquina.id}
                className="computador-card"
              >
                <div className="computador-card-top">
                  <div>
                    <span className="computador-id">
                      #{maquina.id}
                    </span>

                    <h3>{maquina.nome}</h3>
                  </div>

                  <span
                    className={`computador-status ${
                      maquina.status === 'online'
                        ? 'online'
                        : 'offline'
                    }`}
                  >
                    <i />
                    {maquina.status}
                  </span>
                </div>

                <div className="computador-info">
                  <div>
                    <span>SISTEMA</span>

                    <strong>
                      {maquina.sistema_operacional ||
                        'Não informado'}
                    </strong>
                  </div>

                  <div>
                    <span>IP</span>

                    <strong>
                      {maquina.ip || 'Não informado'}
                    </strong>
                  </div>
                </div>

                <div className="computador-actions">
                  <button
                    type="button"
                    onClick={() =>
                      abrirEdicao(maquina)
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      excluirMaquina(maquina)
                    }
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};