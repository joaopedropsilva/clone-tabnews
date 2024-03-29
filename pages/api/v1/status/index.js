import database from "infra/database.js"

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const databaseVersion = 
    (await database.query("SHOW SERVER_VERSION;"))
    .rows[0].server_version;
  const databaseMaxConnections =
    parseInt((await database.query("SHOW MAX_CONNECTIONS;"))
    .rows[0].max_connections);

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnections =
    (await database.query({
      text: 
        "SELECT COUNT(*)::INT FROM pg_stat_activity WHERE datname = $1",
      values: [databaseName]
    }))
    .rows[0]
    .count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersion,
        max_connections: databaseMaxConnections,
        opened_connections: databaseOpenedConnections
      }
    }
  });
}

export default status