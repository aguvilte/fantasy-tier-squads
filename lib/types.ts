export type Player = {
  id: string;
  name: string;
  positionId: number;
  teamId: number;
  leagueId: string;
}

export type Team = {
  id: string;
  name: string;
  leagueId: string;
  logo: string;
}

export type Squad = {
  id: string;
  name: string;
  owner: string;
  players: string[];
  lineupPriority: string;
  captain: string;
}