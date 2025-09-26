import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { addItem, deleteItem, editItem, getItemByCity, getItemById, getItemByShop, rating, searchItem } from '../controllers/item.controllers.js';
import { upload } from '../middlewares/multer.js';

const itemRouter = express.Router()

itemRouter.post("/add-item",isAuth,upload.single("image"),addItem)
itemRouter.put("/edit-item/:itemId",isAuth,upload.single("image"),editItem)
itemRouter.get("/get-by-id/:itemId",isAuth,getItemById)
itemRouter.get("/delete/:itemId",isAuth,deleteItem)
itemRouter.get("/get-by-city/:city",isAuth,getItemByCity)
itemRouter.get("/get-by-shop/:shopId",isAuth,getItemByShop)
itemRouter.get("/search-items",isAuth,searchItem)
itemRouter.post("/rating",isAuth,rating)
export default itemRouter;