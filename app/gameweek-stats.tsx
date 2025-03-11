"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Clock, Star, Shield, Goal, Award } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import gameweek28Data from '@/data/gameweek/28.json'

type PlayerStats = {
  minutes: number
  played: boolean
  position: number
  goals: number
  assists: number
  goalsConceded: number
  cleanSheet: boolean
  saves: number
  penaltySaves: number
  penaltyMisses: number
  yellowCards: number
  redCards: number
  ownGoals: number
  points: number
}

type SquadPoints = {
  squadId: number
  points: number
  rank: number
  teamsWithSameRank: number
  proof: string[]
}

type GameweekStats = {
  leagueId: string
  gameWeek: number
  root: string
  squadPoints: SquadPoints[]
  playerStats: Record<string, PlayerStats>
}

export function GameweekStats({ 
  players, 
  teams, 
  squads, 
  viewMode,
  gameweek 
}: { 
  players: any, 
  teams: any, 
  squads: any[],
  viewMode: 'total' | 'gameweek',
  gameweek: number 
}) {
  const [stats, setStats] = useState<GameweekStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar directamente los datos del archivo local
    setStats(gameweek28Data)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle>Cargando estadísticas de la jornada...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle>Error al cargar las estadísticas</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  // Función auxiliar para calcular los puntos totales de un squad
  const calculateSquadPoints = (squadInfo: any, squadStats: any) => {
    return squadInfo.players.reduce((total: number, playerId: string, index: number) => {
      const playerStats = stats?.playerStats[playerId];
      if (!playerStats) return total;

      // Verificar si el jugador es titular
      const isStarting = isInStartingLineup(squadInfo.lineupPriority, index);
      if (!isStarting) return total;

      // Si es capitán, duplicar puntos
      const isCaptain = squadInfo.captain === playerId;
      const points = isCaptain ? playerStats.points * 2 : playerStats.points;

      return total + points;
    }, 0);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          {viewMode === 'total' ? 'Season Statistics' : `Gameweek ${gameweek} Statistics`}
        </CardTitle>
        <CardDescription>
          {viewMode === 'total' 
            ? 'Overall performance analysis across the season'
            : `Performance analysis for gameweek ${gameweek}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tabla de Puntos por Equipo */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Puntos por Equipo</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posición</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Equipos en misma posición</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.squadPoints.map((squad) => {
                // Encontrar el squad correspondiente usando el squadId (tokenId)
                const squadInfo = squads.find(s => parseInt(s.tokenId) === squad.squadId)
                
                return (
                  <TableRow key={squad.squadId}>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        #{squad.rank + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{squadInfo?.name || `Equipo #${squad.squadId}`}</TableCell>
                    <TableCell className="font-semibold">{squad.points}</TableCell>
                    <TableCell>{squad.teamsWithSameRank}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Estadísticas de Jugadores */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Estadísticas de Jugadores</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jugador</TableHead>
                <TableHead>Minutos</TableHead>
                <TableHead>Goles</TableHead>
                <TableHead>Asistencias</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(stats.playerStats).map(([playerId, playerStat]) => {
                const player = players[playerId]
                // Encontrar el squad que tiene este jugador
                const squadWithPlayer = squads.find(squad => 
                  squad.players.includes(playerId)
                );
                
                // Determinar si es titular y capitán
                const playerIndex = squadWithPlayer?.players.indexOf(playerId);
                const isStarting = playerIndex !== undefined ? 
                  isInStartingLineup(squadWithPlayer.lineupPriority, playerIndex) : 
                  false;
                const isCaptain = squadWithPlayer?.captain === playerId;

                // Solo mostrar jugadores titulares
                if (!isStarting) return null;

                return (
                  <TableRow key={playerId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {player?.name || 'Jugador Desconocido'}
                        {isCaptain && <Badge className="bg-black text-white">C</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {playerStat.minutes}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Goal className="h-4 w-4" />
                        {playerStat.goals}
                      </div>
                    </TableCell>
                    <TableCell>{playerStat.assists}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {isCaptain ? (
                          <div className="flex items-center gap-1">
                            <span>{playerStat.points * 2}</span>
                            <span className="text-xs">({playerStat.points} × 2)</span>
                          </div>
                        ) : (
                          playerStat.points
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {playerStat.cleanSheet && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            CS
                          </Badge>
                        )}
                        {playerStat.yellowCards > 0 && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            YC
                          </Badge>
                        )}
                        {playerStat.redCards > 0 && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            RC
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 