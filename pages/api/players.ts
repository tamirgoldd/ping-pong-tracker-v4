import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const players = await prisma.player.findMany()
        return res.status(200).json(players)
      } catch (error) {
        return res.status(500).json({ error: 'Unable to fetch players' })
      }

    case 'POST':
      try {
        const { name } = req.body
        if (!name) {
          return res.status(400).json({ error: 'Name is required' })
        }
        const newPlayer = await prisma.player.create({ data: { name } })
        return res.status(201).json(newPlayer)
      } catch (error) {
        return res.status(500).json({ error: 'Unable to create player' })
      }

    case 'DELETE':
      try {
        const { id } = req.query
        if (!id) {
          return res.status(400).json({ error: 'Player ID is required' })
        }
        await prisma.player.delete({ where: { id: Number(id) } })
        return res.status(200).json({ message: 'Player deleted successfully' })
      } catch (error) {
        return res.status(500).json({ error: 'Unable to delete player' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
