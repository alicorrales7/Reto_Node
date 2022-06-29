import { prop, getModelForClass, Ref } from "@typegoose/typegoose"
import { CarModel, Cars } from "./car"
import { Houses } from "./house"
import { Phones } from "./phone"


export class Users {

    @prop({ require: true })
    name: string

    @prop()
    sex: string

    @prop({ required: true })
    email: string

    @prop()
    phone: number

    @prop()
    adress: {
        'zip': number,
        "country": string,
        "location": string,
        "street": string,
        "number": number
    }

    @prop({ required: true })
    username: string

    @prop({ required: true, minlength: 8 })
    password: string

    @prop({ref: ()=> Cars })
    public productCars: Ref <Cars>[];

    @prop({ref: ()=> Houses })
    public productHouses: Ref <Houses>[];

    @prop({ref: ()=> Phones })
    public productPhones: Ref <Phones>[];


}

export const userModel = getModelForClass(Users)








