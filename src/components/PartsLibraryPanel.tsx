import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { PARTS_LIBRARY, type Part3D } from '@/lib/types'
import { useState } from 'react'

interface PartsLibraryPanelProps {
  onSelectPart: (part: Part3D) => void
  selectedPartId?: string
}

export function PartsLibraryPanel({ onSelectPart, selectedPartId }: PartsLibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const categories = Array.from(new Set(PARTS_LIBRARY.map(part => part.category)))
  
  const filteredParts = PARTS_LIBRARY.filter(part =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const partsByCategory = categories.map(category => ({
    category,
    parts: filteredParts.filter(part => part.category === category)
  })).filter(group => group.parts.length > 0)

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search parts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 pr-4">
          {partsByCategory.map(({ category, parts }) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-foreground">{category}</h3>
                <Badge variant="secondary" className="text-xs">{parts.length}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {parts.map((part) => (
                  <Card
                    key={part.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                      selectedPartId === part.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => onSelectPart(part)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl">{part.thumbnail}</div>
                      <div className="text-xs font-medium text-center">{part.name}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
