import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLString,
    GraphQLInt,
    GraphQLID,
    
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
        title:{
            type:GraphQLString,
            resolve(post){
                return post.title
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
            type: new GraphQLList(UserType),
            resolve(post){
                return sequelize.models.user.findAll({where: { id: post.userId}})
            }
        }
    
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
        user: {
            type: UserType,
            resolve(root, args, req){
                return req.user
            }
        },
        posts:{
            type: new GraphQLList(PostType),
            resolve(){
                return sequelize.models.post.findAll()
            }
        }
        
    }) 
})




module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})