import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import type { Player, Team } from "@/lib/types"

export async function GET() {
  try {
    // Fetch data from the GraphQL API
    const response = await fetch("https://api.studio.thegraph.com/query/98078/fantasy-tier-gnosis/version/latest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify({
        query: `
          query GetSquads($skip: Int = 0, $first: Int = 50, $orderBy: Squad_orderBy, $orderDirection: OrderDirection, $where: Squad_filter, $block: Block_height, $subgraphError: _SubgraphErrorPolicy_! = deny) {
          squads(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
            subgraphError: $subgraphError
          ) {
            ...Squad
          }
        }

        fragment Squad on Squad {
          id
          tokenId
          owner
          name
          league {
            id
            name
          }
          players
          lineupPriority
          captain
          viceCaptain
        }
        `,
        variables: {
          where: {
            league: "0xd1006d96bbb6b5fb744959f390735d5be8126631",
          },
        },
      }),
    })

    const data = await response.json()

    // Read and parse the players CSV file
    const playersFilePath = path.join(process.cwd(), "data", "players.csv")
    const playersContent = fs.readFileSync(playersFilePath, "utf8")

    const playersData = parse(playersContent, {
      columns: true,
      skip_empty_lines: true,
    })

    // Read and parse the teams CSV file
    const teamsFilePath = path.join(process.cwd(), "data", "teams.csv")
    const teamsContent = fs.readFileSync(teamsFilePath, "utf8")

    const teamsData = parse(teamsContent, {
      columns: true,
      skip_empty_lines: true,
    })

    // Create a map of team IDs to team objects
    const teamsMap: Record<string, Team> = {}
    teamsData.forEach((team: any) => {
      teamsMap[team.id] = {
        id: team.id,
        name: team.team,
        leagueId: team.leagueId,
        logo: team.logo,
      }
    })

    // Create a map of player IDs to player objects
    const playersMap: Record<string, Player> = {}
    playersData.forEach((player: any) => {
      playersMap[player.id] = {
        id: player.id,
        name: player.name,
        positionId: Number.parseInt(player.positionId),
        teamId: Number.parseInt(player.teamId),
        leagueId: player.leagueId,
      }
    })

    return NextResponse.json({
      squads: data.data.squads,
      players: playersMap,
      teams: teamsMap,
    })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}