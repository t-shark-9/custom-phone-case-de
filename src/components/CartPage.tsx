import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Trash, 
  Plus, 
  Minus,
  ShoppingBag,
  CreditCard,
  Package,
  Truck
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { CartItem } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

// Custom hook for local storage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

interface CartPageProps {
  onBack: () => void
}

export function CartPage({ onBack }: CartPageProps) {
  const [cart, setCart] = useLocalStorage<CartItem[]>('shopping-cart', [])
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'confirmation'>('cart')
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  })
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })

  const subtotal = (cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 0 ? 4.99 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setCart((currentCart) => 
      (currentCart || []).map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (itemId: string) => {
    setCart((currentCart) => (currentCart || []).filter(item => item.id !== itemId))
    toast.success('Item removed from cart')
  }

  const handleCheckout = () => {
    if (!cart || cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    setCheckoutStep('shipping')
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setCheckoutStep('payment')
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentInfo.cardNumber || !paymentInfo.cardName || !paymentInfo.expiryDate || !paymentInfo.cvv) {
      toast.error('Please fill in all payment details')
      return
    }
    
    toast.success('Processing order...', {
      description: 'Please wait while we confirm your order'
    })
    
    setTimeout(() => {
      setCheckoutStep('confirmation')
      toast.success('Order placed successfully!', {
        description: 'You will receive a confirmation email shortly'
      })
    }, 2000)
  }

  const handleNewOrder = () => {
    setCart([])
    setCheckoutStep('cart')
    setShippingInfo({
      fullName: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    })
    setPaymentInfo({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
    })
    onBack()
  }

  if (checkoutStep === 'confirmation') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-background p-4 lg:p-8 flex items-center justify-center"
      >
        <Card className="max-w-2xl w-full p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Package size={40} weight="duotone" className="text-accent-foreground" />
          </motion.div>
          
          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground text-lg mb-2">
            Thank you for your order, {shippingInfo.fullName}
          </p>
          <p className="text-muted-foreground mb-8">
            A confirmation email has been sent to {shippingInfo.email}
          </p>
          
          <div className="bg-muted rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Order Total</span>
              <span className="text-2xl font-bold">${total.toFixed(2)}</span>
            </div>
            <Separator className="mb-4" />
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Truck size={20} className="mt-1 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-foreground mb-1">Estimated Delivery</p>
                <p>Your custom phone case will be manufactured and shipped within 5-7 business days</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button onClick={handleNewOrder} size="lg" className="gap-2">
              <ShoppingBag size={20} />
              Continue Shopping
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (checkoutStep === 'payment') {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setCheckoutStep('shipping')}
            className="mb-6 gap-2"
          >
            <ArrowLeft size={20} />
            Back to Shipping
          </Button>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <CreditCard size={20} weight="duotone" className="text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold">Payment Information</h2>
                </div>
                
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                        maxLength={5}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                        maxLength={4}
                        type="password"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full gap-2" size="lg">
                    <CreditCard size={20} />
                    Complete Order - ${total.toFixed(2)}
                  </Button>
                </form>
              </Card>
            </div>
            
            <div>
              <Card className="p-6 sticky top-4">
                <h3 className="font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (checkoutStep === 'shipping') {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setCheckoutStep('cart')}
            className="mb-6 gap-2"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </Button>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Truck size={20} weight="duotone" className="text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold">Shipping Information</h2>
                </div>
                
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="10001"
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="United States"
                        value={shippingInfo.country}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    Continue to Payment
                  </Button>
                </form>
              </Card>
            </div>
            
            <div>
              <Card className="p-6 sticky top-4">
                <h3 className="font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items ({(cart || []).length})</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (estimated)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft size={20} />
              Back to Designer
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div>
              <h1 className="text-3xl font-bold">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {(cart || []).length} {(cart || []).length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
          
          {cart && cart.length > 0 && (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              ${total.toFixed(2)}
            </Badge>
          )}
        </div>

        {!cart || cart.length === 0 ? (
          <Card className="p-12 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={48} weight="duotone" className="text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Design your custom phone case to get started
              </p>
              <Button onClick={onBack} size="lg" className="gap-2">
                <ArrowLeft size={20} />
                Start Designing
              </Button>
            </motion.div>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Card className="p-6">
                      <div className="flex gap-6">
                        <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div 
                            className="w-20 h-28 rounded-lg shadow-lg"
                            style={{ backgroundColor: item.design.caseColor }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-lg mb-1">{item.design.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {item.design.phoneModel === 'iphone-14-pro' ? 'iPhone 14 Pro' : 'iPhone 16 Pro'} Case
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash size={20} />
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.design.parts.length > 0 && (
                              <Badge variant="secondary">
                                {item.design.parts.length} 3D {item.design.parts.length === 1 ? 'part' : 'parts'}
                              </Badge>
                            )}
                            {item.design.images.length > 0 && (
                              <Badge variant="secondary">
                                {item.design.images.length} {item.design.images.length === 1 ? 'image' : 'images'}
                              </Badge>
                            )}
                            {item.design.strokes.length > 0 && (
                              <Badge variant="secondary">
                                Hand-drawn
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={16} />
                              </Button>
                              <span className="font-medium w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus size={16} />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-sm text-muted-foreground">
                                  ${item.price.toFixed(2)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div>
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (estimated)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCheckout} 
                  className="w-full gap-2" 
                  size="lg"
                >
                  <CreditCard size={20} />
                  Proceed to Checkout
                </Button>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Truck size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Free Shipping</p>
                      <p>On orders over $50</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
