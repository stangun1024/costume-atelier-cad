/** Shared JSON-safe diagnostics for the copy/paste loop and local execution reports. */
export function implementationError(error) {
  return {
    message:error.message, code:error.code ?? 'invalid-operation',
    operationId:error.operationId ?? null,
    operationIndex:error.batchIndex ?? error.operationIndex ?? null,
    operationType:error.operationType ?? null, changeIndex:error.changeIndex ?? null,
    candidates:error.candidates ?? [], entityIds:error.entityIds ?? [],
    seamId:error.seamId ?? null, participantId:error.participantId ?? null,
    details:error.details ?? [], validation:error.validation ?? null,
    recovery:error.recovery ?? null,
  };
}
