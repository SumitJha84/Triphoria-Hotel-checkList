import { Client, Connection } from "@temporalio/client";
import { env } from "./env";

export async function createTemporalClient(): Promise<Client> {
  const connection = await Connection.connect({ address: env.TEMPORAL_ADDRESS });
  return new Client({ connection, namespace: env.TEMPORAL_NAMESPACE });
}
