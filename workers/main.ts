import { processWorkers } from "./index";
import { logger } from "@/lib/logger";

const INTERVAL_MS = 5 * 60 * 1000;

async function tick() {
  try {
    await processWorkers();
  } catch (e) {
    logger.error("worker.tick_failed", { err: e });
  }
}

logger.info("worker.started", { intervalMs: INTERVAL_MS });
void tick();
setInterval(() => void tick(), INTERVAL_MS);
