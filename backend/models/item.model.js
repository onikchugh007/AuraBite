import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    category: {
        type: String,
        enum: ["Snacks",
            "Main Course",
            "Desserts",
            "Pizza",
            "Burgers",
            "Sandwiches",
            "South Indian",
            "North Indian",
            "Chinese",
            "Fast Food",
            "Others"
        ],
        required:true
    },
    price:{
        type:Number,
        min:0,
        required:true
    },
    foodType:{
        type:String,
        enum:["veg","non veg"],
        required:true
    },
    rating:{
        average:{type:Number,default:0},
        count:{type:Number,default:0}
    },
    dietaryTags: [{
        type: String,
        enum: [
            "diabetic-friendly",
            "low-sodium",
            "gluten-free",
            "keto",
            "nut-free",
            "high-protein",
            "vegan",
            "heart-healthy"
        ]
    }],
    nutritionInfo: {
        calories: { type: Number, default: 350 },
        carbsG: { type: Number, default: 35 },
        proteinG: { type: Number, default: 15 },
        fatG: { type: Number, default: 10 },
        sodiumMg: { type: Number, default: 280 },
        sugarG: { type: Number, default: 4 },
        glycemicIndex: { type: Number, default: 42 }
    }
}, { timestamps: true })

const Item=mongoose.model("Item",itemSchema)
export default Item