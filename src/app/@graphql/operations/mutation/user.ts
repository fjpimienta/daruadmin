import gql from 'graphql-tag';
import { USER_FRAGMENT } from 'src/app/@graphql/operations/fragment/user';

export const REGISTER_USER = gql`
   mutation addUser($user: UserInput!, $include: Boolean!) {
      register(user: $user) {
         status
         message
         user {
            ...UserObject
         }
      }
   }
   ${USER_FRAGMENT}
`;

export const UPDATE_USER = gql`
   mutation updateUser($user: UserInput!, $include: Boolean!) {
      updateUser(user: $user) {
         status
         message
         user {
            ...UserObject
         }
      }
   }
   ${USER_FRAGMENT}
`;

export const BLOCK_USER = gql`
   mutation blockUser($id: ID!, $unblock: Boolean, $admin: Boolean) {
      blockUser(id: $id, unblock: $unblock, admin: $admin) {
         status
         message
      }
   }
`;

export const ACTIVE_EMAIL_USER = gql`
   mutation activeUserEmail($id: ID!, $email: String!, $admin: Boolean) {
      activeUserEmail(
         id: $id,
         email: $email,
         admin: $admin
      )  {
            status
            message
      }
   }
`;

export const ACTIVE_USER = gql`
   mutation activeUser($id: ID!, $password: String!) {
      activeUserAction(
         id: $id,
         password: $password
      )  {
            status
            message
      }
   }
`;
