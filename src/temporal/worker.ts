import { NativeConnection, Worker } from "@temporalio/worker";
import { env } from "../config/env";
import * as activities from "./activities";

async function run(): Promise<void> {
  const connection = await NativeConnection.connect({ address: env.TEMPORAL_ADDRESS });
  const worker = await Worker.create({
    connection,
    namespace: env.TEMPORAL_NAMESPACE,
    taskQueue: env.TEMPORAL_TASK_QUEUE,
    workflowsPath: require.resolve("./workflows"),
    activities
  });
  await worker.run();
}

run().catch((error) => {
  console.error(JSON.stringify({ level: "error", message: "Temporal worker stopped", error: String(error) }));
  process.exit(1);
});
