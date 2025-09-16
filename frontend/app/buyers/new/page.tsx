'use client'

import { BuyerForm } from '../BuyerForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function NewBuyerPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Buyer Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <BuyerForm />
        </CardContent>
      </Card>
    </div>
  )
}
