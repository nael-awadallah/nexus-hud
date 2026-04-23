import type { CommentarySnapshot } from "../netlify/contracts";

export function buildFallbackCommentary(snapshot: CommentarySnapshot) {
  const warnNodes = snapshot.geoNodes.filter((node) => node.status === "warn");
  const offlineNodes = snapshot.geoNodes.filter((node) => node.status === "offline");
  const hottestNode = [...snapshot.geoNodes].sort((a, b) => b.load - a.load)[0];
  const slowestNode = [...snapshot.geoNodes].sort((a, b) => b.ping - a.ping)[0];
  const selectedNode =
    snapshot.selectedNodeId
      ? snapshot.geoNodes.find((node) => node.id === snapshot.selectedNodeId) ?? null
      : null;

  const intro = snapshot.visitorLocation?.city
    ? `Operator trace acquired over ${snapshot.visitorLocation.city}, ${snapshot.visitorLocation.country ?? "unknown sector"}.`
    : "Operator trace unresolved; running remote telemetry sweep.";

  const modeLine = `${snapshot.mode.toUpperCase()} mode holding at ${snapshot.stats.neuralLoad}% neural load and ${snapshot.stats.inferenceRate.toFixed(1)}K inference throughput.`;

  const anomalyLine = offlineNodes.length
    ? `${offlineNodes.length} node${offlineNodes.length === 1 ? "" : "s"} offline. Prioritize recovery on ${offlineNodes[0].name}.`
    : warnNodes.length
      ? `${warnNodes.length} relay${warnNodes.length === 1 ? "" : "s"} in watch state. ${slowestNode.name} is dragging at ${slowestNode.ping}ms latency.`
      : `${hottestNode.name} remains the hottest circuit at ${hottestNode.load}% load, but the lattice is stable.`;

  const focusLine = selectedNode
    ? `Focused telemetry on ${selectedNode.name}: ${selectedNode.ping}ms ping, ${selectedNode.load}% load.`
    : `Coherence reads ${snapshot.stats.coherence.toFixed(1)}% with entropy at ${snapshot.stats.entropyIdx.toFixed(4)}.`;

  return `${intro} ${modeLine} ${anomalyLine} ${focusLine}`.replace(/\s+/g, " ").trim();
}
