"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Search, Filter, Trophy, Users, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Main Component for Player Popularity Section
export function PlayerPopularity() {
  const [players, setPlayers] = useState<Record<string, Player>>({})
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [squads, setSquads] = useState<Squad[]>([])
  const [loading, setLoading] = useState(true)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState<string>("all")
  const [teamFilter, setTeamFilter] = useState<string>("all")

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

    fetchData()
  }, [])

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

  // Calculate player popularity
  const playerPopularity = useMemo(() => {
    if (!squads.length) return []
    
    // Object to track frequency of each player
    const frequency: Record<string, {
      playerId: string,
      count: number,
      captainCount: number,
      name: string,
      positionId: number,
      teamId: number
    }> = {}
    
    // Loop through all teams to count
    squads.forEach(squad => {
      // Count player appearances
      squad.players.forEach(playerId => {
        const player = players[playerId]
        if (!player) return
        
        if (!frequency[playerId]) {
          frequency[playerId] = {
            playerId,
            count: 0,
            captainCount: 0,
            name: player.name,
            positionId: player.positionId,
            teamId: player.teamId
          }
        }
        
        frequency[playerId].count++
        
        // Check if captain
        if (playerId === squad.captain) {
          frequency[playerId].captainCount++
        }
      })
    })
    
    // Convert to array and sort
    return Object.values(frequency)
  }, [squads, players])
  
  // Apply filters and sorting
  const filteredAndSortedPlayers = useMemo(() => {
    if (!playerPopularity.length) return []
    
    return playerPopularity
      // Filter by search term
      .filter(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (positionFilter === "all" || player.positionId === parseInt(positionFilter)) &&
        (teamFilter === "all" || player.teamId === parseInt(teamFilter))
      )
      // Sort by frequency
      .sort((a, b) => {
        if (sortDirection === 'desc') {
          return b.count - a.count
        } else {
          return a.count - b.count
        }
      })
  }, [playerPopularity, searchTerm, positionFilter, teamFilter, sortDirection])
  
  // Get unique list of teams for filter
  const uniqueTeams = useMemo(() => {
    return Object.values(teams).sort((a, b) => a.name.localeCompare(b.name))
  }, [teams])

  // Calculate statistics
  const mostSelectedPlayer = useMemo(() => {
    return playerPopularity.reduce((max, player) => 
      player.count > max.count ? player : max, 
      { count: 0, name: 'None' } as any
    )
  }, [playerPopularity])
  
  const mostSelectedCaptain = useMemo(() => {
    return playerPopularity.reduce((max, player) => 
      player.captainCount > max.captainCount ? player : max, 
      { captainCount: 0, name: 'None' } as any
    )
  }, [playerPopularity])

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Loading player popularity...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 mb-6">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" /> 
            Player Popularity
          </CardTitle>
          <CardDescription>
            Analysis of the most selected players across all teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-green-50 border-green-100">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium text-green-700">Total Unique Players</CardTitle>
              </CardHeader>
              <CardContent className="py-3 px-4">
                <p className="text-2xl font-bold">{playerPopularity.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-100">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium text-blue-700">Most Popular Player</CardTitle>
              </CardHeader>
              <CardContent className="py-3 px-4">
                <p className="text-xl font-bold">{mostSelectedPlayer.name}</p>
                <p className="text-sm text-blue-700">{mostSelectedPlayer.count} teams</p>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50 border-amber-100">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium text-amber-700">Most Frequent Captain</CardTitle>
              </CardHeader>
              <CardContent className="py-3 px-4">
                <p className="text-xl font-bold">{mostSelectedCaptain.name}</p>
                <p className="text-sm text-amber-700">{mostSelectedCaptain.captainCount} times captain</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search player by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-2">
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All positions</SelectItem>
                  <SelectItem value="0">Goalkeepers</SelectItem>
                  <SelectItem value="1">Defenders</SelectItem>
                  <SelectItem value="2">Midfielders</SelectItem>
                  <SelectItem value="3">Forwards</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All teams</SelectItem>
                  {uniqueTeams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortDirection === 'desc' ? 'Highest to lowest' : 'Lowest to highest'}
              </Button>
            </div>
          </div>

          {/* Players table */}
          {filteredAndSortedPlayers.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-12 text-center font-medium">#</TableHead>
                    <TableHead className="font-medium">Player</TableHead>
                    <TableHead className="font-medium">Position</TableHead>
                    <TableHead className="font-medium">Team</TableHead>
                    <TableHead className="text-right font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-4 w-4" />
                        <span>Selections</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <span>Captain</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPlayers.map((player, index) => (
                    <TableRow key={player.playerId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <TableCell className="font-medium text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 bg-gray-200">
                            <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span>{player.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          ${player.positionId === 0 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : ""}
                          ${player.positionId === 1 ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                          ${player.positionId === 2 ? "bg-green-50 text-green-700 border-green-200" : ""}
                          ${player.positionId === 3 ? "bg-red-50 text-red-700 border-red-200" : ""}
                        `}>
                          {getPositionName(player.positionId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {teams[player.teamId]?.logo && (
                            <img 
                              src={teams[player.teamId].logo} 
                              alt="Team logo" 
                              className="w-5 h-5 object-contain"
                              width={20} 
                              height={20} 
                            />
                          )}
                          {teams[player.teamId]?.name || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {player.count}
                      </TableCell>
                      <TableCell className="text-right">
                        {player.captainCount > 0 ? (
                          <div className="flex items-center justify-end gap-1">
                            <span>{player.captainCount}</span>
                            <Badge className="ml-1 bg-black text-white">C</Badge>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md border">
              <User className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-lg font-medium">No players found</p>
              <p className="text-gray-500">Adjust your filters to see results</p>
            </div>
          )}
          
          <div className="mt-4 text-right text-sm text-gray-500">
            Showing {filteredAndSortedPlayers.length} of {playerPopularity.length} players
          </div>
        </CardContent>
      </Card>
    </div>
  )
}