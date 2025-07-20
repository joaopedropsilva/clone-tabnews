import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
    const allowedMethods = ["GET", "POST"];
    if (!allowedMethods.includes(request.method))
        return response.status(405).json({
            error: `Method "${request.method}" not allowed`
        });

    let dbClient;
    try {
        dbClient = await database.getNewClient();

        const defaultMigratorOptions = {
            dbClient: dbClient,
            databaseUrl: process.env.DATABASE_URL,
            dryRun: true,
            dir: join("infra", "migrations"),
            direction: "up",
            verbose: true,
            migrationsTable: "pgmigrations"
        };

        if (request.method === "GET") {
            const pendingMigrations =
                await migrationRunner(defaultMigratorOptions);
            return response
                .status(200)
                .json(pendingMigrations);
        }

        if (request.method === "POST") {
            const migratedMigrations = await migrationRunner({
                ...defaultMigratorOptions,
                dryRun: false
            });
            
            const status = migratedMigrations.length > 0 ? 201 : 200;
            
            return response.status(status).json(migratedMigrations);
        }
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        await dbClient.end();
    }
}
