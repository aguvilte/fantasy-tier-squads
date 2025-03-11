"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Users, ShieldAlert, Shirt, ArrowUpDown, Search, Filter, Star, Heart, Trophy } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

// Types
type Player = {
  id: string;
  name: string;
  positionId: number;
  teamId: number;
  leagueId: string;
}

type Team = {
  id: string;
  name: string;
  leagueId: string;
  logo: string;
}

type PlayerStat = {
  minutes: number;
  played: boolean;
  position: number;
  goals: number;
  assists: number;
  goalsConceded: number;
  cleanSheet: boolean;
  saves: number;
  penaltySaves: number;
  penaltyMisses: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  points: number;
}

type SquadPoint = {
  squadId: number;
  points: number;
  rank: number;
  teamsWithSameRank: number;
  proof: string[];
}

type GameweekStats = {
  leagueId: string;
  gameWeek: number;
  root: string;
  squadPoints: SquadPoint[];
  playerStats: Record<string, PlayerStat>;
}

type GameweekSquad = {
  id: string;
  tokenId: string;
  owner: string;
  name: string;
  league: {
    id: string;
    name: string;
  };
  players: string[];
  lineupPriority: string;
  captain: string;
  viceCaptain: string;
}

type GameweekSquadsData = {
  data: {
    squads: GameweekSquad[];
  };
}

