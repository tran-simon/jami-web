/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */
import { useCallback, useMemo } from 'react';
import { NavigateOptions, useLocation, useNavigate, useParams } from 'react-router-dom';

import { UndefinedToOptional } from '../utils/utils';

export class RouteDescriptor<
  _UrlParams extends Record<string, string | undefined> | undefined = undefined,
  _QueryParams extends Record<string, string> | undefined = undefined,
  _State extends object | undefined = undefined,
  Route extends string = string
> {
  readonly route: Route;

  constructor(route: Route) {
    this.route = route;
  }
}

export const useRouteParams = <
  UrlParams extends Record<string, string | undefined> | undefined,
  QueryParams extends Record<string, string> | undefined,
  State extends object | undefined,
  Route extends string
>(
  _routeDescriptor: RouteDescriptor<UrlParams, QueryParams, State, Route>
) => {
  const { search, state } = useLocation();
  const urlParams = useParams<Exclude<UrlParams, undefined>>();

  return useMemo(() => {
    const queryParams = Object.fromEntries(new URLSearchParams(search)) as Partial<QueryParams>;
    return {
      queryParams,
      urlParams,
      state: state as State,
    };
  }, [search, urlParams, state]);
};

type RouteNavigator = {
  <
    UrlParams extends Record<string, string> | undefined,
    QueryParams extends Record<string, string> | undefined,
    State extends object | undefined = undefined,
    Route extends string = string
  >(
    routeDescriptor: RouteDescriptor<UrlParams, QueryParams, State, Route>,
    params:
      | (Omit<NavigateOptions, 'state'> &
          UndefinedToOptional<{
            urlParams: UrlParams;
            queryParams: QueryParams;
            state: State;
          }>)
      | undefined
  ): void;
  (to: string, options?: NavigateOptions): void;
  (delta: number): void;
};

export const useRouteNavigate = (): RouteNavigator => {
  const navigate = useNavigate();

  return useCallback(
    <
      UrlParams extends Record<string, string> | undefined,
      QueryParams extends Record<string, string> | undefined,
      State extends object | undefined = undefined,
      Route extends string = string
    >(
      routeDescriptor: RouteDescriptor<UrlParams, QueryParams, State, Route> | string | number,
      params?: Omit<NavigateOptions, 'state'> &
        UndefinedToOptional<{
          urlParams: UrlParams;
          queryParams: QueryParams;
          state: State;
        }>
    ) => {
      if (typeof routeDescriptor === 'number') {
        navigate(routeDescriptor);
        return;
      }
      if (typeof routeDescriptor === 'string') {
        navigate(routeDescriptor, params);
        return;
      }

      const { urlParams, queryParams, state, ...options } = params!;

      let newRoute: string = routeDescriptor.route;
      if (urlParams) {
        for (const [key, value] of Object.entries(urlParams)) {
          newRoute = newRoute.replace(`:${key}`, value ?? '');
        }
      }

      if (queryParams) {
        const queryParamValues = Object.entries(queryParams).reduce<string[]>((acc, [key, value]) => {
          acc.push(`${key}=${value}`);
          return acc;
        }, []);

        if (queryParamValues.length) {
          newRoute += '?' + queryParamValues.join('&');
        }
      }

      navigate(newRoute, {
        ...options,
        state,
      });
    },
    [navigate]
  );
};
