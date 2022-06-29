import { CannotBeSymbolError } from "@typegoose/typegoose/lib/internal/errors";
import { Console } from "console";
import { arrayBuffer } from "stream/consumers";
import { Service } from "typedi";
import { Repository } from "../interface/repository";
import { CarModel } from "../models/car";
import { userModel } from "../models/user";

@Service()
class CarRepository implements Repository{

    async find() {
        const find = await CarModel.find()
        return find;
    }

    async findById(id: string) {
        const convert = { "_id": id }
        const carfindById = await CarModel.findById(convert);
        return carfindById;
    }

    async insert(document: JSON) {
        const carInserts = await CarModel.insertMany(document);
        const firstDocument = carInserts[0]
        const userId = firstDocument?.userId
        console.log(firstDocument.userId)
        
        for(let i of carInserts){
            const insertUserModel = await userModel.updateMany({_id:userId},{
                $push:{productCars: i?.id}
            })
        }
        return carInserts;
    }

    async update(id: string, document: JSON) {
        const convert = { "_id": id }
        const carUbdate = await CarModel.updateMany(convert, document);
        return carUbdate;
    }

    async delete(id: string) {
        const convert = { "_id": id };
        const car = await CarModel.findById(id);
        
        const userId = car?.userId;
        const arrayC = await userModel.find({"_id":userId},{productCars:true});
        
        const arrayUpdate = arrayC.filter(p =>p.id == car?.id);
        console.log(arrayUpdate);
        const updateUser = await userModel.updateOne({"_id":userId},{$set:{productCars:arrayUpdate}});
        const carDelete = await CarModel.deleteMany(convert);
        return carDelete;

    }
        
        

        
        

}

export default CarRepository;