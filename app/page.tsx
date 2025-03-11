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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlayerPopularity } from "./player-popularity"
import { GameweekStats } from "./gameweek-stats"

// Inline type definitions
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

type Squad = {
  id: string;
  name: string;
  owner: string;
  players: string[];
  lineupPriority: string;
  captain: string;
}

export default function Home() {
  const [squads, setSquads] = useState<Squad[]>([])
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<Record<string, Player>>({})
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')
  const [teamSearchTerm, setTeamSearchTerm] = useState("")
  const [playerSearchTerm, setPlayerSearchTerm] = useState("")
  const [searchMode, setSearchMode] = useState<'team' | 'player'>('team')
  const [favoriteTeamIds, setFavoriteTeamIds] = useState<string[]>([])
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false)
  const [showMyTeamDialog, setShowMyTeamDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'teams' | 'players' | 'gameweek'>('teams')
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const [gameweekStats, setGameweekStats] = useState<any>(null)

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Function to check screen size
      const checkScreenSize = () => {
        setIsLargeScreen(window.innerWidth >= 768) // 768px is typically md breakpoint
      }
      
      // Initialize on first render
      checkScreenSize()
      
      // Add event listener for window resize
      window.addEventListener('resize', checkScreenSize)
      
      // If screen is small on first load, default to 'teams' tab
      if (!isLargeScreen && activeTab === 'players') {
        setActiveTab('teams')
      }
      
      // Cleanup event listener on component unmount
      return () => window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/teams")
        const data = await response.json()
        setSquads(data.squads)
        setPlayers(data.players)
        setTeams(data.teams)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    // Load user preferences from localStorage
    const loadUserPreferences = () => {
      try {
        // Load favorite teams
        const savedFavoriteTeams = localStorage.getItem('favoriteTeamIds')
        if (savedFavoriteTeams) {
          setFavoriteTeamIds(JSON.parse(savedFavoriteTeams))
        }
        
        // Load sort order preference
        const savedSortOrder = localStorage.getItem('sortOrder')
        if (savedSortOrder && (savedSortOrder === 'ASC' || savedSortOrder === 'DESC')) {
          setSortOrder(savedSortOrder)
        }
        
        // Load active tab preference
        const savedActiveTab = localStorage.getItem('activeTab')
        if (savedActiveTab && (savedActiveTab === 'teams' || savedActiveTab === 'players' || savedActiveTab === 'gameweek')) {
          // Only set to 'players' if we're on a large screen
          if (savedActiveTab === 'players' && isLargeScreen) {
            setActiveTab('players')
          } else {
            setActiveTab('teams')
          }
        }
      } catch (error) {
        console.error("Error loading preferences from localStorage:", error)
      }
    }

    fetchData()
    loadUserPreferences()
  }, [isLargeScreen])

  useEffect(() => {
    const fetchGameweekStats = async () => {
      try {
        const response = await fetch('https://cdn.kleros.link/ipfs/QmTccyBT3do1rFNur7kojvJV7iueizCWCjMtDxCH51Jyvq/fantasy_tier_0xd1006d96bbb6b5fb744959f390735d5be8126631_28.json')
        const data = await response.json()
        setGameweekStats(data)
      } catch (error) {
        console.error("Error fetching gameweek stats:", error)
      }
    }

    fetchGameweekStats()
  }, [])

  // Save sort order to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sortOrder', sortOrder)
    } catch (error) {
      console.error("Error saving sort order to localStorage:", error)
    }
  }, [sortOrder])

  // Save favorite teams to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('favoriteTeamIds', JSON.stringify(favoriteTeamIds))
    } catch (error) {
      console.error("Error saving favorite teams to localStorage:", error)
    }
  }, [favoriteTeamIds])
  
  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('activeTab', activeTab)
    } catch (error) {
      console.error("Error saving active tab to localStorage:", error)
    }
  }, [activeTab])

  // Function to handle toggling a team as favorite
  const toggleFavorite = (teamId: string) => {
    setFavoriteTeamIds(prevIds => {
      // If team is already favorited, remove it
      if (prevIds.includes(teamId)) {
        return prevIds.filter(id => id !== teamId)
      } 
      // Otherwise add it to favorites
      else {
        return [...prevIds, teamId]
      }
    })
  }

  // Function to parse lineupPriority and determine if a player is in the starting lineup
  const isInStartingLineup = (lineupPriority: string, index: number): boolean => {
    const priorityHex = lineupPriority.startsWith("0x") ? lineupPriority.substring(2) : lineupPriority
    const playerPriority = priorityHex.substring(index * 2, index * 2 + 2)
    return playerPriority === "01"
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

  // Function to calculate team formation (e.g., 4-3-3)
  const calculateFormation = (players: Array<{ positionId: number; isStarting: boolean }>): string => {
    const positionCounts = [0, 0, 0, 0] // GK, DEF, MID, FWD

    players.forEach((player) => {
      if (player.isStarting && player.positionId >= 0 && player.positionId <= 3) {
        positionCounts[player.positionId]++
      }
    })

    return `${positionCounts[1]}-${positionCounts[2]}-${positionCounts[3]}`
  }

  // Function to get team logo
  const getTeamLogo = (teamId: number): string => {
    return teams[teamId]?.logo || '';
  }

  // Custom sorting function based on sort order
  const getSortedPlayers = (squadPlayers: any[]) => {
    return [...squadPlayers].sort((a, b) => {
      // First, sort by starting lineup (starting players first)
      if (a.isStarting !== b.isStarting) {
        return a.isStarting ? -1 : 1
      }

      // Then sort by position based on selected order
      if (sortOrder === 'ASC') {
        return a.positionId - b.positionId  // GK -> FWD (0->3)
      } else {
        return b.positionId - a.positionId  // FWD -> GK (3->0)
      }
    })
  }

  // Function to get sorted position IDs for rendering
  const getSortedPositionIds = () => {
    return sortOrder === 'ASC' 
      ? [0, 1, 2, 3]  // GK -> FWD
      : [3, 2, 1, 0]  // FWD -> GK
  }

  // Process all squad players for search
  const processSquadWithPlayers = (squad: Squad) => {
    const squadPlayers = squad.players.map((playerId, index) => {
      const player = players[playerId] || {
        id: playerId,
        name: `Unknown Player (${playerId.substring(0, 8)}...)`,
        positionId: 99,
        teamId: 0,
        leagueId: "",
      }

      const isStarting = isInStartingLineup(squad.lineupPriority, index)
      const isCaptain = playerId === squad.captain

      return {
        ...player,
        isStarting,
        isCaptain,
        index,
      }
    })

    return {
      ...squad,
      processedPlayers: squadPlayers,
      sortedPlayers: getSortedPlayers(squadPlayers),
      formation: calculateFormation(squadPlayers),
      isFavorite: favoriteTeamIds.includes(squad.id)
    }
  }

  // Process all squads with their players
  const processedSquads = squads.map(processSquadWithPlayers)

  // Filter squads based on search mode, term, and favorite filter
  const filteredSquads = processedSquads.filter(squad => {
    // First check if we're only showing favorites
    if (showFavoriteOnly && !squad.isFavorite) {
      return false
    }
    
    // Then apply search filters
    if (searchMode === 'team') {
      return squad.name.toLowerCase().includes(teamSearchTerm.toLowerCase())
    } else {
      // Check if any player in the squad matches the search term
      return squad.processedPlayers.some(player => 
        player.name.toLowerCase().includes(playerSearchTerm.toLowerCase())
      )
    }
  })

  // Count of squads that match the current search criteria
  const matchCount = filteredSquads.length
  // Count of favorite teams
  const favoriteCount = favoriteTeamIds.length

  // Función auxiliar para calcular los puntos del jugador
  const calculatePlayerPoints = (
    playerId: string, 
    isStarting: boolean, 
    isCaptain: boolean, 
    gameweekStats: any
  ) => {
    // Si el jugador no es titular, no mostramos puntos
    if (!isStarting) return null;

    // Si el jugador es titular pero no tiene stats, retorna 0 puntos
    const playerStats = gameweekStats?.playerStats[playerId];
    if (!playerStats) return {
      points: 0,
      basePoints: 0,
      isMultiplied: isCaptain,
      noStats: true // flag para identificar jugadores sin stats
    };

    // Si es capitán, los puntos se duplican
    const points = isCaptain ? playerStats.points * 2 : playerStats.points;

    return {
      points,
      basePoints: playerStats.points,
      isMultiplied: isCaptain,
      noStats: false
    };
  }

  // Función para calcular puntos totales del squad
  const calculateSquadTotalPoints = (
    squadPlayers: any[], 
    lineupPriority: string, 
    captain: string, 
    gameweekStats: any
  ) => {
    return squadPlayers.reduce((total, player, index) => {
      const isStarting = isInStartingLineup(lineupPriority, index);
      if (!isStarting) return total;

      const playerPoints = calculatePlayerPoints(player.id, isStarting, player.id === captain, gameweekStats);
      return total + (playerPoints?.points || 0);
    }, 0);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 py-10">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-white">Fantasy Teams</h1>
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
                  <Skeleton className="h-4 w-full mb-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-700 relative">
      <div className="container mx-auto py-10 relative z-10">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => {
              // Only allow switching to players tab on large screens
              if (value === 'players' && !isLargeScreen) {
                return
              }
              setActiveTab(value as 'teams' | 'players' | 'gameweek')
            }}
            className="w-full"
          >
            <TabsList className="bg-white/20 w-full md:w-auto">
              <TabsTrigger 
                value="teams" 
                className="data-[state=active]:bg-white/30 text-white data-[state=active]:text-white flex-1 md:flex-none"
              >
                <Users className="h-4 w-4 mr-2" />
                Fantasy Teams
              </TabsTrigger>
              <TabsTrigger 
                value="players" 
                className="data-[state=active]:bg-white/30 text-white data-[state=active]:text-white flex-1 md:flex-none"
              >
                <User className="h-4 w-4 mr-2" />
                Player Popularity
              </TabsTrigger>
              {/* <TabsTrigger 
                value="gameweek" 
                className="data-[state=active]:bg-white/30 text-white data-[state=active]:text-white flex-1 md:flex-none"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Gameweek Stats
              </TabsTrigger> */}
            </TabsList>
            
            <TabsContent value="teams" className="m-0">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <h1 className="text-3xl font-bold text-white">Fantasy Teams 
                    <span className="ml-4 text-lg text-white/70">
                      Total Teams: {matchCount} / {squads.length}
                    </span>
                  </h1>
                  
                  {/* Favorite Filter Toggle */}
                  <Button 
                    variant={showFavoriteOnly ? "secondary" : "outline"} 
                    className={`flex items-center gap-2 ${showFavoriteOnly ? "bg-white/30 text-white" : "bg-white/20 text-white border-white/30 hover:bg-white/30"}`}
                    onClick={() => setShowFavoriteOnly(!showFavoriteOnly)}
                  >
                    <Star className={`h-4 w-4 ${showFavoriteOnly ? "fill-white" : ""}`} />
                    {showFavoriteOnly ? "Show All" : `Favorites (${favoriteCount})`}
                  </Button>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* Search Tabs */}
                  <Tabs 
                    value={searchMode} 
                    onValueChange={(value) => setSearchMode(value as 'team' | 'player')}
                    className="w-full md:w-auto"
                  >
                    <div className="flex flex-col space-y-2">
                      <TabsList className="bg-white/20">
                        <TabsTrigger 
                          value="team" 
                          className="data-[state=active]:bg-white/30 text-white data-[state=active]:text-white"
                        >
                          Search by Team
                        </TabsTrigger>
                        <TabsTrigger 
                          value="player" 
                          className="data-[state=active]:bg-white/30 text-white data-[state=active]:text-white"
                        >
                          Search by Player
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="team" className="m-0">
                        <div className="relative w-full">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                          <Input
                            type="text"
                            placeholder="Search teams by name..."
                            value={teamSearchTerm}
                            onChange={(e) => setTeamSearchTerm(e.target.value)}
                            className="pl-10 bg-white/20 text-white border-none placeholder:text-white/60 w-full"
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="player" className="m-0">
                        <div className="relative w-full">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                          <Input
                            type="text"
                            placeholder="Search teams by player name..."
                            value={playerSearchTerm}
                            onChange={(e) => setPlayerSearchTerm(e.target.value)}
                            className="pl-10 bg-white/20 text-white border-none placeholder:text-white/60 w-full"
                          />
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                  
                  {/* Sort Order Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-white whitespace-nowrap">Sort by:</span>
                    <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'ASC' | 'DESC')}>
                      <SelectTrigger className="w-32 bg-white/20 text-white border-none">
                        <SelectValue placeholder="Sort Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASC">GK → FWD</SelectItem>
                        <SelectItem value="DESC">FWD → GK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {filteredSquads.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg text-center">
                  <h3 className="text-xl font-medium mb-2">No teams found</h3>
                  <p className="text-gray-600">
                    {showFavoriteOnly 
                      ? "You haven't marked any teams as favorites yet."
                      : searchMode === 'team' 
                        ? `No teams match "${teamSearchTerm}"`
                        : `No teams with players matching "${playerSearchTerm}"`
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSquads.map((squad) => {
                    // Get sorted position IDs
                    const sortedPositionIds = getSortedPositionIds()
                    
                    // Highlight matching players if in player search mode
                    const highlightedPlayers = squad.sortedPlayers.map(player => ({
                      ...player,
                      isHighlighted: searchMode === 'player' && 
                        playerSearchTerm !== "" && 
                        player.name.toLowerCase().includes(playerSearchTerm.toLowerCase())
                    }))

                    // Calcular puntos totales del squad
                    const totalSquadPoints = calculateSquadTotalPoints(
                      squad.processedPlayers,
                      squad.lineupPriority,
                      squad.captain,
                      gameweekStats
                    );

                    return (
                      <Card key={squad.id} className="overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg border-0">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2">
                            <span>{squad.name}</span>
                            {/* Star icon directly next to team name */}
                            <button 
                              className="text-yellow-500 hover:text-yellow-600 transition-colors"
                              onClick={() => toggleFavorite(squad.id)}
                              aria-label={squad.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star className={`h-5 w-5 ${squad.isFavorite ? "fill-yellow-500" : ""}`} />
                            </button>
                            <span className="ml-auto">
                              <Badge variant="secondary" className="bg-green-700 text-white hover:bg-green-800">
                                {squad.formation}
                              </Badge>
                            </span>
                          </CardTitle>
                          <CardDescription>
                            Owner: {squad.owner.substring(0, 6)}...{squad.owner.substring(38)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                              <Users className="h-4 w-4" /> Squad Players
                            </h3>

                            {/* Group players by position for better visualization */}
                            {sortedPositionIds.map((positionId) => {
                              const positionPlayers = highlightedPlayers.filter((p) => p.positionId === positionId)
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
                                            ${player.isHighlighted ? "bg-yellow-200 text-black px-1 rounded" : ""}
                                          `}>
                                            {player.name}
                                          </span>
                                          {player.isCaptain && <Badge className="ml-2 bg-black text-white">C</Badge>}
                                          {!player.isStarting && (
                                            <span className="ml-2 text-xs text-muted-foreground">(bench)</span>
                                          )}
                                        </div>
                                        
                                        {/* Mostrar puntos solo para jugadores titulares */}
                                        {gameweekStats && (
                                          <>
                                            {player.isStarting && (
                                              <div className="flex items-center gap-2">
                                                {player.isCaptain && (
                                                  <span className="text-xs text-muted-foreground">
                                                    ({gameweekStats.playerStats[player.id]?.points || 0} × 2)
                                                  </span>
                                                )}
                                                <Badge 
                                                  variant="outline" 
                                                  className={`${
                                                    !gameweekStats.playerStats[player.id] 
                                                      ? "bg-gray-50 text-gray-500 border-gray-200" // Gris para jugadores sin stats
                                                      : calculatePlayerPoints(player.id, player.isStarting, player.isCaptain, gameweekStats)?.points > 0 
                                                        ? "bg-green-50 text-green-700 border-green-200" 
                                                        : "bg-red-50 text-red-700 border-red-200"
                                                  }`}
                                                >
                                                  {calculatePlayerPoints(player.id, player.isStarting, player.isCaptain, gameweekStats)?.points || 0} pts
                                                </Badge>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Después de mostrar todos los jugadores, mostrar el total */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Total de la jornada:</span>
                              <Badge 
                                className="bg-blue-100 text-blue-800 border-blue-200 text-lg py-1 px-3"
                              >
                                {totalSquadPoints} pts
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
            
            {/* Only render the Players tab content if we're on a large screen */}
            {isLargeScreen && (
              <TabsContent value="players" className="m-0">
                <PlayerPopularity />
              </TabsContent>
            )}

            {/* <TabsContent value="gameweek" className="m-0">
              <GameweekStats players={players} teams={teams} squads={squads} />
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </div>
  )
}