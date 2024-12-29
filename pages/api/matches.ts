import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const matches = await prisma.match.findMany({
          orderBy: { id: 'desc' },
          take: 50,
          include: {
            winner: true,
            loser: true,
          },
        })
        return res.status(200).json(matches)
      } catch (error) {
        return res.status(500).json({ error: 'Unable to fetch matches' })
      }

    case 'POST':
      try {
        const { winnerId, loserId } = req.body
        if (!winnerId || !loserId) {
          return res.status(400).json({ error: 'winnerId and loserId are required' })
        }

        const newMatch = await prisma.match.create({
          data: {
            winnerId: Number(winnerId),
            loserId: Number(loserId),
          },
          include: {
            winner: true,
            loser: true,
          },
        })

        return res.status(201).json(newMatch)
      } catch (error) {
        return res.status(500).json({ error: 'Unable to create match' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
