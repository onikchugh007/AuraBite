import express from "express"
import { createEditShop, getAllShops, getMyShop, getShopByCity, getShopById, getNearbyShops } from "../controllers/shop.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"

const shopRouter = express.Router()

shopRouter.get("/nearby", getNearbyShops)
shopRouter.get("/search-nearby", getNearbyShops)
shopRouter.get("/all", getAllShops)
shopRouter.get("/", getAllShops)
shopRouter.post("/create-edit", isAuth, upload.single("image"), createEditShop)
shopRouter.get("/get-my", isAuth, getMyShop)
shopRouter.get("/get-by-city/:city", getShopByCity)
shopRouter.get("/get-by-id/:id", getShopById)
shopRouter.get("/:id", getShopById)

export default shopRouter
