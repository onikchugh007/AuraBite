import { createSlice } from '@reduxjs/toolkit'

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState: {
    restaurants: [],
    selectedRestaurant: null,
    loading: false,
  },
  reducers: {
    setRestaurants: (state, action) => {
      state.restaurants = action.payload
    },
    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setRestaurants, setSelectedRestaurant, setLoading } = restaurantSlice.actions
export default restaurantSlice.reducer
