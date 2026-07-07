import { PARTICIPANTS } from "./constants";

export type Participant = (typeof PARTICIPANTS)[number];

export type Draft = {
  participantId: string | null;
  self: string[];
  peers: Record<string, string[]>;
  step: "landing" | "identity" | "self" | "peer" | "review" | "done" | "alreadySubmitted";
  peerIndex: number;
};

export type SubmissionPayload = {
  respondentId: string;
  self: string[];
  peers: Record<string, string[]>;
};

export type CompletionRow = {
  participantId: string;
  name: string;
  selfCount: number;
  peerTargetsComplete: number;
  totalCount: number;
  complete: boolean;
};

export type ResultTrait = {
  adjectiveId: string;
  label: string;
  votes: number;
};

export type ParticipantResult = {
  participantId: string;
  name: string;
  open: ResultTrait[];
  blind: ResultTrait[];
  unknownCount: number;
};