export function GameweekResults() {
  const [gameweekStats, setGameweekStats] = useState<GameweekStats | null>(null)
  const [gameweekSquads, setGameweekSquads] = useState<GameweekSquadsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<Record<string, Player>>({})
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [sortBy, setSortBy] = useState<'points' | 'name'>('points')
  const [searchTerm, setSearchTerm] = useState("")
  const [favoriteSquadIds, setFavoriteSquadIds] = useState<string[]>([])
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false)
  const [availableGameweeks, setAvailableGameweeks] = useState<number[]>([28]) // Default to gameweek 28
  const [selectedGameweek, setSelectedGameweek] = useState<number>(28)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For teams API, we'll still try to fetch
        try {
          const teamsResponse = await fetch("/api/teams")
          const teamsData = await teamsResponse.json()
          setPlayers(teamsData.players)
          setTeams(teamsData.teams)
        } catch (error) {
          console.warn("Could not fetch team data:", error)
          setPlayers({})
          setTeams({})
        }

        // Read data directly from specified file paths
        try {
          // Load gameweek stats from specified path
          const statsPath = `/snapshots/gameweek_${selectedGameweek}_stats.json`
          const statsResponse = await fetch(statsPath)
          
          if (!statsResponse.ok) {
            throw new Error(`Failed to load stats with status: ${statsResponse.status}`)
          }
          
          const statsData = await statsResponse.json()
          setGameweekStats(statsData)
          
          // Load gameweek squads from specified path
          const squadsPath = `/snapshots/gameweek_${selectedGameweek}_squads.json`
          const squadsResponse = await fetch(squadsPath)
          
          if (!squadsResponse.ok) {
            throw new Error(`Failed to load squads with status: ${squadsResponse.status}`)
          }
          
          const squadsData = await squadsResponse.json()
          setGameweekSquads(squadsData)
        } catch (error) {
          console.error("Error loading data from files:", error)
          // Create empty data structures instead of using mocks
          setGameweekStats({
            leagueId: "",
            gameWeek: selectedGameweek,
            root: "",
            squadPoints: [],
            playerStats: {}
          })
          setGameweekSquads({
            data: {
              squads: []
            }
          })
        }

        // Load favorite squads from localStorage
        const savedFavoriteSquads = localStorage.getItem('favoriteSquadIds')
        if (savedFavoriteSquads) {
          setFavoriteSquadIds(JSON.parse(savedFavoriteSquads))
        }

        // Hardcode available gameweeks - this could be dynamically determined
        // by checking which files exist in the /data/snapshots/ directory
        setAvailableGameweeks([28])

        setLoading(false)
      } catch (error) {
        console.error("Error in main fetch data function:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedGameweek])

  // Save favorite squads to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('favoriteSquadIds', JSON.stringify(favoriteSquadIds))
    } catch (error) {
      console.error("Error saving favorite squads to localStorage:", error)
    }
  }, [favoriteSquadIds])

  // Function to toggle squad as favorite
  const toggleFavorite = (squadId: string) => {
    setFavoriteSquadIds(prevIds => {
      if (prevIds.includes(squadId)) {
        return prevIds.filter(id => id !== squadId)
      } else {
        return [...prevIds, squadId]
      }
    })
  }

  // Function to get position name
  const getPositionName = (positionId: number): string => {
    switch (positionId) {
      case 0: return "Goalkeeper"
      case 1: return "Defender"
      case 2: return "Midfielder"
      case 3: return "Forward"
      default: return "Unknown"
    }
  }

  // Function to get position icon
  const getPositionIcon = (positionId: number) => {
    switch (positionId) {
      case 0:
      case 1:
        return <ShieldAlert className="h-4 w-4" />
      case 2:
      case 3:
        return <Shirt className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  // Function to determine if a player is in the starting lineup
  const isInStartingLineup = (lineupPriority: string, index: number): boolean => {
    const priorityHex = lineupPriority.startsWith("0x") ? lineupPriority.substring(2) : lineupPriority
    const playerPriority = priorityHex.substring(index * 2, index * 2 + 2)
    return playerPriority === "01"
  }

  // Function to get team logo
  const getTeamLogo = (teamId: number): string => {
    return teams[teamId]?.logo || ''
  }

  // Function to process and prepare squads with player data and points
  const processSquads = () => {
    if (!gameweekSquads || !gameweekStats) return []

    return gameweekSquads.data.squads.map(squad => {
      // Find squad points from gameweek stats
      const squadPointsData = gameweekStats.squadPoints.find(
        sp => parseInt(squad.tokenId) === sp.squadId
      )

      // Process players with their stats
      const processedPlayers = squad.players.map((playerId, index) => {
        const player = players[playerId] || {
          id: playerId,
          name: `Unknown Player (${playerId.substring(0, 8)}...)`,
          positionId: 99,
          teamId: 0,
          leagueId: "",
        }

        // Get player stats for this gameweek
        const playerStat = gameweekStats.playerStats[playerId] || {
          points: 0,
          minutes: 0,
          played: false,
          position: player.positionId,
          goals: 0,
          assists: 0,
          goalsConceded: 0,
          cleanSheet: false,
          saves: 0,
          penaltySaves: 0,
          penaltyMisses: 0,
          yellowCards: 0,
          redCards: 0,
          ownGoals: 0
        }

        const isStarting = isInStartingLineup(squad.lineupPriority, index)
        const isCaptain = playerId === squad.captain
        const isViceCaptain = playerId === squad.viceCaptain

        // Calculate adjusted points (double for captain if they played)
        let adjustedPoints = playerStat.points
        if (isCaptain && playerStat.played) {
          adjustedPoints *= 2
        }

        return {
          ...player,
          ...playerStat,
          isStarting,
          isCaptain,
          isViceCaptain,
          adjustedPoints
        }
      })

      // Sort players by position
      const sortedPlayers = [...processedPlayers].sort((a, b) => {
        // First by starting status
        if (a.isStarting !== b.isStarting) {
          return a.isStarting ? -1 : 1
        }
        // Then by position
        return a.positionId - b.positionId
      })

      // Calculate total points - MODIFIED to only count starting players
      const totalPoints = squadPointsData?.points || 
        processedPlayers
          .filter(p => p.isStarting)
          .reduce((sum, player) => sum + player.adjustedPoints, 0)

      return {
        ...squad,
        processedPlayers: sortedPlayers,
        totalPoints,
        rank: squadPointsData?.rank || 0,
        isFavorite: favoriteSquadIds.includes(squad.id)
      }
    })
  }

  // Process and filter squads
  const processedSquads = processSquads()
  const filteredSquads = processedSquads.filter(squad => {
    // Apply favorite filter
    if (showFavoriteOnly && !squad.isFavorite) {
      return false
    }
    
    // Apply search filter
    return squad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      squad.processedPlayers.some(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  })

  // Sort squads
  const sortedSquads = [...filteredSquads].sort((a, b) => {
    if (sortBy === 'points') {
      // Sort by points (descending)
      return b.totalPoints - a.totalPoints
    } else {
      // Sort by name (ascending)
      return a.name.localeCompare(b.name)
    }
  })

  if (loading) {
    return (
      <div className="w-full py-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Gameweek Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white">
            Gameweek Results
            <span className="ml-4 text-lg text-white/70">
              Total Teams: {filteredSquads.length}
            </span>
          </h2>
          
          {/* Gameweek Selector */}
          <Select value={selectedGameweek.toString()} onValueChange={(value) => setSelectedGameweek(parseInt(value))}>
            <SelectTrigger className="w-40 bg-white/20 text-white border-none">
              <SelectValue placeholder="Gameweek" />
            </SelectTrigger>
            <SelectContent>
              {availableGameweeks.map(gw => (
                <SelectItem key={gw} value={gw.toString()}>Gameweek {gw}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">          
          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-white whitespace-nowrap">Sort by:</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'points' | 'name')}>
              <SelectTrigger className="w-32 bg-white/20 text-white border-none">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="name">Squad name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {sortedSquads.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg text-center">
          <h3 className="text-xl font-medium mb-2">No teams found</h3>
          <p className="text-gray-600">
            {showFavoriteOnly 
              ? "You haven't marked any teams as favorites yet."
              : `No teams match "${searchTerm}"`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSquads.map((squad) => (
            <Card key={squad.id} className="overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg border-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <span>{squad.name}</span>
                  
                  {/* Points Display */}
                  <span className="ml-auto flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-700 text-white hover:bg-green-00">
                      {squad.totalPoints} pts
                    </Badge>
                    
                    {/* Show rank if available */}
                    {/* {squad.rank > 0 && (
                      <Badge variant="outline" className="border-gray-300">
                        Rank #{squad.rank}
                      </Badge>
                    )} */}
                  </span>
                </CardTitle>
                <CardDescription>
                  Owner: {squad.owner.substring(0, 6)}...{squad.owner.substring(38)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" /> Squad Performance
                  </h3>
                  
                  {/* Group players by position */}
                  {[0, 1, 2, 3].map((positionId) => {
                    const positionPlayers = squad.processedPlayers.filter(p => p.positionId === positionId)
                    if (positionPlayers.length === 0) return null

                    return (
                      <div key={positionId} className="mb-3">
                        <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          {getPositionIcon(positionId)} {getPositionName(positionId)}s
                        </h4>
                        <ul className="space-y-1 pl-5">
                          {positionPlayers.map((player) => (
                            <li key={player.id} className="text-sm flex items-center justify-between">
                              <div className="flex items-center">
                                {getTeamLogo(player.teamId) && (
                                  <span className="inline-block mr-2 relative w-4 h-4">
                                    <img 
                                      src={getTeamLogo(player.teamId)} 
                                      alt={`Team logo`} 
                                      className="w-full h-full object-contain"
                                      width={16} 
                                      height={16} 
                                    />
                                  </span>
                                )}
                                
                                <span className={`
                                  ${player.isStarting ? "font-medium" : "text-muted-foreground"}
                                `}>
                                  {player.name}
                                </span>
                                
                                {player.isCaptain && <Badge className="ml-2 bg-black text-white">C</Badge>}
                                {player.isViceCaptain && <Badge className="ml-2 bg-gray-600 text-white">VC</Badge>}
                              </div>
                              
                              {/* Show player points */}
                              <div>
                                {player.isStarting && (
                                  <Badge className="text-white bg-gray-500/50">
                                    {player.adjustedPoints} pts
                                  </Badge>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}