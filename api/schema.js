import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLString,
    GraphQLInt,
    GraphQLID,
    graphql,
    
}
from "graphql"
const bcrypt = require("bcryptjs")
import {signUpHandle} from "./helpers/signUp"
import {login} from "./helpers/logIn"
import {sequelize} from "./db"
const UserType= new GraphQLObjectType({
    name: "UserType",
    fields: () => ({
        id: {
            type: GraphQLInt,
            resolve(user){
                return user.id
            } 
        },
        email:{
            type: GraphQLString,
            resolve(user){
                return user.email
            }
        },
        username: {
            type: GraphQLString,
            resolve(user){
                return user.username
            }
        },
        avatar:{
            type: GraphQLString,
            resolve(user){
                return user.avatar
            }
        },
        info:{
            type: GraphQLString,
            resolve(user){
                return user.info
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve(user){
                return sequelize.models.post.findAll({ where:{ userId : user.id}})
            }
        }
        
    })
}) 

const PostType = new GraphQLObjectType({
    name: "PostType",
    fields: () => ({
        id:{
            type: GraphQLInt,
            resolve(post){
               return post.id
            }
        },
        caption:{
            type:GraphQLString,
            resolve(post){
                return post.caption
            }
        },
        userId: {
            type: GraphQLInt,
            resolve(post){
                return post.userId
            }
        
        },
        image: {
            type: GraphQLString,
            resolve(post){
                return post.image
            }
        },
        user:{
            type: UserType,
            resolve(post){
                return sequelize.models.user.findOne({where: { id: post.userId}})
            }
        },
        hates:{
            type: new GraphQLList(HateType),
            resolve(post){
                return sequelize.models.hates.findAll({where: {postId: post.id}})
            }
        }
    
    })
})

const HateType = new GraphQLObjectType({
    name: "HateType",
    fields: ()=>({
        id:{
            type: GraphQLInt,
            resolve(hate){
                return hate.id
            }
        },
        userId:{
            type: GraphQLInt,
            resolve(hate){
                return hate.userId
            }
        },
        postId:{
            type: GraphQLInt,
            resolve(hate){
                return hate.postId
            }
        },
    })
})

const Mutation = new GraphQLObjectType({
    name:'Mutation',
    fields:() =>({
        addUser: {
            type: UserType,
            args:{
                username: {type: GraphQLString},
                email: {type: GraphQLString},
                password: {type: GraphQLString}
            },
             resolve(root, {email, password, username}){
                return signUpHandle({email, password, username})
            }
        },
        login : {
            type: UserType,
            args:{
                email:{type: GraphQLString},
                password: {type: GraphQLString}
            },
            resolve(root, {email, password}, req){
                return login({email, password, req})
            }
            
        },
        logout : {
            type: UserType,
            resolve(root, args, req){
                const {user}= req
                req.logout()
                return user
            }
        },
        createPost : {
            type: PostType,
            args: {
                caption : {type: GraphQLString},
                image: {type:GraphQLString}
            },
            resolve(root, {caption, image}, req){
                if(!req.user){throw new Error("Please log in")}
                return sequelize.models.post.create({ 
                    caption: caption,
                    image:image,
                    userId: req.user.id
                 })
            }
        },
        userUpdate: {
            type: UserType,
            args: {
                avatar:{type: GraphQLString},
                info:{type: GraphQLString}
            },
            resolve(root, {avatar, info},req){
                console.log(req.user.id)
               return sequelize.models.user.findOne({where: {id: req.user.id}})
               .then(res => res.update({avatar: avatar, info: info }))
               
            }
        },
        hatesAdd: {
            type: HateType,
            args:{
                postId: {type:GraphQLInt}
            },
            resolve(root,{postId},req){
                return sequelize.models.hates.findOne({where: {postId: postId, userId: req.user.id}})
                .then(res=>{
                    console.log("RESp",res)
                    if(res){return res.destroy()}
                    return sequelize.models.hates.create({postId: postId, userId: req.user.id})
                })
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
        users: {
            type: new GraphQLList(UserType),
            resolve(){
                return sequelize.models.user.findAll()
            }
            
        },
        userById: {
            type: UserType,
            args: {
                id: {type: GraphQLInt}
            },
            resolve(root,{id}){
                return sequelize.models.user.findOne({where: {id}})
            }
        },
        user: {
            type: UserType,
            resolve(root, args, req){
                return req.user
            }
        },
        posts:{
            type: new GraphQLList(PostType),
            resolve(){
                return sequelize.models.post.findAll({order: [['createdAt', "DESC"]]})
            }
        },
        hates:{
            type: new GraphQLList(HateType),
            args: {
                postId: {type:GraphQLInt}
            },
            resolve(root,{postId}){
                return sequelize.models.hates.findAll({where: {postId}})
            }
        }
        
    }) 
})




module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})