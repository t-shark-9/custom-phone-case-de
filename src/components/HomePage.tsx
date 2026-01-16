import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Sparkle, Cube, Palette, Star, Truck, Shield, CreditCard, FolderOpen, CaretDown, MagnifyingGlass } from '@phosphor-icons/react'
import type { PhoneModel, PhoneModelSpec } from '@/lib/types'
import { CASE_PRICE, ENABLED_PHONE_MODELS, getUniqueSeries } from '@/lib/types'
import { useState, useMemo } from 'react'

interface HomePageProps {
  onStartDesigning: (model: PhoneModel) => void
  onViewCart: () => void
  onViewGallery?: () => void
  cartItemCount: number
}

// Featured products (shown prominently)
const FEATURED_MODELS: PhoneModel[] = ['iphone-14-pro-max', 'iphone-14-pro', 'iphone-14', 'iphone-13-pro-max']

const FEATURES = [
  {
    icon: <Palette size={32} />,
    title: 'Unlimited Colors',
    description: 'Choose from any color, gradient, or pattern',
  },
  {
    icon: <Sparkle size={32} />,
    title: 'Premium Textures',
    description: 'Carbon fiber, marble, wood grain & more',
  },
  {
    icon: <Cube size={32} />,
    title: '3D Decorations',
    description: 'Add hearts, stars, bumps, fidgets & more',
  },
]

const TRUST_BADGES = [
  { icon: <Truck size={24} />, text: 'Free Shipping' },
  { icon: <Shield size={24} />, text: '30-Day Returns' },
  { icon: <CreditCard size={24} />, text: 'Secure Checkout' },
]

