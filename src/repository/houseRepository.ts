import { Service } from "typedi";
import { Repository } from "../interface/repository";
import { houseModel } from "../models/house";
import { userModel } from "../models/user";
import { CarModel } from "../models/car";

@Service()
class HouseRepository implements Repository{

    async find() {
        const find = await houseModel.find()
        return find;
    }

    async findById(id: string) {
        const convert = { "_id": id }
        const housefindById = await houseModel.findById(convert);
        console.log(convert);
        return housefindById;
    }

    async insert(document: JSON) {
        const houseInserts = await houseModel.insertMany(document);
        const firstDocument = houseInserts[0]
        const userId = firstDocument?.userId
        
        
        for(let i of houseInserts){
            const insertUserModel = await userModel.updateMany({_id:userId},{
                $push:{productHouses: i?.id}
            })
        }
        return houseInserts;
    }

    async update(id: string, document: JSON) {
        const convert = { "_id": id }
        const houseUbdate = await houseModel.updateMany(convert, document);
        return houseUbdate;
    }

    async delete(id: string) {
        const convert = { "_id": id };
        const house = await houseModel.findById(id);
        
        const userId = house?.userId;
        const arrayC = await userModel.find({"_id":userId},{productCars:true});
        
        const arrayUpdate = arrayC.filter(p =>p.id == house?.id);
        console.log(arrayUpdate);
        const updateUser = await userModel.updateOne({"_id":userId},{$set:{productCars:arrayUpdate}});
        const houseDelete = await houseModel.deleteMany(convert);
        return houseDelete;

    }
}

export default HouseRepository;