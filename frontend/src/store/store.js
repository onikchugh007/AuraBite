import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
import restaurantReducer from './restaurantSlice'
import orderReducer from './orderSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    restaurants: restaurantReducer,
    orders: orderReducer,
  },
})
