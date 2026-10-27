import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { HealthResponse, HealthStatus, ItemInput, Me, PantryItem } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getGetHealthUrl: () => string;
/**
 * @summary Check API health
 */
export declare const getHealth: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthResponse>;
export declare const getGetHealthQueryKey: () => readonly ["/api/health"];
export declare const getGetHealthQueryOptions: <TData = Awaited<ReturnType<typeof getHealth>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHealth>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getHealth>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetHealthQueryResult = NonNullable<Awaited<ReturnType<typeof getHealth>>>;
export type GetHealthQueryError = ErrorType<unknown>;
/**
 * @summary Check API health
 */
export declare function useGetHealth<TData = Awaited<ReturnType<typeof getHealth>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHealth>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMeUrl: () => string;
/**
 * @summary Get the signed-in user and role
 */
export declare const getMe: (options?: Parameters<typeof customFetch>[1]) => Promise<Me>;
export declare const getGetMeQueryKey: () => readonly ["/api/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get the signed-in user and role
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getEnsureMyRoleUrl: () => string;
/**
 * @summary Assign the member role if none exists
 */
export declare const ensureMyRole: (options?: Parameters<typeof customFetch>[1]) => Promise<Me>;
export declare const getEnsureMyRoleMutationKey: () => readonly ["ensureMyRole"];
export declare const getEnsureMyRoleMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof ensureMyRole>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof ensureMyRole>>, TError, void, TContext>;
export type EnsureMyRoleMutationResult = NonNullable<Awaited<ReturnType<typeof ensureMyRole>>>;
export type EnsureMyRoleMutationError = ErrorType<void>;
/**
* @summary Assign the member role if none exists
*/
export declare const useEnsureMyRole: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof ensureMyRole>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof ensureMyRole>>, TError, void, TContext>;
export declare const getListItemsUrl: () => string;
/**
 * @summary List the signed-in user's pantry items
 */
export declare const listItems: (options?: Parameters<typeof customFetch>[1]) => Promise<PantryItem[]>;
export declare const getListItemsQueryKey: () => readonly ["/api/items"];
export declare const getListItemsQueryOptions: <TData = Awaited<ReturnType<typeof listItems>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListItemsQueryResult = NonNullable<Awaited<ReturnType<typeof listItems>>>;
export type ListItemsQueryError = ErrorType<void>;
/**
 * @summary List the signed-in user's pantry items
 */
export declare function useListItems<TData = Awaited<ReturnType<typeof listItems>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateItemUrl: () => string;
/**
 * @summary Add an item to the signed-in user's pantry
 */
export declare const createItem: (itemInput: ItemInput, options?: Parameters<typeof customFetch>[1]) => Promise<PantryItem>;
export declare const getCreateItemMutationKey: () => readonly ["createItem"];
export declare const getCreateItemMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createItem>>, TError, CreateItemMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createItem>>, TError, CreateItemMutationVariables, TContext>;
export type CreateItemMutationResult = NonNullable<Awaited<ReturnType<typeof createItem>>>;
export type CreateItemMutationBody = BodyType<ItemInput>;
export type CreateItemMutationError = ErrorType<void>;
export type CreateItemMutationVariables = {
    data: BodyType<ItemInput>;
};
/**
* @summary Add an item to the signed-in user's pantry
*/
export declare const useCreateItem: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createItem>>, TError, CreateItemMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createItem>>, TError, CreateItemMutationVariables, TContext>;
export declare const getDeleteItemUrl: (id: number) => string;
/**
 * @summary Delete the signed-in user's item
 */
export declare const deleteItem: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteItemMutationKey: () => readonly ["deleteItem"];
export declare const getDeleteItemMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteItem>>, TError, DeleteItemMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteItem>>, TError, DeleteItemMutationVariables, TContext>;
export type DeleteItemMutationResult = NonNullable<Awaited<ReturnType<typeof deleteItem>>>;
export type DeleteItemMutationError = ErrorType<void>;
export type DeleteItemMutationVariables = {
    id: number;
};
/**
* @summary Delete the signed-in user's item
*/
export declare const useDeleteItem: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteItem>>, TError, DeleteItemMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteItem>>, TError, DeleteItemMutationVariables, TContext>;
export declare const getListAdminItemsUrl: () => string;
/**
 * @summary List all items for administrators
 */
export declare const listAdminItems: (options?: Parameters<typeof customFetch>[1]) => Promise<PantryItem[]>;
export declare const getListAdminItemsQueryKey: () => readonly ["/api/admin/items"];
export declare const getListAdminItemsQueryOptions: <TData = Awaited<ReturnType<typeof listAdminItems>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminItemsQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminItems>>>;
export type ListAdminItemsQueryError = ErrorType<void>;
/**
 * @summary List all items for administrators
 */
export declare function useListAdminItems<TData = Awaited<ReturnType<typeof listAdminItems>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map