import { ADJECTIVES, PARTICIPANTS, REQUIRED_PEER_COUNT, REQUIRED_SELF_COUNT, TOP_RESULT_COUNT } from "./constants";
import type { CompletionRow, ParticipantResult, ResultTrait } from "./types";

type ResponseRow = {
  respondent_id: string;
  target_id: string;
  adjective_id: string;
  response_type: "self" | "peer";
};

const adjectiveById = new Map<string, string>(ADJECTIVES.map((adjective) => [adjective.id, adjective.label]));

export function buildCompletion(rows: ResponseRow[]): CompletionRow[] {
  return PARTICIPANTS.map((participant) => {
    const selfCount = rows.filter(
      (row) =>
        row.respondent_id === participant.id && row.target_id === participant.id && row.response_type === "self"
    ).length;

    const peerTargetsComplete = PARTICIPANTS.filter((target) => target.id !== participant.id).filter((target) => {
      const count = rows.filter(
        (row) =>
          row.respondent_id === participant.id && row.target_id === target.id && row.response_type === "peer"
      ).length;
      return count === REQUIRED_PEER_COUNT;
    }).length;

    const totalCount = rows.filter((row) => row.respondent_id === participant.id).length;

    return {
      participantId: participant.id,
      name: participant.name,
      selfCount,
      peerTargetsComplete,
      totalCount,
      complete: selfCount === REQUIRED_SELF_COUNT && peerTargetsComplete === PARTICIPANTS.length - 1
    };
  });
}

export function buildResults(rows: ResponseRow[]): ParticipantResult[] {
  return PARTICIPANTS.map((participant) => {
    const selfSet = new Set(
      rows
        .filter(
          (row) =>
            row.respondent_id === participant.id &&
            row.target_id === participant.id &&
            row.response_type === "self"
        )
        .map((row) => row.adjective_id)
    );

    const voteCounts = new Map<string, number>();
    rows
      .filter((row) => row.target_id === participant.id && row.response_type === "peer")
      .forEach((row) => {
        voteCounts.set(row.adjective_id, (voteCounts.get(row.adjective_id) || 0) + 1);
      });

    const sortTraits = (traits: ResultTrait[]) =>
      traits
        .sort((a, b) => b.votes - a.votes || a.label.localeCompare(b.label, "hy"))
        .slice(0, TOP_RESULT_COUNT);

    const open = sortTraits(
      [...voteCounts.entries()]
        .filter(([id]) => selfSet.has(id))
        .map(([id, votes]) => ({ adjectiveId: id, label: adjectiveById.get(id) || id, votes }))
    );

    const blind = sortTraits(
      [...voteCounts.entries()]
        .filter(([id]) => !selfSet.has(id))
        .map(([id, votes]) => ({ adjectiveId: id, label: adjectiveById.get(id) || id, votes }))
    );

    const peerVoted = new Set(voteCounts.keys());
    const hidden = ADJECTIVES.filter((adjective) => selfSet.has(adjective.id) && !peerVoted.has(adjective.id));
    void hidden;

    const unknownCount = ADJECTIVES.filter((adjective) => !selfSet.has(adjective.id) && !peerVoted.has(adjective.id))
      .length;

    return {
      participantId: participant.id,
      name: participant.name,
      open,
      blind,
      unknownCount
    };
  });
}