function PhoneModelCard({ model, onSelect, featured = false }: { model: PhoneModelSpec; onSelect: () => void; featured?: boolean }) {
  const badges: string[] = []
  if (model.hasMagSafe) badges.push('MagSafe')
  if (model.hasDynamicIsland) badges.push('Dynamic Island')
  if (model.hasActionButton) badges.push('Action Button')
  if (model.hasCameraControl) badges.push('Camera Control')
  
  const isNew = model.series.includes('14')
  
  return (
    <Card className={`overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary ${featured ? '' : 'bg-card/50'}`}>
      <div className={`relative ${featured ? 'p-8' : 'p-4'} bg-gradient-to-br from-primary/5 to-primary/10`}>
        {isNew && (
          <Badge className="absolute top-2 right-2" variant="default">New</Badge>
        )}
        <div className={`${featured ? 'text-7xl' : 'text-5xl'} text-center`}>📱</div>
        <div className="text-center mt-2">
          <span className="text-xs text-muted-foreground">{model.width.toFixed(1)} × {model.height.toFixed(1)} × {model.depth.toFixed(1)} mm</span>
        </div>
      </div>
      <div className={`${featured ? 'p-6' : 'p-4'}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className={`${featured ? 'text-xl' : 'text-base'} font-bold text-foreground`}>{model.name}</h4>
            <p className="text-xs text-muted-foreground">{model.brand}</p>
          </div>
          <div className="text-right">
            <div className={`${featured ? 'text-2xl' : 'text-lg'} font-bold text-primary`}>${CASE_PRICE}</div>
          </div>
        </div>
        {featured && (
          <>
            <div className="flex flex-wrap gap-1 mb-4">
              {badges.slice(0, 3).map((badge, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </>
        )}
        <Button 
          className="w-full" 
          size={featured ? "lg" : "sm"}
          onClick={onSelect}
        >
          <Palette className="mr-2" size={featured ? 18 : 14} />
          Customize
        </Button>
      </div>
    </Card>
  )
}

export function HomePage({ onStartDesigning, onViewCart, onViewGallery, cartItemCount }: HomePageProps) {
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'Apple' | 'Samsung'>('all')
  const [selectedSeries, setSelectedSeries] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllModels, setShowAllModels] = useState(false)
  
  const series = useMemo(() => getUniqueSeries(), [])
  
  const filteredModels = useMemo(() => {
    return ENABLED_PHONE_MODELS.filter(model => {
      if (selectedBrand !== 'all' && model.brand !== selectedBrand) return false
      if (selectedSeries !== 'all' && model.series !== selectedSeries) return false
      if (searchQuery && !model.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [selectedBrand, selectedSeries, searchQuery])
  
  const featuredModels = useMemo(() => {
    return ENABLED_PHONE_MODELS.filter(m => FEATURED_MODELS.includes(m.id))
  }, [])
  
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Sparkle size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">CaseCanvas</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Custom Phone Cases</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Products
            </a>
            <a href="#all-models" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              All Models ({ENABLED_PHONE_MODELS.length})
            </a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {onViewGallery && (
              <Button variant="ghost" size="sm" onClick={onViewGallery} className="hidden sm:flex">
                <FolderOpen size={18} />
                <span className="ml-1">My Designs</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onViewCart} className="relative">
              <ShoppingCart size={20} />
              <span className="ml-2 hidden sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🎉 Now Supporting {ENABLED_PHONE_MODELS.length}+ Phone Models!
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Design Your Perfect
            <span className="text-primary"> Phone Case</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Create a unique, custom phone case in minutes. Choose colors, textures, 
            add 3D bumps, grooves, fidgets, and make it truly yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => onStartDesigning('iphone-14-pro-max')} className="text-lg px-8">
              <Sparkle className="mr-2" size={20} />
              Start Designing
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('all-models')?.scrollIntoView({ behavior: 'smooth' })}>
              Browse All Models
            </Button>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            {TRUST_BADGES.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                {badge.icon}
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Featured Models</h3>
            <p className="text-muted-foreground">Popular choices with precise Apple design specs</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {featuredModels.map((model) => (
              <PhoneModelCard 
                key={model.id} 
                model={model} 
                onSelect={() => onStartDesigning(model.id)}
                featured
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* All Models Section */}
      <section id="all-models" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-4">All Phone Models</h3>
            <p className="text-muted-foreground mb-6">Precise dimensions from Apple Accessory Design Guidelines</p>
            
            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text"
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm w-48"
                />
              </div>
              
              {/* Brand Filter */}
              <select 
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value as 'all' | 'Apple' | 'Samsung')
                  setSelectedSeries('all')
                }}
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="all">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
              </select>
              
              {/* Series Filter */}
              <select 
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="all">All Series</option>
                {series.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Showing {filteredModels.length} of {ENABLED_PHONE_MODELS.length} models
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(showAllModels ? filteredModels : filteredModels.slice(0, 10)).map((model) => (
              <PhoneModelCard 
                key={model.id} 
                model={model} 
                onSelect={() => onStartDesigning(model.id)}
              />
            ))}
          </div>
          
          {filteredModels.length > 10 && !showAllModels && (
            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => setShowAllModels(true)}>
                <CaretDown className="mr-2" size={16} />
                Show All {filteredModels.length} Models
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Endless Customization</h3>
            <p className="text-muted-foreground">Make your phone case as unique as you are</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <Card key={i} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">What Customers Say</h3>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={24} weight="fill" className="text-yellow-500" />
              ))}
            </div>
            <p className="text-muted-foreground">4.9 out of 5 based on 2,847 reviews</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', review: 'Love my custom case! The 3D decorations are so unique and the quality is amazing.', rating: 5 },
              { name: 'James K.', review: 'Super easy to design and it arrived faster than expected. Definitely ordering more!', rating: 5 },
              { name: 'Emily R.', review: 'The carbon fiber texture looks so premium. Gets compliments everywhere I go!', rating: 5 },
            ].map((review, i) => (
              <Card key={i} className="p-6">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Star key={j} size={16} weight="fill" className="text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-foreground mb-4">"{review.review}"</p>
                <p className="text-sm font-medium text-muted-foreground">— {review.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">Ready to Create?</h3>
          <p className="text-muted-foreground mb-8">
            Design your dream phone case in minutes. Free shipping on all orders!
          </p>
          <Button size="lg" onClick={() => onStartDesigning('iphone-16-pro')} className="text-lg px-8">
            <Sparkle className="mr-2" size={20} />
            Start Designing Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkle size={18} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">CaseCanvas</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 CaseCanvas. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
