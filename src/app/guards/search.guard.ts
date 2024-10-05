import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { SearchStateService } from '../service/search-state.service';

@Injectable({
  providedIn: 'root',
})
export class SearchRedirectGuard implements CanActivate {
  constructor(
    private router: Router,
    private searchStateSrv: SearchStateService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const queryParams = route.queryParams;
    const searchParam = queryParams['search'];

    if (searchParam === 'true') {
      this.searchStateSrv.setSearchValid(true);
      return true;
    } else {
      this.searchStateSrv.setSearchValid(false);
      this.router.navigate(['/']);
      return false;
    }
  }
}
