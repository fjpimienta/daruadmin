import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ACTIVE_EMAIL_USER, ACTIVE_USER, BLOCK_USER, REGISTER_USER, UPDATE_USER } from 'src/app/@graphql/operations/mutation/user';
import { USERS_ID_QUERY, USERS_LIST_QUERY } from 'src/app/@graphql/operations/query/users';
import { ApiService } from 'src/app/@graphql/services/api.service';
import { map } from 'rxjs/operators';
import { IUser } from '@core/interfaces/user.interface';
import { ACTIVE_FILTERS } from '@core/constants/filters';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends ApiService {

  constructor(apollo: Apollo) {
    super(apollo);
  }

  getUsers(page: number = 1, itemsPage: number = 10, filterActiveValues: ACTIVE_FILTERS = ACTIVE_FILTERS.ACTIVE) {
    return this.get(USERS_LIST_QUERY, {
      include: true, itemsPage, page, filterActiveValues
    }).pipe(map((result: any) => {
      return result.users;
    }));
  }

  register(user: IUser) {
    return this.set(REGISTER_USER, {
      user,
      include: false
    }).pipe(
      map((result: any) => {
        return result.register;
      })
    );
  }

  update(user: IUser) {
    return this.set(
      UPDATE_USER,
      {
        user,
        include: false
      }, {}).pipe(map((result: any) => {
        return result.updateUser;
      })
      );
  }

  active(token: string, password: string) {
    const user = JSON.parse(atob(token.split('.')[1])).user;
    return this.set(ACTIVE_USER, {
      id: user.id,
      password
    }, {
      headers: new HttpHeaders({
        Authorization: token
      })
    }).pipe(map((result: any) => {
      return result.activeUserAction;
    }));
  }

  unblock(id: string, unblock: boolean = false, admin: boolean = false) {
    return this.set(
      BLOCK_USER,
      {
        id,
        unblock,
        admin
      }, {}).pipe(map((result: any) => {
        return result.blockUser;
      })
      );
  }

  sendEmailActive(id: string, email: string, admin: boolean) {
    return this.set(
      ACTIVE_EMAIL_USER, {
      id,
      email,
      admin
    }).pipe(map((result: any) => {
      return result.activeUserEmail;
    }));
  }

  next() {
    return this.get(
      USERS_ID_QUERY, {}, {}, false
    ).pipe(map((result: any) => {
      return result.userId.userId;
    }));
  }
}







// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

// import { User } from '../models/auth.models';

// @Injectable({ providedIn: 'root' })
// export class UserProfileService {
//     constructor(private http: HttpClient) { }

//     getAll(page: number = 1, itemsPage: number = 10) {
//         return this.http.get<User[]>(`/api/login`);
//     }

//     register(user: User) {
//         return this.http.post(`/users/register`, user);
//     }
// }
