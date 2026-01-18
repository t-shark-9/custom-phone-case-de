import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Package,
  Truck,
  Shield,
  CheckCircle,
  Lock,
  Cube,
  Star,
  Gift
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Design, Order, CartItem } from '@/lib/types'
import { CASE_PRICE, getPhoneModel } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

interface BuyScreenProps {
  design: Design
  onBack: () => void
  onComplete: () => void
}

export function BuyScreen({ design, onBack, onComplete }: BuyScreenProps) {
  const [step, setStep] = useState<'review' | 'checkout' | 'success'>('review')
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [formData, setFormData] = useState({
    // Contact
    email: '',
    phone: '',
    // Shipping
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    country: 'Deutschland',
    zipCode: '',
    // Payment
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    // Options
    saveInfo: false,
    giftWrap: false,
  })

  const phoneModelSpec = getPhoneModel(design.phoneModel)
  const subtotal = CASE_PRICE * quantity
  const shipping = 0 // Free shipping
  const giftWrap = formData.giftWrap ? 3.99 : 0
  const tax = (subtotal + giftWrap) * 0.19 // German VAT
  const total = subtotal + shipping + giftWrap + tax

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.zipCode) {
      toast.error('Bitte alle Pflichtfelder ausfüllen')
      return
    }
    
    if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
      toast.error('Bitte Zahlungsinformationen eingeben')
      return
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate order
    const orderNumber = `CC-${Date.now().toString(36).toUpperCase()}`
    
    const cartItem: CartItem = {
      id: `item-${Date.now()}`,
      design: design,
      quantity: quantity,
      price: CASE_PRICE
    }
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      items: [cartItem],
      customer: {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        address: formData.address + (formData.apartment ? `, ${formData.apartment}` : ''),
        city: formData.city,
        state: '',
        zipCode: formData.zipCode,
        country: formData.country,
      },
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      designFiles: []
    }
    
    // Save order
    const existingOrders = JSON.parse(localStorage.getItem('admin-orders') || '[]')
    localStorage.setItem('admin-orders', JSON.stringify([newOrder, ...existingOrders]))
    
    setIsProcessing(false)
    setStep('success')
    
    toast.success(`Bestellung #${orderNumber} erfolgreich!`)
  }

  // Success Screen
  if (step === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-green-50 to-background flex items-center justify-center p-4"
      >
        <Card className="max-w-lg w-full p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={48} weight="bold" className="text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-2">Vielen Dank! 🎉</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Deine Bestellung wurde erfolgreich aufgegeben
          </p>
          
          <div className="bg-muted rounded-xl p-6 mb-6 text-left">
            <div className="flex items-center gap-4 mb-4">
              {design.thumbnail ? (
                <img src={design.thumbnail} alt="Design" className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Cube size={32} className="text-primary" />
                </div>
              )}
              <div>
                <p className="font-semibold">{design.name}</p>
                <p className="text-sm text-muted-foreground">{phoneModelSpec?.name}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center gap-3 text-sm">
              <Truck size={20} className="text-primary" />
              <div>
                <p className="font-medium">Lieferung in 5-7 Werktagen</p>
                <p className="text-muted-foreground">Versandbestätigung per E-Mail</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={onComplete} className="flex-1" size="lg">
              <ShoppingBag size={20} className="mr-2" />
              Weiter einkaufen
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Zurück zum Designer</span>
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock size={16} />
            <span>Sichere Bezahlung</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['Überprüfen', 'Bezahlen'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i === 0 ? 'bg-primary text-primary-foreground' : 
                step === 'checkout' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm ${i === 0 || step === 'checkout' ? 'font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {i < 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {step === 'review' ? (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {/* Product Review */}
                  <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Dein Design</h2>
                    
                    <div className="flex gap-6">
                      {/* Preview */}
                      <div className="w-32 h-40 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                        {design.thumbnail ? (
                          <img src={design.thumbnail} alt="Design" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <Cube size={48} className="text-primary mx-auto mb-2" />
                            <span className="text-xs text-muted-foreground">Vorschau</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{design.name}</h3>
                        <p className="text-muted-foreground mb-3">{phoneModelSpec?.name || design.phoneModel}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary">
                            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: design.caseColor }} />
                            {design.caseColor}
                          </Badge>
                          {design.parts?.length > 0 && (
                            <Badge variant="secondary">{design.parts.length} 3D-Teile</Badge>
                          )}
                          {design.decals?.length > 0 && (
                            <Badge variant="secondary">{design.decals.length} Aufkleber</Badge>
                          )}
                        </div>
                        
                        {/* Quantity */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">Anzahl:</span>
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => setQuantity(q => Math.max(1, q - 1))}
                              className="px-3 py-1 hover:bg-muted transition-colors"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 font-medium">{quantity}</span>
                            <button
                              onClick={() => setQuantity(q => q + 1)}
                              className="px-3 py-1 hover:bg-muted transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <p className="text-2xl font-bold">€{(CASE_PRICE * quantity).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">€{CASE_PRICE.toFixed(2)} pro Stück</p>
                      </div>
                    </div>
                  </Card>

                  {/* Extras */}
                  <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Extras</h2>
                    
                    <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.giftWrap}
                        onChange={(e) => handleInputChange('giftWrap', e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <Gift size={24} className="text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Geschenkverpackung</p>
                        <p className="text-sm text-muted-foreground">Elegante Box mit Schleife</p>
                      </div>
                      <span className="font-medium">+€3,99</span>
                    </label>
                  </Card>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { icon: <Truck size={24} />, text: 'Kostenloser Versand' },
                      { icon: <Shield size={24} />, text: '30 Tage Rückgabe' },
                      { icon: <Star size={24} />, text: 'Premium Qualität' },
                    ].map((badge, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-xl text-center">
                        <div className="text-primary">{badge.icon}</div>
                        <span className="text-sm font-medium">{badge.text}</span>
                      </div>
                    ))}
                  </div>

                  <Button onClick={() => setStep('checkout')} size="lg" className="w-full">
                    Weiter zur Kasse
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="checkout"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact */}
                    <Card className="p-6">
                      <h2 className="text-xl font-bold mb-4">Kontakt</h2>
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="email">E-Mail *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="deine@email.de"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefon (optional)</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+49 123 456789"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Shipping */}
                    <Card className="p-6">
                      <h2 className="text-xl font-bold mb-4">Lieferadresse</h2>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">Vorname *</Label>
                            <Input
                              id="firstName"
                              placeholder="Max"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Nachname *</Label>
                            <Input
                              id="lastName"
                              placeholder="Mustermann"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="address">Straße & Hausnummer *</Label>
                          <Input
                            id="address"
                            placeholder="Musterstraße 123"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="apartment">Zusatz (optional)</Label>
                          <Input
                            id="apartment"
                            placeholder="Wohnung, Etage, etc."
                            value={formData.apartment}
                            onChange={(e) => handleInputChange('apartment', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="zipCode">PLZ *</Label>
                            <Input
                              id="zipCode"
                              placeholder="12345"
                              value={formData.zipCode}
                              onChange={(e) => handleInputChange('zipCode', e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="city">Stadt *</Label>
                            <Input
                              id="city"
                              placeholder="Berlin"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="country">Land</Label>
                          <select
                            id="country"
                            value={formData.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg bg-background"
                          >
                            <option>Deutschland</option>
                            <option>Österreich</option>
                            <option>Schweiz</option>
                          </select>
                        </div>
                      </div>
                    </Card>

                    {/* Payment */}
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Zahlung</h2>
                        <div className="flex gap-2">
                          <img src="https://img.icons8.com/color/32/visa.png" alt="Visa" className="h-6" />
                          <img src="https://img.icons8.com/color/32/mastercard.png" alt="Mastercard" className="h-6" />
                          <img src="https://img.icons8.com/color/32/amex.png" alt="Amex" className="h-6" />
                        </div>
                      </div>
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="cardNumber">Kartennummer *</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                            maxLength={19}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardName">Name auf der Karte *</Label>
                          <Input
                            id="cardName"
                            placeholder="Max Mustermann"
                            value={formData.cardName}
                            onChange={(e) => handleInputChange('cardName', e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate">Gültig bis *</Label>
                            <Input
                              id="expiryDate"
                              placeholder="MM/JJ"
                              value={formData.expiryDate}
                              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                              maxLength={5}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                              id="cvv"
                              type="password"
                              placeholder="123"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange('cvv', e.target.value)}
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep('review')}
                        className="flex-1"
                      >
                        Zurück
                      </Button>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="flex-[2]"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Wird verarbeitet...
                          </>
                        ) : (
                          <>
                            <Lock size={18} className="mr-2" />
                            Jetzt kaufen - €{total.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <Card className="p-6 sticky top-20">
              <h3 className="font-bold text-lg mb-4">Bestellübersicht</h3>
              
              {/* Product */}
              <div className="flex gap-3 mb-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {design.thumbnail ? (
                    <img src={design.thumbnail} alt="Design" className="w-full h-full object-cover" />
                  ) : (
                    <Cube size={24} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{design.name}</p>
                  <p className="text-xs text-muted-foreground">{phoneModelSpec?.name}</p>
                  <p className="text-xs text-muted-foreground">Anzahl: {quantity}</p>
                </div>
                <p className="font-medium">€{subtotal.toFixed(2)}</p>
              </div>
              
              <Separator className="my-4" />
              
              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zwischensumme</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                {formData.giftWrap && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Geschenkverpackung</span>
                    <span>€{giftWrap.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versand</span>
                  <span className="text-green-600 font-medium">Kostenlos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MwSt. (19%)</span>
                  <span>€{tax.toFixed(2)}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Gesamt</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Shipping Info */}
              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3 text-sm">
                  <Truck size={20} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Lieferung in 5-7 Werktagen</p>
                    <p className="text-muted-foreground text-xs">Nach Produktion deines Designs</p>
                  </div>
                </div>
              </div>
              
              {/* Security */}
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <Shield size={14} />
                <span>SSL-verschlüsselte Zahlung</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
