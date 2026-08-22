import { createSlice } from '@reduxjs/toolkit'

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
  },
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    updateOrderStatus: (state, action) => {
      if (state.currentOrder?._id === action.payload._id) {
        state.currentOrder = action.payload
      }
      const index = state.orders.findIndex(o => o._id === action.payload._id)
      if (index !== -1) {
        state.orders[index] = action.payload
      }
    },
  },
})

export const { setOrders, setCurrentOrder, setLoading, updateOrderStatus } = orderSlice.actions
export default orderSlice.reducer
