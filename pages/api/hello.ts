// Next.js API route example
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
  version: string
  status: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ 
    name: 'DealershipAI API',
    version: '1.0.0',
    status: 'operational'
  })
}