import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  const { data, isLoading, error } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading) {
    return <div>Carregando status...</div>;
  }

  if (error) {
    return <div>Erro ao carregar status: {error.message}</div>;
  }

  if (!data) {
    return <div>Dados de status indisponíveis.</div>;
  }

  return (
    <>
      <h1>Status</h1>
      <UpdatedAt dataUltimaAtualizacao={data.updated_at} />
      <DatabaseStatus databaseStatus={data.dependencies.database} />
    </>
  );
}

function UpdatedAt({ dataUltimaAtualizacao }) {
  let updatedAtText = "Carregando...";

  if (dataUltimaAtualizacao) {
    updatedAtText = new Date(dataUltimaAtualizacao).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseStatus({ databaseStatus }) {
  return (
    <div>
      <h2>Database</h2>
      <p>Versão: {databaseStatus.version}</p>
      <p>Conexões abertas: {databaseStatus.opened_connections}</p>
      <p>Conexões máximas: {databaseStatus.max_connections}</p>
    </div>
  );
}
