import {gql} from "@apollo/client"

export const POSTS = gql`
query Posts{
    posts{
        id
        caption
        image
        user{
            id
            username
            avatar
        }
        hates{
            id
            userId
            postId
        }
        comments{
            id
            userId
            postId
            comment
            createdAt
            user{
                id
                username
                avatar
            }
        }
    }
}
`

export const USER = gql`
query User{
    user{
        username
        email
        id
        avatar
    }
}
`

export const USER_BY_ID= gql`
    query User_By_Id($id: Int){
        userById(id: $id){
            id
            username
            avatar
            info
            posts{
                id
                image
            }
        }
    }
`
export const HATES= gql`
    query Hates($postId: Int){
        hates(postId: $postId){
            userId
        }
        
    }
`