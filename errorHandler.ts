export type UDErrorLevel = "info" | "warning" | "critical";

export interface UDErrorRecord {
  level: UDErrorLevel;
  message: string;
  source: string;
  time: string;
}

export function createErrorRecord(
  level: UDErrorLevel,
  message: string,
  source = "universal-dragon-singularity"
): UDErrorRecord {
  return {
    level,
    message,
    source,
    time: new Date().toISOString()
  };
}

export function safeLogError(record: UDErrorRecord): void {
  const safeRecord = {
    ...record,
    message: record.message.replace(/api[_-]?key|token|password|secret/gi, "[hidden]")
  };

  console.warn("[UD_SAFE_ERROR]", safeRecord);
}
